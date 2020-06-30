// Copyright (c) 2016 2FA Inc.

var LogEnabledTime = -1;
var LogEnabledTimer = 0;

trace("background -> load");

var SecuredApps = null;
var port = null;
var chrome;
var browser;
var safari;
var WebSSOAuth = false;

if ((browser == null || browser == undefined) && chrome != undefined)
	browser = chrome;

function trace(sText) {
	if (LogEnabledTime)
		console.log(sText);
}

function CompareMaskedString(sTextA, sTextB) {

	if (sTextA == sTextB)
		return true;

	var iMask = sTextA.indexOf("*");
	if (iMask == -1)
		return false;

	sTextA = sTextA.substring(0, iMask);

	return !sTextA.length || sTextB.startsWith(sTextA);
}

function OnAuthRequired(details) {
	trace("background -> onAuthRequired: " + details.url);
	for (var iTemplate = 0; SecuredApps && iTemplate < SecuredApps.length; iTemplate++) {
		trace("background -> onAuthRequired: # " + (iTemplate + 1) + " check url " + SecuredApps[iTemplate].url);
		if (!CompareMaskedString(SecuredApps[iTemplate].url, details.url))
			continue;
		for (var iElement = 0; iElement < SecuredApps[iTemplate].elements.length; iElement++) {
			var pElement = SecuredApps[iTemplate].elements[iElement];
			trace("background -> onAuthRequired: element " + pElement.find.type);
			if (pElement.find.type != "httpBasicAuth")
				continue;
			for (var iAction = 0; iAction < pElement.actions.length; iAction++) {
				trace("background -> onAuthRequired: action " + pElement.actions[iAction].type);
				if (pElement.actions[iAction].type == "httpBasicAuth") {
					trace("background -> onAuthRequired: credentials found for user " + pElement.actions[iAction].username);
					var pResult = { authCredentials: { username: pElement.actions[iAction].username, password: pElement.actions[iAction].password } };
					SecuredApps.splice(iTemplate, 1);
					return pResult;
				}
			}
		}
	}
	return null;
}

function OnBrowserMessage(request, sender, sendResponse) {
	var pResult = null;
	trace("background -> OnBrowserMessage: " + request.type + ", " + request.detail);
	if (request.type == "TwoFASSOConnect") {
		pResult = true;
	}
	else if (request.type == "TwoFASSOSetTemplates") {
		SecuredApps = request.detail;
		pResult = true;
	}
	else if (request.type == "TwoFASSOGetTemplates") {
		pResult = { Templates: SecuredApps, DebugTime: LogEnabledTime };
	}
	else if (request.type == "TwoFASSOEnableDebug") {
		LogEnabledTime = request.detail;
		if (LogEnabledTimer) {
			clearTimeout(LogEnabledTimer);
			LogEnabledTimer = 0;
		}
		if (LogEnabledTime > 0)
			LogEnabledTimer = setTimeout(function () { LogEnabledTimer = LogEnabledTime = 0; }, LogEnabledTime * 1000);
		pResult = true;
	}
	else if (request.type == "TwoFASSOAuthReq") {
		pResult = WebSSOAuth;
		trace("TwoFASSOAuthReq -> " + pResult);
	}
	else if (request.type == "TwoFASSOSaveForm" && WebSSOAuth) {
		var pForm = request.detail;
		//FormData[pForm.link] = pForm;
		var sFieldData = "", sCredData = "";
		for (var iIndex = 0; iIndex < pForm.fields.length; iIndex++) {
			sFieldData += (sFieldData != "" ? "\n" : "") + pForm.fields[iIndex];
			sCredData += (sCredData != "" ? "\n" : "") + pForm.creds[iIndex];
		}
		sFieldData = btoa(sFieldData);
		sCredData = btoa(sCredData);
		var sRequest = "SaveForm\n" + pForm.appname + "\n" + pForm.apppath + "\n" + pForm.wndclass + "\n" + pForm.wndtitle + "\n" + sFieldData + "\n" + sCredData;
		trace("TwoFASSOSaveForm -> " + pForm.appname + ", " + pForm.apppath);
		SendNativeMessage(sRequest, true);
	}
	else if (request.type == "TwoFASSOLoadForm") {
		var pForm = request.detail;
		//pResult = FormData[pForm.link];
		trace("TwoFASSOSaveForm -> " + pForm.appname + ", " + pForm.apppath);
		var sRequest = "LoadForm\n" + pForm.appname + "\n" + pForm.apppath + "\n" + pForm.wndclass + "\n" + pForm.wndtitle;
		SendNativeMessage(sRequest, true);
	}
	else
		pResult = false;
	sendResponse(pResult);
}

function SendActiveTabMessage(message) {
	browser.windows.getLastFocused({ populate: true }, function (window) {
		browser.tabs.query({ active: true, currentWindow: true }, function (tabs) {
			browser.tabs.sendMessage(tabs[0].id, message, function (response) {
				SendNativeMessage(response != undefined ? response : "ERROR: " + browser.runtime.lastError.message, false);
			});
		});
	});
}

function SendNativeMessage(sMessage, fIsWebSSO) {
	if (port == null)
		return;
	port.postMessage((fIsWebSSO ? "WebSSO\n" : "") + sMessage);
}

function OnNativeMessage(message) {
	trace("background -> onNativeMessage: " + message);
	if (message.websso == true) {
		OnNativeMessageWebSSO(message.message);
	}
	else {
		SendActiveTabMessage(message.message);
	}
}

function OnNativeMessageWebSSO(message) {
	trace("background -> OnNativeMessageWebSSO: " + message.type + ", result = " + message.result);
	if (message.type == "AuthResponse") {
		WebSSOAuth = message.result == true;
	}
	else if (message.type == "SaveFormResponse") {
	}
	else if (message.type == "LoadFormResponse") {
		message.fields = message.fields != "" ? atob(message.fields) : "";
		message.creds = message.creds != "" ? atob(message.creds) : "";
		SendActiveTabMessage(message);
	}
}

if (browser != undefined && browser != null) {
	browser.runtime.onMessage.addListener(OnBrowserMessage);
	browser.webRequest.onAuthRequired.addListener(OnAuthRequired, { urls: ["<all_urls>"] }, ["blocking"]);
}
else if (safari != undefined && safari != null) {
	var msgHandler = (function (fnCallback) {
		return function (event) {
			var msgTarget = event.target.page ? event.target.page : safari.self.tab;
			trace("safari::onMessage() -> " + msgTarget);
			var sender = {}, sendResponse;
			if (event.name.indexOf("callBack") > -1)
				sendResponse = function (msg) { msgTarget.dispatchMessage(event.name, msg); }
			else
				sendResponse = undefined;
			sender.tab = event.target.page ? event.target : undefined;
			if (sender.tab)
				sender.tab.id = event.target.id;
			fnCallback(event.message, sender, sendResponse);
		}
	})(OnBrowserMessage);
	if (safari.self.addEventListener)
		safari.self.addEventListener("message", msgHandler, false);
	else
		safari.application.addEventListener("message", msgHandler, false);
}

if (port == null && browser != undefined && browser != null) {
	trace("background -> connectNative = " + browser.runtime.connectNative);
	if (browser.runtime.connectNative != undefined) {
		port = browser.runtime.connectNative("com.rapididentity.chromechannel");
		trace("background -> connectNative = " + port);
		if (port != undefined) {
			port.onMessage.addListener(OnNativeMessage);
			SendNativeMessage("AuthRequest", true);
		}
	}
}


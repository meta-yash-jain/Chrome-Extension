
var LogEnabledTime = 0;

trace("content -> loaded: " + window.location.href + ", " + document.title);

var TwoFASSOTemplates = null;
var chrome;
var browser;
var safari;
var IsFirefox = navigator.userAgent.indexOf("Firefox") != -1;

var SSORequested = false;
var SSOSkipSubmit = false;
var SSOFieldTypes = ["text", "password", "email", "number", "tel"];

if ((browser == null || browser == undefined) && chrome != undefined)
	browser = chrome;

function trace(sText) {
	if (LogEnabledTime)
		console.log(sText);
}

function SendTwoFASSOMessage(sMessage, sType, pDetails, fFirefox) {
	trace("content -> SendTwoFASSOMessage(" + sMessage + ") fFirefox=" + (fFirefox == true ? "true" : "false"));
	var pData = { type: sType, detail: pDetails };
	var evt = document.createEvent("CustomEvent");
	evt.initCustomEvent(sMessage, true, true, fFirefox ? cloneInto(pData, document) : pData);
	document.dispatchEvent(evt);
}

function SendTwoFASSOResult(sType, pDetails) {
	SendTwoFASSOMessage("TwoFASSOResult", sType, pDetails, IsFirefox);
}

function SendBrowserMessage(sType, pDetails, fnResponse) {
	trace("content -> SendBrowserMessage(" + sType + ", " + pDetails + ")");
	if (browser != undefined && browser != null)
		browser.runtime.sendMessage({ type: sType, detail: pDetails }, fnResponse);
	else if (safari != undefined && safari != null) {
		var name = "callBack" + new Date();
		safari.self.addEventListener('message', function OnSafariResponse(msg) {
			trace("safari::response() -> " + name + " received: " + msg.name);
			if (msg.name === name) {
				safari.self.removeEventListener('message', OnSafariResponse, false);
				fnResponse(msg.message);
			}
		}, false);
		trace("safari::sendMessage() -> name: " + name);
		safari.self.tab.dispatchMessage(name, { type: sType, detail: pDetails });
	}
}

function SendElementEvent(pElement, sEvent) {
	if ("createEvent" in document) {
		var evt = document.createEvent("HTMLEvents");
		evt.initEvent(sEvent, true, false);
		pElement.dispatchEvent(evt);
	}
	else
		pElement.fireEvent("on" + sEvent);
}

function OnTwoFASSOEvent(msg) {
	if (msg.type == "TwoFASSOEnableDebug") {
		LogEnabledTime = msg.detail;
		trace("content -> TwoFASSOEnableDebug: " + msg.detail);
	}
	SendBrowserMessage(msg.type, msg.detail, function (response) { SendTwoFASSOResult(msg.type, response); });
}

function UpdateGlobalTemplates() {
	SendBrowserMessage("TwoFASSOSetTemplates", TwoFASSOTemplates, function (response) { });
}

function CheckTemplates() {
	SendBrowserMessage("TwoFASSOGetTemplates", "", OnTemplatesLoaded);
}

function FindWebElement(pDef, pWindow) {

	if (pWindow == undefined || pWindow == null)
		pWindow = window;

	var pElement = null;

	try {

		if (pDef.type == "id")
			pElement = pWindow.document.getElementById(pDef.value);
		else if (pDef.type == "name") {
			var pElements = pWindow.document.getElementsByName(pDef.value);
			pElement = pElements.length > 0 ? pElements[0] : null;
		}
		else if (pDef.type == "class") {
			var pElements = pWindow.document.getElementsByClassName(pDef.value);
			pElement = pElements.length > 0 ? pElements[0] : null;
		}
		else if (pDef.type == "tagname") {
			var pElements = pWindow.document.getElementsByTagName(pDef.value);
			pElement = pElements.length > 0 ? pElements[0] : null;
		}
		else if (pDef.type == "xpath")
			pElement = pWindow.document.evaluate(pDef.value, pWindow.document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
		else if (pDef.type == "selector")
			pElement = pWindow.document.querySelector(pDef.value);
		else
			return pElement;

		if (pElement != null)
			return pElement;

		for (var index = 0; index < pWindow.frames.length; index++) {
			if (pWindow.frames[index] == undefined || pWindow.frames[index] == null)
				continue;
			pElement = FindWebElement(pDef, pWindow.frames[index]);
			if (pElement != null)
				return pElement;
		}

	}
	catch (e) {
		trace("FindWebElement() -> exception: " + e.toString());
	}

	return null;
}

function PerformAction(pAction, pElement) {

	if (!pAction || pAction == undefined)
		return true;

	if (pAction.type == "text") {
		if (!pElement)
			return false;
		pElement.value = pAction.value;
		return true;
	}
	else if (pAction.type == "click") {
		if (!pElement)
			return false;
		pElement.disabled = false;
		pElement.click();
		return true;
	}
	else if (pAction.type == "select") {
		if (!pElement)
			return false;
		var iIndex = 0;
		if (pAction.value != undefined) {
			for (iIndex = 0; iIndex < pElement.options.length; iIndex++) {
				var option = pElement.options[iIndex];
				if (pAction.value == option.value || pAction.value == option.text) {
					pElement.selectedIndex = iIndex;
					break;
				}
			}
		}
		else if (pAction.byValue != undefined)
			pElement.value = pAction.byValue;
		else if (pAction.byDisplay != undefined) {
			for (iIndex = 0; iIndex < pElement.options.length && pElement.options[iIndex].text != pAction.byDisplay; iIndex++);
			if (iIndex != pElement.options.length && pElement.options.length > 0)
				pElement.selectedIndex = iIndex;
		}
		else
			return false;
		return true;
	}
	else if (pAction.type == "checkbox") {
		if (!pElement || pAction.selected == undefined)
			return false;
		pElement.checked = pAction.selected == "true";
		return true;
	}
	else if (pAction.type == "keypress") {
		return true;
	}
	else if (pAction.type == "enable") {
		if (!pElement)
			return false;
		pElement.disabled = pAction.value != undefined && pAction.value == false;
		return true;
	}
	else if (pAction.type == "sendEvent") {
		if (!pElement)
			return false;
		SendElementEvent(pElement, pAction.event);
		return true;
	}

	return true;
}

function RemoveTemplate(nTemplateID) {

	for (var iIndex = 0; iIndex < TwoFASSOTemplates.length; iIndex++) {

		trace("content -> RemoveTemplate: check template: " + nTemplateID + ", " + TwoFASSOTemplates[iIndex].ID);

		if (TwoFASSOTemplates[iIndex].ID == nTemplateID) {
			TwoFASSOTemplates.splice(iIndex, 1);
			UpdateGlobalTemplates();
			return true;
		}

	}

	trace("content -> RemoveTemplate: template not found " + nTemplateID);

	return false;
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

function OnDeferCheckTemplate(pTemplate) {

	trace("content -> OnDeferCheckTemplate: " + pTemplate + ", " + pTemplate.ID);

	CheckTemplate(pTemplate);

}

function CheckTemplate(pTemplate) {

	if (pTemplate.maxRetries == undefined)
		pTemplate.maxRetries = 0;
	if (pTemplate.retryInterval == undefined)
		pTemplate.retryInterval = 1;
	if (pTemplate.startElement == undefined)
		pTemplate.startElement = 0;
	if (pTemplate.startAction == undefined)
		pTemplate.startAction = 0;

	trace("content -> CheckTemplate: check template#" + pTemplate.ID + " - " + pTemplate.url + ", " + pTemplate.title + ", retryInterval:" + pTemplate.retryInterval + ", maxRetries:" + pTemplate.maxRetries);
	if (!CompareMaskedString(pTemplate.url, window.location.href))
		return false;

	if (pTemplate.title != undefined && !CompareMaskedString(pTemplate.title, document.title))
		return false;

	trace("content -> CheckTemplate: template found, proceeding with login, elements: " + pTemplate.elements.length);

	var iElement = 0;
	for (iElement = pTemplate.startElement; iElement < pTemplate.elements.length; iElement++) {

		var pElement = pTemplate.elements[iElement];

		trace("content -> CheckTemplate: check action: " + (iElement + 1));
		trace("content -> CheckTemplate: element def: " + pElement.find + "[ " + (pElement.find != undefined ? pElement.find.type + ", " + pElement.find.value : "") + "]");

		var pWebElement = FindWebElement(pElement.find);
		if (pElement.find != undefined && !pWebElement) {
			trace("content -> CheckTemplate: find element failed");
			break;
		}

		trace("content -> CheckTemplate: actions: " + pElement.actions);
		if (pElement.actions == undefined)
			continue;

		var iAction = 0;
		for (iAction = pTemplate.startAction; iAction < pElement.actions.length; iAction++) {
			var pAction = pElement.actions[iAction];
			trace("content -> CheckTemplate: action def: " + pAction + "[ " + (pAction != undefined ? pAction.type + ", " + pAction.value : "") + "]");
			if (pAction.type == "delay") {
				pTemplate.startElement = iElement;
				pTemplate.startAction = iAction + 1;
				setTimeout(OnDeferCheckTemplate, pAction.value, pTemplate);
				return false;
			}
			if (!PerformAction(pAction, pWebElement)) {
				trace("content -> CheckTemplate: perform action failed");
				break;
			}
		}

		if (iAction != pElement.actions.length)
			break;

		if (pTemplate.startAction != 0)
			pTemplate.startAction = 0;

	}

	pTemplate.startElement = 0;
	pTemplate.startAction = 0;

	if (iElement == pTemplate.elements.length) {
		trace("content -> CheckTemplate: template excuted");
		RemoveTemplate(pTemplate.ID);
		return true;
	}

	if (pTemplate.retryInterval != undefined) {
		trace("content -> CheckTemplate: Template.retryInterval = " + pTemplate.retryInterval);
		if (pTemplate.maxRetries > 0 || pTemplate.maxRetries == -1) {
			setTimeout(OnDeferCheckTemplate, pTemplate.retryInterval * 1000, pTemplate);
			if (pTemplate.maxRetries != -1)
				pTemplate.maxRetries--;
		}
		else
			RemoveTemplate(pTemplate.ID);
	}

	return false;
}

function OnTemplatesLoaded(pInfo) {

	if (pInfo)
		LogEnabledTime = pInfo.DebugTime;

	trace("content -> OnTemplatesLoaded: " + pInfo);
	if (!pInfo || pInfo == undefined)
		return;

	var pTemplates = pInfo.Templates;
	trace("content -> OnTemplatesLoaded: " + pTemplates + ", " + TwoFASSOTemplates);
	if (!pTemplates || pTemplates == undefined)
		return;

	var fFirstCheck = TwoFASSOTemplates == null;
	if (fFirstCheck)
		TwoFASSOTemplates = pTemplates;

	trace("content -> OnTemplatesLoaded: templates count = " + TwoFASSOTemplates.length);
	for (var iTemplate = 0; iTemplate < TwoFASSOTemplates.length; iTemplate++) {

		var pTemplate = TwoFASSOTemplates[iTemplate];
		if (fFirstCheck)
			pTemplate.ID = iTemplate + 1;

		if (CheckTemplate(pTemplate))
			iTemplate--;

	}

}

function GetNodeTreeXPath(node) {
	var paths = [];
	for (; node && (node.nodeType == 1 || node.nodeType == 3); node = node.parentNode) {
		var index = 0;
		if (node && node.id && !node.id.toString().startsWith("[object ")) {
			paths.splice(0, 0, '/*[@id="' + node.id + '"]');
			break;
		}
		for (var sibling = node.previousSibling; sibling; sibling = sibling.previousSibling) {
			if (sibling.nodeType == Node.DOCUMENT_TYPE_NODE)
				continue;
			if (sibling.nodeName == node.nodeName)
				++index;
		}
		var tagName = (node.nodeType == 1 ? node.nodeName.toLowerCase() : "text()");
		var pathIndex = (index ? "[" + (index + 1) + "]" : "");
		paths.splice(0, 0, tagName + pathIndex);
	}
	return paths.length ? "/" + paths.join("/") : null;
};

function IsStrEmpty(sValue) {
	return sValue == null || sValue == undefined || sValue == "";
}

function GetFormData(pFormElement, sURL, sTitle) {

	var sFormPath = GetNodeTreeXPath(pFormElement);
	var sFormName = IsStrEmpty(pFormElement.name) ? sFormPath : pFormElement.name;

	var pFormFields = new Array();
	var pFormCreds = new Array();

	pFormFields.push(sFormPath);
	pFormCreds.push(sFormName);

	for (var iElement = 0; iElement < pFormElement.elements.length; iElement++) {
		var pElement = pFormElement.elements[iElement];
		if (SSOFieldTypes.indexOf(pElement.type) != -1) {
			pFormFields.push(iElement + "\r" + GetNodeTreeXPath(pElement) + "\r" + pElement.name);
			pFormCreds.push(escape(pElement.value));
		}
	}

	var sAppName = "WebSSO: " + sTitle;

	return { appname: sAppName, apppath: sURL, wndclass: "", wndtitle: sTitle, fields: pFormFields, creds: pFormCreds };
}

function SetFormData(pFormData, fSubmit) {

	var pFormFields = pFormData.fields.split("\n");
	var pFormCreds = pFormData.creds.split("\n");

	var pFormField = pFormFields[0].split("\r");

	//var pFormElement = document.evaluate(pFormField[0], document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
	var pFormElement = FindWebElement({ type: "xpath", value: pFormField[0] }, window);
	if (!pFormElement || pFormElement.tagName.toLowerCase() != "form")
		return false;

	for (var iElement = 1; iElement < pFormFields.length; iElement++) {
		var pFormFieldDef = pFormFields[iElement].split("\r");
		var iFormElementIndex = pFormFieldDef[0];
		var pElement = iFormElementIndex < pFormElement.elements.length ? pFormElement.elements[iFormElementIndex] : null;
		var pElementByPath = document.evaluate(pFormFieldDef[1], document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
		if (pElementByPath != null && pElementByPath != pElement && pElementByPath.tagName.toLowerCase() == "input")
			pElement = pElementByPath;
		if (pElement == null || SSOFieldTypes.indexOf(pElement.type) == -1)
			continue;
		pElement.value = unescape(pFormCreds[iElement]);
		SendElementEvent(pElement, "change");
		trace(pElement.type + " = " + pElement.value);
	}

	var pSubmit = null;
	for (var iElement = 0; iElement < pFormElement.elements.length; iElement++) {
		var pElement = pFormElement.elements[iElement];
		if (pElement.type == "submit")
			pSubmit = pElement;
	}

	if (fSubmit) {
		SSOSkipSubmit = true;
		setTimeout(function () {
			if (pSubmit)
				pSubmit.click();
			else
				pFormElement.submit();
		}, 1 * 100);
	}

	return true;
}

function OnSubmitHandler() {
	trace("OnSubmitHandler(" + arguments + ")");
	if (SSOSkipSubmit)
		return;
	//if(confirm("RapidIdentitySSO: Do you want to save logon information?"))
	{
		var pSrcElement = arguments.length > 0 && arguments[0].srcElement != undefined ? arguments[0].srcElement : arguments[0];
		var pFormElement = pSrcElement.tagName.toLowerCase() == "form" ? pSrcElement : pSrcElement.form;
		if (pFormElement == undefined || !pFormElement) {
			pFormElement = pSrcElement;
			for (; pFormElement && pFormElement.tagName.toLowerCase() != "form"; pFormElement = pFormElement.parentElement);
		}
		if (pFormElement == undefined || !pFormElement)
			return;
		var pFormData = GetFormData(pFormElement, document.URL, document.title);
		SendBrowserMessage("TwoFASSOSaveForm", pFormData, function (response) { });
	}
	//return this.original(arguments);
	//return HTMLFormElement.prototype.original(arguments);
}

function OnClickHandler(evt) {
	trace("OnClickHandler()");
	var LoginText = ['log in', 'sign in', 'continue', 'submit', 'weiter', 'acces', '????', 'connexion', 'entrar', 'anmelden', 'accedi', 'valider', 'next'];
	var pElement = evt.srcElement;
	if (pElement.type == "submit" || /*pElement.type == "button" &&*/ LoginText.indexOf(pElement.innerText.toLowerCase()) != -1) {
		OnSubmitHandler(pElement);
		SSOSkipSubmit = true;
	}
}

function UpdateHandlers(pWindow, sType, fnHandler) {

	if (pWindow == undefined || pWindow == null)
		pWindow = window;

	try {
		pWindow.document.removeEventListener(sType, fnHandler);
		pWindow.document.addEventListener(sType, fnHandler);
		pWindow.document.body.removeEventListener(sType, fnHandler);
		pWindow.document.body.addEventListener(sType, fnHandler);
	}
	catch (e) {
	}
	for (var index = 0; index < pWindow.frames.length; index++) {
		if (pWindow.frames[index] == undefined || pWindow.frames[index] == null)
			continue;
		UpdateHandlers(pWindow.frames[index], sType, fnHandler);
	}

}

function OnUpdateHandlers() {
	if (!SSORequested && FindWebElement({ type: "tagname", value: "form" }, window)) {
		SSORequested = true;
		RequestWebSSO();
	}
	UpdateHandlers(window, "submit", OnSubmitHandler);
	UpdateHandlers(window, "click", OnClickHandler);
}

setInterval(OnUpdateHandlers, 1 * 1000);
//setTimeout(CheckTemplates, 1 * 1000);

CheckTemplates();

window.addEventListener("TwoFASSOConnect", OnTwoFASSOEvent);
window.addEventListener("TwoFASSOSetTemplates", OnTwoFASSOEvent);
window.addEventListener("TwoFASSOGetTemplates", OnTwoFASSOEvent);
window.addEventListener("TwoFASSOEnableDebug", OnTwoFASSOEvent);

window.document.addEventListener("submit", OnSubmitHandler);
window.document.body.addEventListener("click", OnClickHandler, true);

//HTMLFormElement.prototype.original = HTMLFormElement.prototype.submit;
//HTMLFormElement.prototype.submit = OnSubmitHandler;

function RequestWebSSO() {
	SendBrowserMessage("TwoFASSOLoadForm", { appname: "WebSSO: " + document.title, apppath: document.URL, wndclass: "", wndtitle: document.title }, function (response) {
		trace("response: " + response);
		if (response != null && response.fields != null) {
			if (confirm("RapidIdentitySSO: Do you want to apply saved form?")) {
				setTimeout(function () {
					SetFormData(response, true);
				}, 1 * 1000);
			}
		}
	});
}

if (browser != undefined && browser != null) {
	browser.runtime.onMessage.addListener(
		function (request, sender, sendResponse) {

			var sResult = "ERROR: invalid function: " + request.type;

			if (request.type == "GetCurrentURL") {
				sResult = window.location.href + "\n" + document.title;
			}
			else if (request.type == "GetElementFromPoint") {
				var pItem = document.elementFromPoint(request.posx, request.posy);
				if (pItem != null) {
					var rc = pItem.getBoundingClientRect();
					sResult = pItem.tagName + "\n" + pItem.id + "\n" + pItem.name + "\n" + rc.left + "\n" + rc.top + "\n" + rc.width + "\n" + rc.height + "\n" + window.location.href + "\n" + document.title;
				}
				else
					sResult = "ERROR: GetElementFromPoint item not found";
			}
			else if (request.type == "IsElementExists") {
				var pItem = document.getElementById(request.id);
				sResult = pItem != null ? "SUCCESS" : "ERROR: IsElementExists item not found: " + request.id;
			}
			else if (request.type == "SetElementValue") {
				var pItem = document.getElementById(request.id);
				if (pItem != null)
					pItem.value = request.value;
				sResult = pItem != null ? "SUCCESS" : "ERROR: SetElementValue item not found: " + request.id;
			}
			else if (request.type == "ClickElement") {
				var pItem = document.getElementById(request.id);
				if (pItem != null)
					pItem.click();
				sResult = pItem != null ? "SUCCESS" : "ERROR: ClickElement item not found: " + request.id;
			}
			else if (request.type == "LoadFormResponse") {
				if (request.result)
					SetFormData(request, true);
			}

			sendResponse(sResult);

		}
	);
}

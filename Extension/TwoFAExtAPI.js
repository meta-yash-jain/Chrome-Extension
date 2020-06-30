
var LogEnabledTime = 0;

function trace(sText)
{
	if(LogEnabledTime)
		console.log(sText);
}

var TwoFAExtClient = 
{

	Implementation: function()
	{
		trace("TwoFAExtClient::Implementation() -> " + navigator.userAgent);
		var pImpl = null;
		if(navigator.userAgent.indexOf("Chrome") != -1)
			pImpl = TwoFAExtClientChrome;
		else if(navigator.userAgent.indexOf("Firefox") != -1)
			pImpl = TwoFAExtClientChrome;
		else if(navigator.userAgent.indexOf("Safari") != -1)
			pImpl = TwoFAExtClientChrome;
		else if(navigator.userAgent.indexOf("Opera") != -1 || navigator.userAgent.indexOf("OPR") != -1)
			pImpl = TwoFAExtClientChrome;
		else if(navigator.userAgent.indexOf("MSIE") != -1 || !!document.documentMode)
			pImpl = TwoFAExtClientMSIE;
		else if(!!window.StyleMedia)
			pImpl = TwoFAExtClientChrome;
		if(pImpl != null)
			pImpl.constructor();
		return pImpl;
	}

}

var TwoFAExtClientChrome = 
{

	constructor: function()
	{
		trace("TwoFAExtClientChrome::ctor");
		TwoFAExtClientChrome.FNTwoFASSOConnect = "TwoFASSOConnect";
		TwoFAExtClientChrome.FNTwoFASSOSetTemplates = "TwoFASSOSetTemplates";
		TwoFAExtClientChrome.FNTwoFASSOEnableDebug = "TwoFASSOEnableDebug";
		TwoFAExtClientChrome.ConnectHandler = null;
		TwoFAExtClientChrome.ConnectTimeout = 0;
		TwoFAExtClientChrome.SetTemplatesHandler = null;
		TwoFAExtClientChrome.SetTemplatesTimeout = 0;
		TwoFAExtClientChrome.EnableDebugHandler = null;
		TwoFAExtClientChrome.EnableDebugTimeout = 0;
		TwoFAExtClientChrome.Instance = this;
		window.addEventListener("TwoFASSOResult", this.OnTwoFAExtResult); 
	},

	destructor: function()
	{
		trace("TwoFAExtClientChrome::dtor");
		window.removeEventListener("TwoFASSOResult", this.OnTwoFAExtResult); 
	},

	Connect: function(OnRespHandler, nTimeout)
	{
		TwoFAExtClientChrome.ConnectHandler = OnRespHandler;
		this.SendTwoFAExtMessage(TwoFAExtClientChrome.FNTwoFASSOConnect, "");
		if(nTimeout != undefined && nTimeout > 0)
			TwoFAExtClientChrome.ConnectTimeout = setTimeout(this.OnConnectTimeout, nTimeout);
	},

	SetTemplates: function(pTemplates, OnRespHandler, nTimeout)
	{
		TwoFAExtClientChrome.SetTemplatesHandler = OnRespHandler;
		if(nTimeout != undefined && nTimeout > 0)
			TwoFAExtClientChrome.SetTemplatesTimeout = setTimeout(this.OnSetTemplatesTimeout, nTimeout);
		this.SendTwoFAExtMessage(TwoFAExtClientChrome.FNTwoFASSOSetTemplates, pTemplates);
	},

	EnableDebug: function(nActiveTime, OnRespHandler, nTimeout)
	{
		LogEnabledTime = nActiveTime;
		TwoFAExtClientChrome.EnableDebugHandler = OnRespHandler;
		if(nTimeout != undefined && nTimeout > 0)
			TwoFAExtClientChrome.EnableDebugTimeout = setTimeout(this.OnEnableDebugTimeout, nTimeout);
		this.SendTwoFAExtMessage(TwoFAExtClientChrome.FNTwoFASSOEnableDebug, nActiveTime);
	},

	SendTwoFAExtMessage: function(sMessage, pDetails)
	{
		trace("TwoFAExtClientChrome::SendTwoFAExtMessage -> " + sMessage);
		var evt = document.createEvent("CustomEvent");
		evt.initCustomEvent(sMessage, true, true, pDetails);
		document.dispatchEvent(evt);
	},

	OnTwoFAExtResult: function(pMsg)
	{
		var pResp = pMsg.detail;
		trace("TwoFAExtClientChrome::TwoFASSOResult -> Msg.type=" + pMsg.type);
		try { trace("TwoFAExtClientChrome::TwoFASSOResult -> Resp=" + pResp); }
		catch(e) { pResp = { type: TwoFAExtClientChrome.ConnectHandler ? TwoFAExtClientChrome.FNTwoFASSOConnect : "", detail: "" }; }
		trace("TwoFAExtClientChrome::TwoFASSOResult -> " + pMsg.type + ", " + pResp.type + ", " + pResp.detail);
		if(pResp.type == TwoFAExtClientChrome.FNTwoFASSOConnect && TwoFAExtClientChrome.ConnectHandler)
		{
			if(TwoFAExtClientChrome.ConnectTimeout != 0)
			{
				clearTimeout(TwoFAExtClientChrome.ConnectTimeout);
				TwoFAExtClientChrome.ConnectTimeout = 0;
			}
			TwoFAExtClientChrome.ConnectHandler(pResp);
			TwoFAExtClientChrome.ConnectHandler = null;
		}
		else if(pResp.type == TwoFAExtClientChrome.FNTwoFASSOSetTemplates && TwoFAExtClientChrome.SetTemplatesHandler)
		{
			if(TwoFAExtClientChrome.SetTemplatesTimeout != 0)
			{
				clearTimeout(TwoFAExtClientChrome.SetTemplatesTimeout);
				TwoFAExtClientChrome.SetTemplatesTimeout = 0;
			}
			TwoFAExtClientChrome.SetTemplatesHandler(true);
			TwoFAExtClientChrome.SetTemplatesHandler = null;
		}
		else if(pResp.type == TwoFAExtClientChrome.FNTwoFASSOEnableDebug && TwoFAExtClientChrome.EnableDebugHandler)
		{
			if(TwoFAExtClientChrome.EnableDebugTimeout != 0)
			{
				clearTimeout(TwoFAExtClientChrome.EnableDebugTimeout);
				TwoFAExtClientChrome.EnableDebugTimeout = 0;
			}
			TwoFAExtClientChrome.EnableDebugHandler(true);
			TwoFAExtClientChrome.EnableDebugHandler = null;
		}
	},

	OnConnectTimeout: function()
	{
		trace("TwoFAExtClientChrome::OnConnectTimeout");
		if(TwoFAExtClientChrome.ConnectHandler)
		{
			TwoFAExtClientChrome.ConnectHandler(null);
			TwoFAExtClientChrome.ConnectHandler = null;
			TwoFAExtClientChrome.ConnectTimeout = 0;
		}
	},

	OnSetTemplatesTimeout: function()
	{
		trace("TwoFAExtClientChrome::OnSetTemplatesTimeout");
		if(TwoFAExtClientChrome.SetTemplatesHandler)
		{
			TwoFAExtClientChrome.SetTemplatesHandler(false);
			TwoFAExtClientChrome.SetTemplatesHandler = null;
			TwoFAExtClientChrome.SetTemplatesTimeout = 0;
		}
	},

	OnEnableDebugTimeout: function()
	{
		trace("TwoFAExtClientChrome::OnEnableDebugTimeout");
		if(TwoFAExtClientChrome.EnableDebugHandler)
		{
			TwoFAExtClientChrome.EnableDebugHandler(false);
			TwoFAExtClientChrome.EnableDebugHandler = null;
			TwoFAExtClientChrome.EnableDebugTimeout = 0;
		}
	}

}

var TwoFAExtClientMSIE = 
{

	constructor: function()
	{
		trace("TwoFAExtClientMSIE::ctor");
	},

	destructor: function()
	{
		trace("TwoFAExtClientMSIE::dtor");
	},

	Connect: function(OnRespHandler, nTimeout)
	{
		var sStatus = null;
		try
		{
			sStatus = window.TwoFAIEExt.Status;
		}
		catch(e)
		{
			trace("TwoFAExtClientMSIE::Connect() -> " + e);
		}
		OnRespHandler(sStatus == "ready" ? true : null);
	},

	SetTemplates: function(pTemplates, OnRespHandler, nTimeout)
	{
		try
		{
			window.TwoFAIEExt.Templates = JSON.stringify(pTemplates);
			if(OnRespHandler != null && OnRespHandler != undefined)
				OnRespHandler(true);
		}
		catch(e)
		{
			trace("TwoFAExtClientMSIE::SetTemplates() -> " + e);
			if(OnRespHandler != null && OnRespHandler != undefined)
				OnRespHandler(false);
		}
	},

	EnableDebug: function(nActiveTime, OnRespHandler, nTimeout)
	{
		try
		{
			LogEnabledTime = nActiveTime;
			window.TwoFAIEExt.DebugTime = nActiveTime;
			if(OnRespHandler != null && OnRespHandler != undefined)
				OnRespHandler(true);
		}
		catch(e)
		{
			trace("TwoFAExtClientMSIE::EnableDebug() -> " + e);
			if(OnRespHandler != null && OnRespHandler != undefined)
				OnRespHandler(false);
		}
	}

}


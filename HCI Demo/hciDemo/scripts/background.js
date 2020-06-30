console.log("background.js here!")
//var connected = false;
var contentPort;
var nativePort;

chrome.runtime.onConnect.addListener(function (port) {
    if (port.name == 'hciComm') {

        console.log('Connected to hciComm');
        contentPort = port;
        // activate the icon
        chrome.pageAction.show(contentPort.sender.tab.id);
        console.log('Call nativeHost');
        nativeHost()
        console.log('After call to nativeHost');
        console.log('Call sendMessageToNativeHost');
        sendMessageToNativeHost({ url: contentPort.sender.tab.url, id: chrome.runtime.getManifest().name.toLowerCase() });
        console.log('After call to sendMessageToNativeHost');

        contentPort.onMessage.addListener(function (msg) {
            console.log('contentPort Listener:' + JSON.stringify(msg))
            if (msg.status !== undefined) {
                console.log('msg.Status not undefined - Sending message to native host');
                // send message to bring Chrome to the front
                //sendMessageToNativeHost({ status: 'bringForward', title: contentPort.sender.tab.title });
                //Bring the tab to the front
                //chrome.tabs.update(contentPort.sender.tab.id, { active: true });
                //Send message
                sendMessageToNativeHost(msg);
            }
        });
    }

});

function nativeHost() {
    console.log('nativeHost: Start');
    console.log('nativeHost: Get manifest');
    var manifest = chrome.runtime.getManifest();
    console.log('nativeHost: manifest.nativehost_name.toLowerCase = ' + manifest.nativehost_name.toLowerCase());
    
    nativePort = chrome.runtime.connectNative(manifest.nativehost_name.toLowerCase());
    nativePort.onMessage.addListener(function (msg) {
        console.log("Received msg from nativePort");
        if (msg.status === undefined) {
            try {
                contentPort.postMessage(msg);
            }
            catch (err) {
                // contentPort is null this happens if the content script reloads before the login is complete
                // causing us to launch a nativeMessagingHost again.  
                console.log('Error connecting to contentPort. Send close to NativeMessagingHost Err = ' + err)
                sendMessageToNativeHost({ status: 'sendClose' });
            }
        }
        return true; //return true to keep port alive
    });
    nativePort.onDisconnect.addListener(function () {
        console.log("nativeHost: Disconnected");
        chrome.pageAction.hide(contentPort.sender.tab.id);
    });

    console.log('nativeHost: exiting...');
}

function sendMessageToNativeHost(message) {
    console.log('sendMessageToNativeHost: Start');
    nativePort.postMessage(message);
    console.log('sendMessageToNativeHost: exiting...');
}

function callContent(msg) {
    console.log('Calling content script!')

    chrome.tabs.query({
        active: true,
        currentWindow: true
    }, function (tabs) {
        chrome.tabs.sendMessage(tabs[0].id, msg, function (response) { });
        console.log('Message sent to content script');
    });
}

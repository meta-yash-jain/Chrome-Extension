// content.js
var port;
var enter = 'sendEnter';
var validate = 'validateText';
var closeNMH = 'sendClose';
var bringForward = 'bringForward';
var portName = 'hciComm';
var activateForm = 'activateForm';
$(document).ready(function () {

    console.log('content.js: Document ready');

    //check for invalid Username or password from previous attempt
    if (document.getElementsByClassName('alert alert-danger text-center ng-binding ng-scope').length > 0) {
        console.log('content.js: Invalid username or password found. Do nothing.');
    } else {
        console.log('content.js: Open port to background.js')
        port = chrome.runtime.connect({
            name: portName
        });
        console.log('content.js: Add listener to port');
        port.onMessage.addListener(function (message, sender) {
            console.log('content.js: message from background.js');
            console.log('content.js: Calling checkIfpageLoaded');
            checkIfPageLoaded(message)

        });
    }
});

function login(message) {

    console.log('Login: Start');

    if ($("#" + message.UsernameID) !== null) {

        console.log('Login: find password field');
        if ($("#" + message.PasswordID) !== null) {
            console.log('Login:: input password');
            $("#" + message.PasswordID).val(message.Password);
            console.log('Login: set focus on password textbox');
            $("#" + message.PasswordID).focus();
            sendStatus(validate);

            console.log('Login: Get username');
            $("#" + message.UsernameID).val(message.Username);
            console.log('Login: set focus on username');
            $("#" + message.UsernameID).focus();
            sendStatus(activateForm);

            console.log('Login: find submit button');
            // could not get this to work with JQuery
            if (document.getElementsByClassName(message.SubmitButton).length !== 0) {
                console.log('Login: found submit button');
                var submitBtn = document.getElementsByClassName(message.SubmitButton);
                // could not get selecting the button or submitting the main form to login properly - 
                // ended up sending the ENTER key to submit the form.
                sendStatus(enter);
            } else {
                console.log('login: submit button element: ' + message.SubmitButton + ' not found.');
            }

        } else {
            console.log('login: password element ID: ' + message.PasswordID + ' not found.');
        }
    } else {
        console.log('login: username element ID: ' + message.UsernameID + ' not found.');
    }

    sendStatus(closeNMH);

    console.log('login: exiting...');
}

function sendStatus(statusMessage) {
    console.log('sendStatus: Start');

    port.postMessage({
        status: statusMessage
    });
    console.log('sendStatus: exiting...');
}

function checkIfPageLoaded(message) {
    console.log('checkIfPageLoaded: Check if document has loaded');
    var count = 1;
    var pageInitChecktimer = setInterval(function () {
        console.log("checkIfPageLoaded: Checking document " + count);
        if (count < 11) {
            if ($("#" + message.UsernameID) !== null) {
                console.log("Doc is loaded");
                clearInterval(pageInitChecktimer);
                login(message);

            } else {
                console.log("Doc not loaded yet");
            }
            count++;
        } else {
            console.log('checkIfPageLoaded: Timed out waiting for page to load.');
            clearInterval(pageInitChecktimer);
            login(message);
        }
    }, 1000);
}


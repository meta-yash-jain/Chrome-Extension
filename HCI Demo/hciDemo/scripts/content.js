// This is the content.js
var port;
var enter = 'sendEnter';
var validate = 'validateText';
var closeNMH = 'sendClose';
var bringForward = 'bringForward';
var portName = 'hciComm';
var activateForm = 'activateForm';
var isAnalytics;
$(document).ready(function () {
    console.log('content.js: Document ready');

    // check if on the login page
    console.log(document.URL.toString());

    if (document.URL.includes('http://www.hciclinical.com')) {
        isAnalytics = 'false';
        console.log("HCI Clinical Site")
        if (document.body.innerText.lastIndexOf("Username:") == -1) {
            console.log('content.js: Not at login page do nothing.');

            // on the log in page - is this an invalid username or password page?
        } else if (document.body.innerText.lastIndexOf("Invalid Login!") != -1) {
            console.log('content.js: Invalid login found.');
            console.log('content.js: Open port to background.js')
            port = chrome.runtime.connect({
                name: portName
            });
            console.log('content.js: Add listener to port');
            port.onMessage.addListener(function (message, sender) {
                console.log('content.js: message from background.js');
                console.log('content.js: Calling checkIfpageLoaded');
                getUserInput(message)
            });
        } else {
            // on the login page
            console.log('content.js: On login page. Open port to background.js');
            port = chrome.runtime.connect({
                name: portName
            });
            console.log('content.js: Add listener to port');
            port.onMessage.addListener(function (message, sender) {
                console.log('content.js: message from background.js');
                changeInputFieldColor('PaleGreen', message);
                //check user credentials returned from XA server
                if (message.Password == null || message.Username == null || message.Password.length == 0 || message.Username.length == 0) {
                    // message missing user data
                    if (message.Username != null && message.Username.length != 0) {
                        setUserName(message);
                    }
                    console.log('content.js: User creds not found, go to getUserInput.');
                    getUserInput(message);
                } else {
                    console.log('content.js: Calling checkIfpageLoaded');
                    //checkIfPageLoaded(message);
                    login(message);
                }
            });
        }
    } else if (document.URL.includes('https://healthcast.brickftp.com/login')) {
        console.log("BrickFTP site")
        isAnalytics = 'true';
        if (document.body.innerText.lastIndexOf("Forgot your password?") == -1) {
            console.log('content.js: Not at login page do nothing.');

            // on the log in page - is this an invalid username or password page?
        } else if (document.body.innerText.lastIndexOf("We couldn't log you") != -1) {
            console.log('content.js: Invalid login found.');
            console.log('content.js: Open port to background.js')
            port = chrome.runtime.connect({
                name: portName
            });
            console.log('content.js: Add listener to port');
            port.onMessage.addListener(function (message, sender) {
                console.log('content.js: message from background.js');
                console.log('content.js: Calling checkIfpageLoaded');
                getUserInput(message)
            });
        } else {
            // on the login page
            console.log('content.js: On login page. Open port to background.js');
            port = chrome.runtime.connect({
                name: portName
            });
            console.log('content.js: Add listener to port');
            port.onMessage.addListener(function (message, sender) {
                console.log('content.js: message from background.js');
                changeInputFieldColor('PaleGreen', message);
                //check user credentials returned from XA server
                if (message.Password == null || message.Username == null || message.Password.length == 0 || message.Username.length == 0) {
                    // message missing user data
                    if (message.Username != null && message.Username.length != 0) {
                        setUserName(message);
                    }
                    console.log('content.js: User creds not found, go to getUserInput.');
                    getUserInput(message);
                } else {
                    console.log('content.js: Calling checkIfpageLoaded');
                    //checkIfPageLoaded(message);
                    login(message);
                }
            });
        }
    }
});

function setUserName(message) {
    console.log("setUserName: Start " + isAnalytics)
    if (isAnalytics == 'true') {
        if (document.getElementsByName(message.UsernameID) !== null) {
            console.log('setUserName: Setting username element');
            document.getElementsByName(message.UsernameID)[0].value = message.Username;
        }
    } else {
        if ($("#" + message.UsernameID) !== null) {
            console.log('setUserName: Setting username element');
            $("#" + message.UsernameID).val(message.Username);
        } else {
            console.log('setUserName: Username element not found.');
        }
    }
}

function getUserInput(message) {
    console.log('getUserInput: Start, get submit button and add event handler ' + isAnalytics);

    if (isAnalytics == 'true') {
        // this button does have a classname
        console.log('message.SubmitButton = ' + message.SubmitButton)
        if (document.getElementsByClassName(message.SubmitButton) !== null) {
            document.getElementsByClassName(message.SubmitButton)[0].addEventListener('click', function (e) {
                console.log("Password = " + document.getElementsByName(message.PasswordID)[0].value);
                console.log("Username = " + document.getElementsByName(message.UsernameID)[0].value)
                // we have the username and password send them to be updated.
                credUpdate = { "status": "update", "username": document.getElementsByName(message.UsernameID)[0].value, "password": document.getElementsByName(message.PasswordID)[0].value };
                sendMessage(credUpdate);
            }, false);
        }
    } else {
        // this button does not have a classname
        if ($("#" + message.SubmitButton) !== null) {
            document.getElementById(message.SubmitButton).addEventListener('click', function (e) {
                console.log("Password = " + document.getElementById(message.PasswordID).value);
                console.log("Username = " + document.getElementById(message.UsernameID).value)
                // we have the username and password send them to be updated.
                credUpdate = { "status": "update", "username": document.getElementById(message.UsernameID).value, "password": document.getElementById(message.PasswordID).value };
                sendMessage(credUpdate);
            });
        }
    }

    changeInputFieldColor('yellow', message)
    console.log('getUserInput: exiting...');
}

function changeInputFieldColor(color, message) {
    //highlight username and password fields
    console.log('changeInputFieldColor: Start ' + isAnalytics);
    if (isAnalytics == 'true') {
        if (document.getElementsByName(message.UsernameID) !== null) {
            console.log('getUserInput: find password field');
            if (document.getElementsByName(message.PasswordID) !== null) {
                console.log('getUserInput: set background color for password');
                document.getElementsByName(message.PasswordID)[0].style.backgroundColor = color;
                console.log('getUserInput: set background color for  username');
                document.getElementsByName(message.UsernameID)[0].style.backgroundColor = color;
            } else {
                console.log('getUserInput: password element ID: ' + message.PasswordID + ' not found.');
            }
        } else {
            console.log('getUserInput: username element ID: ' + message.UsernameID + ' not found.');
        }
    } else {
        if ($("#" + message.UsernameID) !== null) {
            console.log('getUserInput: finding password field');
            if ($("#" + message.PasswordID) !== null) {
                console.log('getUserInput: setting background color for password');
                $("#" + message.PasswordID).css("background-color", color);
                console.log('getUserInput: setting background color for  username');
                $("#" + message.UsernameID).css("background-color", color);
            } else {
                console.log('getUserInput: password element ID: ' + message.PasswordID + ' not found.');
            }
        } else {
            console.log('getUserInput: username element ID: ' + message.UsernameID + ' not found.');
        }
    }
}

function login(message) {
    console.log('Login: Start ' + isAnalytics);

    if (isAnalytics == 'true') {
        if (document.getElementsByName(message.UsernameID) !== null) {
            console.log('Login: find password field');
            if (document.getElementsByName(message.PasswordID) !== null) {
                console.log('Login: input password');
                document.getElementsByName(message.PasswordID)[0].focus()
                document.getElementsByName(message.PasswordID)[0].value = message.Password;

                console.log('Login: Get username');
                document.getElementsByName(message.UsernameID)[0].focus()
                document.getElementsByName(message.UsernameID)[0].value = message.Username;
                console.log('Login: find submit button')

                document.getElementsByName(message.PasswordID)[0].focus()
                let result = sessionStorage.getItem('LoggedIn');
                console.log('LoggedIn = ' + result);
                if (result !== 'true') {
                    if (document.getElementsByClassName(message.SubmitButton) !== null) {
                        console.log('Login: found submit button');
                        var submitBtn = document.getElementsByClassName(message.SubmitButton)[0];
                        // Save LoggedIn state to sessionStorage
                        sessionStorage.setItem('LoggedIn', 'true');
                        console.log('Login: Click submit button.');
                        setTimeout(function () {
                            submitBtn.click();
                        }, 500);
                    } else {
                        console.log('login: submit button element: ' + message.SubmitButton + ' not found.');
                    }
                } else {
                    console.log('login: LogggedIn = true do not submit');
                }
            } else {
                console.log('login: password element ID: ' + message.PasswordID + ' not found.');
            }
        } else {
            console.log('login: username element ID: ' + message.UsernameID + ' not found.');
        }

        setTimeout(function () {
            if (document.body.innerText.lastIndexOf("We couldn't log you in") != -1) {
                getUserInput(message)
            } else {
                sendStatus(closeNMH);
            }
        }, 500);
    } else {
        if ($("#" + message.UsernameID) !== null) {
            console.log('Login: find password field');
            if ($("#" + message.PasswordID) !== null) {
                console.log('Login: input password');
                $("#" + message.PasswordID).val(message.Password);

                console.log('Login: Get username');
                $("#" + message.UsernameID).val(message.Username);

                console.log('Login: find submit button');
                let result = sessionStorage.getItem('LoggedIn');
                console.log('LoggedIn = ' + result);
                if (result !== 'true') {
                    if ($("#" + message.SubmitButton) !== null) {
                        console.log('Login: found submit button');
                        var submitBtn = document.getElementById(message.SubmitButton);
                        // Save LoggedIn state to sessionStorage
                        sessionStorage.setItem('LoggedIn', 'true');
                        console.log('Login: Click submit button.');
                        submitBtn.click();
                    } else {
                        console.log('login: submit button element: ' + message.SubmitButton + ' not found.');
                    }
                } else {
                    console.log('login: LogggedIn = true do not submit');
                }
            } else {
                console.log('login: password element ID: ' + message.PasswordID + ' not found.');
            }
        } else {
            console.log('login: username element ID: ' + message.UsernameID + ' not found.');
        }

        setTimeout(function () {
            if (document.body.innerText.lastIndexOf("Invalid Login!") != -1) {
                getUserInput(message)
            } else {
                sendStatus(closeNMH);
            }
        }, 500);
    }

    console.log('login: exiting...');
}

function sendStatus(statusMessage) {
    console.log('sendStatus: Start');

    port.postMessage({
        status: statusMessage
    });
    console.log('sendStatus: exiting...');
}

function sendMessage(statusMessage) {
    console.log('sendMessage: Start');

    port.postMessage(statusMessage);
    console.log('sendMessage: exiting...');
}

function checkIfPageLoaded(message) {
    console.log('checkIfPageLoaded: Check if document has loaded');
    var count = 1;
    var pageInitChecktimer = setInterval(function () {
        console.log("checkIfPageLoaded: Checking document " + count);
        if (count < 11) {
            if ($("#" + message.UsernameID) !== null) {
                console.log("checkIfPageLoaded: Doc is loaded");
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
    }, 500);
}
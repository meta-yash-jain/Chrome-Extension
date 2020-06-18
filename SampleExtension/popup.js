
// Code goes here
var keySize = 256;
var ivSize = 128;
var iterations = 100;

function encrypt(msg, pass) {
    var salt = CryptoJS.lib.WordArray.random(128 / 8);

    var key = CryptoJS.PBKDF2(pass, salt, {
        keySize: keySize / 32,
        iterations: iterations
    });

    var iv = CryptoJS.lib.WordArray.random(128 / 8);

    var encrypted = CryptoJS.AES.encrypt(msg, key, {
        iv: iv,
        padding: CryptoJS.pad.Pkcs7,
        mode: CryptoJS.mode.CBC

    });

    // salt, iv will be hex 32 in length
    // append them to the ciphertext for use  in decryption
    var transitmessage = salt.toString() + iv.toString() + encrypted.toString();
    return transitmessage;
}

function decrypt(transitmessage, pass) {
    var salt = CryptoJS.enc.Hex.parse(transitmessage.substr(0, 32));
    var iv = CryptoJS.enc.Hex.parse(transitmessage.substr(32, 32))
    var encrypted = transitmessage.substring(64);

    var key = CryptoJS.PBKDF2(pass, salt, {
        keySize: keySize / 32,
        iterations: iterations
    });

    var decrypted = CryptoJS.AES.decrypt(encrypted, key, {
        iv: iv,
        padding: CryptoJS.pad.Pkcs7,
        mode: CryptoJS.mode.CBC

    })
    return decrypted;
}

function connect() {
    var name = document.getElementById('fname').value
    var pass = document.getElementById('pass').value
    console.log(name, pass)

    var ciphertext = encrypt(pass, name)
    var decrypted = decrypt(ciphertext, name)

    document.getElementById('response').innerHTML = `<p> Decrpted ${decrypted.toString(CryptoJS.enc.Utf8)} </p>` +
        `<p> Encrypted ${ciphertext.toString()} </p>`

    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        chrome.tabs.executeScript(tabs[0].id, {
            file: "content.js"
        }, function () {
            chrome.tabs.sendMessage(
                tabs[0].id,
                {
                    details: {
                        name,
                        pass,
                        ciphertext,
                        decrypted: decrypted.toString(CryptoJS.enc.Utf8)
                    }
                });
        });
    });
}

document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('connect-button').addEventListener(
        'click', connect);
});
// let changeColor = document.getElementById('changeColor');

// chrome.storage.sync.get('color', function (data) {
//     changeColor.style.backgroundColor = data.color;
//     changeColor.setAttribute('value', data.color);
//     changeColor.onclick = function (element) {
//         let color = element.target.value;
//         chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
//             chrome.tabs.executeScript(
//                 tabs[0].id,
//                 { code: 'document.body.style.backgroundColor = "' + color + '";' });
//         });
//     };
// });
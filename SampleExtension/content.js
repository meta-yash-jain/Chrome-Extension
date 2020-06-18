chrome.runtime.onMessage.addListener((msg) => {
    // First, validate the message's structure.
    debugger;
    console.log('test')
    if (msg.details) {
        var allInputTags = document.getElementsByTagName('input')
        console.log(allInputTags)

        document.getElementById('response').innerHTML = `<p> Encrypted: ${msg.details.ciphertext} </p>` +
            `<p> Decrypted: ${msg.details.decrypted} </p>`

        Array.from(allInputTags).forEach(element => {
            if (element.type == 'text') {
                element.value = msg.details.name
            }
            if (element.type == 'password') {
                element.value = msg.details.pass
            }
        });
    }
});
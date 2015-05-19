(function initiateBackground() {
    /*
        Router for comms between the text editor and the css injector
    */
    chrome.runtime.onConnect.addListener(function(port) {
        if (port.name !== "LiveCSSWindowTransaction") return false

        port.onMessage.addListener(function(data) {
            chrome.tabs.sendMessage(data.tabId, data.css)
        })
    })
})();
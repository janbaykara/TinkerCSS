(function LiveCSSInjector() {
    /*
        CSS injector
    */
    var LiveCSSInjector = this
    LiveCSSInjector.$element = $("style")[0]
    LiveCSSInjector.css = ""

    // ------
    // Methods
    LiveCSSInjector.receiveCSS = function(css) {
        // console.log("RECEIVED updated CSS")
        LiveCSSInjector.css = css
        LiveCSSInjector.injectCSS(css)
    }

    LiveCSSInjector.injectCSS = function(css) {
        // console.log("CSS tag updated")
        LiveCSSInjector.$element.html(css)
    }

    // ------
    // Controller

    LiveCSSInjector.init = function() {
        // console.log("Initialising CSS injection")
        $("head").append("<style id='LiveCSSEditor-PageCSS'></style>")
        LiveCSSInjector.$element = $("#LiveCSSEditor-PageCSS")

        // Listen for CSS pushed data
        chrome.runtime.onMessage.addListener(function(css, sender, sendResponse) {
            LiveCSSInjector.receiveCSS(css)
        })
    }

    LiveCSSInjector.init()
})();
(function LiveCodeInjector() {
    /*
        Code injector
    */
    var id = "TINKER_CODE_INJECTION"
    var formatTags = {
        "css": "style",
        "javascript": "script"
    }
    var LiveCodeInjector = this
    LiveCodeInjector.$element = {}
    LiveCodeInjector.codeType = ""
    LiveCodeInjector.code = ""

    // ------
    // Methods
    LiveCodeInjector.receiveCode = function(code, codeType) {
        // console.log("RECEIVED updated Code")
        LiveCodeInjector.codeType = codeType
        LiveCodeInjector.code = code
        LiveCodeInjector.injectCode()
    }

    LiveCodeInjector.injectCode = function() {
        // console.log("Code tag updated")
        LiveCodeInjector.$element[LiveCodeInjector.codeType].html(LiveCodeInjector.code)
    }

    // ------
    // Controller

    LiveCodeInjector.init = function() {
        // console.log("Initialising Code injection")
        for(var codeType in formatTags) {
            var tag = formatTags[codeType]
            $(tag+"#"+id).remove()
            $("head").append("<"+tag+" id='"+id+"'></"+tag+">")
            LiveCodeInjector.$element[codeType] = $(tag+"#"+id+"")
        }

        // Listen for Code pushed data
        chrome.runtime.onMessage.addListener(function(data, sender, sendResponse) {
            console.log(data)
            LiveCodeInjector.receiveCode(data.code, data.codeType)
        })
    }

    LiveCodeInjector.init()
})();

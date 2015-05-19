(function initiateSidebar() {
    var port = chrome.runtime.connect({ name: "LiveCSSWindowTransaction" })
    var tabId = chrome.devtools.inspectedWindow.tabId
    chrome.devtools.inspectedWindow.getResources(function(resources) {
        var url = resources[0].url
        editorController(port, tabId, url)
    })
})();

function editorController(port, tabId, url) {
    var editor
    var lastSaveTime = new Date()
    var session = new Session()
    var SYNC_INTERVAL = 2500
    var REFRESH_INTERVAL = 150

    $(document).ready(function() {
        // Initiate editor
        editor = ace.edit("editor");
        editor.setTheme("ace/theme/solarized_dark");
        editor.getSession().setMode("ace/mode/css");

        // Load synced storage CSS
        session.get(url, function(css) {
            editor.setValue(css)
            updateCSSTag()
        })

        // Update on change
        var keyupTimer = null
        editor.getSession().on('change', function(e) {
            if (keyupTimer) clearTimeout(keyupTimer);
            keyupTimer = setTimeout(updateCSSTag, REFRESH_INTERVAL);
        });
    })

    function css() {
        return editor.getValue() || "*{}"
    }

    function updateCSSTag() {
        console.log(css())

        // Inject CSS
        port.postMessage({
            tabId: tabId,
            css: css()
        })

        // Sync to storage
        console.log(lastSaveTime)
        var last = (typeof lastSaveTime === 'undefined') ? new Date() : lastSaveTime
        var nextSaveThreshold = new Date(last.getTime() + SYNC_INTERVAL)
        var thisSaveTime = new Date()
        if(thisSaveTime > nextSaveThreshold) {
	        lastSaveTime = thisSaveTime
	        session.set(url,css())
        }
    }
}

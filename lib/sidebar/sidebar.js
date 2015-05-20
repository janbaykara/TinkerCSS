(function initiateSidebar() {
    var port = chrome.runtime.connect({ name: "LiveCSSWindowTransaction" })
    var tabId = chrome.devtools.inspectedWindow.tabId
    chrome.devtools.inspectedWindow.getResources(function(resources) {
        var url = resources[0].url
        editorController(port, tabId, url)
    })
})()

function editorController(port, tabId, url) {
    var editor
    var lastSaveData
    var $btnToggle
    var $btnSync
    var SYNC_INTERVAL = 2500
    var REFRESH_INTERVAL = 150
    var CLASSES_WHEN_OUTDATED = 'outdated fa-refresh'
    var CLASSES_WHEN_SYNCING = 'syncing fa-refresh fa-spin'
    var CLASSES_WHEN_SYNCED = 'synced fa-cloud'
    var lastSaveTime = new Date()
    var session = new Session()

    $(document).ready(function() {
        $btnToggle = $("[data-ui='toggle']")
        $btnSync = $("[data-ui='sync']")
        $btnToggleIcon = $("[data-ui='toggle'] .fa")
        $btnSyncIcon = $("[data-ui='sync'] .fa")
        // Initiate editor

        editor = initiateEditor()
        editor.focus()

        // Load (any) saved css for this url
        session.get(url, function(css) {
            console.log("Loaded from sync",url,css)
            lastSaveData = css
            updateEditorCSS(css)
        })

        // Update on change
        var keyupTimer
        editor.getSession().on('change', function(e) {
            $btnSyncIcon.removeClass(CLASSES_WHEN_SYNCED)
            $btnSyncIcon.addClass(CLASSES_WHEN_OUTDATED)
            if (keyupTimer) clearTimeout(keyupTimer)
            keyupTimer = setTimeout(function() {
                updateCSSTag(editorCSS(),true)
            }, REFRESH_INTERVAL)
        })

        // Force save on click
        $btnSync.on('click', function() {
            syncToStorage()
        })

        // Disable/enable btn
        $btnToggle.on('click', function() {
            // Toggle toggle-off toggle-on
            $btnToggleIcon.toggleClass('fa-toggle-off fa-toggle-on')

            if ($btnToggleIcon.hasClass('fa-toggle-on'))
                updateCSSTag(editorCSS(),false)
            else
                updateCSSTag(" ",false)
        })
    })

    function editorCSS() {
        return editor.getValue() || ""
    }

    function updateEditorCSS(css) {
        css = (typeof css === 'undefined' || css === null) ? "" : css
        editor.setValue(css)
        updateCSSTag(css, true)
    }

    function syncToStorage() {
        //icon-spinner
        $btnSyncIcon.removeClass(CLASSES_WHEN_SYNCED)
        $btnSyncIcon.addClass(CLASSES_WHEN_SYNCING)
        var css = editorCSS()
        session.set(url,css, function() {
            $btnSyncIcon.addClass(CLASSES_WHEN_SYNCED)
            $btnSyncIcon.removeClass(CLASSES_WHEN_SYNCING)
            lastSaveData = css
        })
    }

    function updateCSSTag(css,sync) {
        // Inject CSS
        port.postMessage({
            tabId: tabId,
            css: css
        })

        // Sync to storage
        if(typeof sync === 'undefined' || sync === true) {
            console.log("Attempting to sync")
            var last = (typeof lastSaveTime === 'undefined') ? new Date() : lastSaveTime
            var nextSaveThreshold = new Date(last.getTime() + SYNC_INTERVAL)
            var thisSaveTime = new Date()
            if(thisSaveTime > nextSaveThreshold) {
    	        lastSaveTime = thisSaveTime
    	        syncToStorage()
            }
        }
    }

    function initiateEditor() {
        ace.require("ace/ext/language_tools")
        var editor = ace.edit("editor")
        editor.setTheme("ace/theme/chrome")
        editor.getSession().setMode("ace/mode/css")
        editor.setOptions({
            enableBasicAutocompletion: true,
            enableSnippets: true,
            enableLiveAutocompletion: true,
            useSoftTabs: true
        })

        return editor
    }
}

(function initiateSidebar() {
    var port = chrome.runtime.connect({ name: "LiveCSSWindowTransaction" })
    var tabId = chrome.devtools.inspectedWindow.tabId
    chrome.devtools.inspectedWindow.getResources(function(resources) {
        var url = resources[0].url
        editorController(port, tabId, url)
    })
})()

$.widget("TinkerCSS.cssModes", {
    options: { modes: {} },

    set: function(modeName) {
        var This = this
        _.each(This.options.modes, function(modeClasses) {
            This.element.removeClass(modeClasses)
        })
        This.element.addClass(This.options.modes[modeName])
    }
})

function editorController(port, tabId, url) {
    var editor
    var $btnToggle
    var $btnSync
    var REFRESH_INTERVAL = 150
    var SYNC_INTERVAL = 2500
    var BACKUP_INTERVAL = 5000
    var lastSaveTime = new Date()
    var nextSaveThreshold = new Date()
    var thisSaveTime = new Date()
    var session = new Session()
    var syncClasses = {
        'OUTDATED': 'outdated fa-refresh',
        'SYNCING': 'syncing fa-refresh fa-spin',
        'SYNCED': 'synced fa-cloud'
    }

    $(document).ready(function() {
        $btnToggle = $("[data-ui='toggle']")
        $btnSync = $("[data-ui='sync']")
        $btnToggleIcon = $("[data-ui='toggle'] .fa")
        $btnSyncIcon = $("[data-ui='sync'] .fa")

        // Initiate reactive UI
        $btnSyncIcon.cssModes({
            'modes': syncClasses
        })

        // Initiate editor
        editor = initiateEditor()
        editor.focus()

        // Load (any) saved css for this url
        session.get(url, function(css) {
            console.log("Loaded from sync",url,css)
            updateEditorCSS(css)
        })

        // Update on change
        var keyupTimer
        editor.getSession().on('change', function(e) {

            $btnSyncIcon.cssModes('set','OUTDATED')

            if (keyupTimer) clearTimeout(keyupTimer)
            keyupTimer = setTimeout(function() {
                updateCSSTag(editorCSS())
                syncToStorage()
            }, REFRESH_INTERVAL)
        })

        // Backup at interval
        setInterval(function() {
            syncToStorage()
        }, BACKUP_INTERVAL)

        // Force save on click
        $btnSync.on('click', function() {
            syncToStorage(false)
        })

        // Disable/enable btn
        $btnToggle.on('click', function() {
            // Toggle toggle-off toggle-on
            $btnToggleIcon.toggleClass('fa-toggle-off fa-toggle-on')

            if ($btnToggleIcon.hasClass('fa-toggle-on'))
                updateCSSTag(editorCSS())
            else
                updateCSSTag(" ")
        })
    })

    function editorCSS() {
        return editor.getValue() || ""
    }

    function updateEditorCSS(css) {
        css = (typeof css === 'undefined' || css === null) ? "" : css
        editor.setValue(css)
        updateCSSTag(css)
    }

    function updateCSSTag(css) {
        // Inject CSS
        port.postMessage({
            tabId: tabId,
            css: css
        })
    }

    function syncToStorage(checkThreshold) {
        // Check
        var doit = true
        if(typeof checkThreshold === 'undefined') {
            thisSaveTime = new Date()
            nextSaveThreshold = new Date(lastSaveTime.getTime() + SYNC_INTERVAL)
            doit = (thisSaveTime > nextSaveThreshold)
        }
        if(doit === false) return false;

        var css = editorCSS()

        if(session[url] !== css) {
            $btnSyncIcon.cssModes('set','SYNCING')
            session.set(url,css, function() {
                $btnSyncIcon.cssModes('set','SYNCED')
                lastSaveTime = new Date()
            })
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
(function initiateSidebar() {
    var port = chrome.runtime.connect({ name: "LiveCSSWindowTransaction" })
    var tabId = chrome.devtools.inspectedWindow.tabId
    chrome.devtools.inspectedWindow.getResources(function(resources) {
        var url = resources[0].url
        console.log("Tinkering with "+url)
        editorController(port, tabId, url)
    })
})()

$.widget("TinkerCSS.cssModes", {
    options: { modes: {} },

    set: function(modeName) {
        var This = this
        var removeClasses = []
        _.each(This.options.modes, function(modeClasses,mode) {
            removeClasses.push(modeClasses)
        })
        This.element.removeClass(removeClasses.join(" "))
        This.element.addClass(This.options.modes[modeName])
    }
})

function editorController(port, tabId, url) {
    var editor
    var $btnToggle
    var $btnSync
    var REFRESH_INTERVAL = 150
    var SYNC_INTERVAL = 2500
    var BACKUP_INTERVAL = 3500
    var toggled_on = true
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
        $btnSyncIcon.cssModes({ 'modes': syncClasses })
        $btnSyncIcon.cssModes('set','SYNCED')

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
            $btnToggleIcon.toggleClass('fa-toggle-off fa-toggle-on')
            toggled_on = $btnToggleIcon.hasClass('fa-toggle-on')
            updateCSSTag(editorCSS())
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
        var injectedCSS = toggled_on ? css : " "
        port.postMessage({
            tabId: tabId,
            css: injectedCSS
        })
    }

    function syncToStorage(checkThreshold) {
        var doit = true
        var css = editorCSS()

        // Check if changes need to be stored
        if(session[url] === css) {
            $btnSyncIcon.cssModes('set','SYNCED')
            return false
        } else {
            $btnSyncIcon.cssModes('set','OUTDATED')
        }

        // Ratelimiting check
        if(typeof checkThreshold === 'undefined') {
            thisSaveTime = new Date()
            nextSaveThreshold = new Date(lastSaveTime.getTime() + SYNC_INTERVAL)
            doit = (thisSaveTime > nextSaveThreshold)
        }
        if(doit === false) return false

        // Save the CSS
        $btnSyncIcon.cssModes('set','SYNCING')
        session.set(url,css, function() {
            $btnSyncIcon.cssModes('set','SYNCED')
            lastSaveTime = new Date()
        })
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

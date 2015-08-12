(function initiateSidebar() {
    var port = chrome.runtime.connect({ name: "LiveCodeWindowTransaction" })
    var tabId = chrome.devtools.inspectedWindow.tabId
    chrome.devtools.inspectedWindow.getResources(function(resources) {
        var url = resources[0].url
        console.log("Tinkering with "+url)
        editorController(port, tabId, url)
    })
})()

$.widget("TinkerCode.cssModes", {
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
    var codeType
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
        codeType = $("#codeType").val()

        // Initiate reactive UI
        $btnSyncIcon.cssModes({ 'modes': syncClasses })
        $btnSyncIcon.cssModes('set','SYNCED')

        // Initiate editor
        editor = initiateEditor()
        startEditing(editor)
        editor.focus()

        // Update on change
        var keyupTimer
        editor.getSession().on('change', function(e) {

            $btnSyncIcon.cssModes('set','OUTDATED')

            if (keyupTimer) clearTimeout(keyupTimer)
            keyupTimer = setTimeout(function() {
                updateCodeTag(editor.getValue())
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
            updateCodeTag(editor.getValue())
        })

        $("#codeType").change(function() {
            codeType = $(this).val()
            console.log("Changing to codeType "+codeType)
            editor.getSession().setMode("ace/mode/"+codeType)
            startEditing()
        })
    })

    function updateEditorCode(code) {
        code = (typeof code === 'undefined' || code === null) ? "" : code
        editor.setValue(code)
        updateCodeTag(code)
    }

    function updateCodeTag(code) {
        console.log("Updating code tag")
        var injectedCode = toggled_on ? code : " "
        port.postMessage({
            tabId: tabId,
            code: injectedCode,
            codeType: codeType
        })
    }

    function syncToStorage(checkThreshold) {
        var doit = true
        var code = editor.getValue()

        // Check if changes need to be stored
        if(session[codeID()] === code) {
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

        // Save the Code
        $btnSyncIcon.cssModes('set','SYNCING')
        session.set(codeID(),code, function() {
            $btnSyncIcon.cssModes('set','SYNCED')
            lastSaveTime = new Date()
        })
    }

    function initiateEditor() {
        ace.require("ace/ext/language_tools")
        var editor = ace.edit("editor")
        editor.setTheme("ace/theme/chrome")
        editor.getSession().setMode("ace/mode/"+codeType)
        editor.setOptions({
            enableBasicAutocompletion: true,
            enableSnippets: true,
            enableLiveAutocompletion: true,
            useSoftTabs: true
        })

        return editor
    }

    function startEditing(editor) {
        // Load (any) saved code for this url
        session.get(codeID(), function(code) {
            console.log("Loaded from sync",url,code)
            updateEditorCode(code)
        })
    }

    function codeID() {
        return "codetype:"+codeType+",url:"+url
    }
}

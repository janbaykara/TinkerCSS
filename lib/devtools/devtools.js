// Initiate the pane
chrome.devtools.panels.elements.createSidebarPane(
    "TinkerCSS",
    function(sidebarPane) {
        sidebarPane.setPage("/lib/sidebar/sidebar.html")
        sidebarPane.setHeight("100vh")
    }
)
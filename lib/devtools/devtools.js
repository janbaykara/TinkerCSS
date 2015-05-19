// Initiate the pane
chrome.devtools.panels.elements.createSidebarPane(
    "Live CSS Tinkerer",
    function(sidebarPane) {
        sidebarPane.setPage("/lib/sidebar/sidebar.html")
        sidebarPane.setHeight("100vh")
    }
)
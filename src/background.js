// Watch out for any changes in tabs
browser.tabs.onUpdated.addListener(tabUpdated);
browser.tabs.onActivated.addListener(tabActivated);
browser.tabs.onRemoved.addListener(tabRemoved);

// Function to send a message
function sendMessage(msg, details) {
    browser.runtime.sendMessage({
        msg: msg,
        details: details
    });
}

function tabActivated(activeInfo) {
    sendMessage("ACTIVE_TAB_CHANGED", {
        windowId: activeInfo.windowId,
        tabId: activeInfo.tabId
    });
}

function tabUpdated(tabId, changeInfo, tab) {
    if (changeInfo.favIconUrl) {
        sendMessage("TAB_FAV_ICON_CHANGED", {
            tabId: tabId,
            favIconUrl: changeInfo.favIconUrl
        });
    }
    if (changeInfo.pinned) {
        sendMessage("TAB_PINNED_STATUS_CHANGED", {
            tabId: tabId,
            pinned: changeInfo.pinned
        });
    }
    if (changeInfo.title) {
        sendMessage("TAB_TITLE_CHANGED", {
            tabId: tabId,
            title: changeInfo.title
        });
    }
}

function tabRemoved(tabId, removeInfo) {
    sendMessage("TAB_REMOVED", {
        tabId: tabId, 
        windowId: removeInfo.windowId
    });
}

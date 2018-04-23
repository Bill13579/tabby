var lastTabId;
var currentTabId;
var lastWindowId;
var currentWindowId;
var dropCurrentTabId = false;
var dropCurrentWindowId = false;

// Set initial tab id
browser.tabs.query({
    active: true,
    currentWindow: true
}).then(function (tabs){
    currentTabId = tabs[0].id;
    dropCurrentTabId = true;
});

// Set initial window id
browser.windows.getLastFocused({}).then(function (w){
    currentWindowId = w.id;
    dropCurrentWindowId = true;
});

// Watch out for any changes in tabs
browser.tabs.onUpdated.addListener(tabUpdated);
browser.tabs.onActivated.addListener(tabActivated);
browser.tabs.onRemoved.addListener(tabRemoved);
browser.commands.onCommand.addListener(onCommand);
browser.windows.onRemoved.addListener(windowRemoved);
browser.windows.onFocusChanged.addListener(windowFocusChanged);

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
    if (dropCurrentTabId) {
        lastTabId = currentTabId;
    } else {
        dropCurrentTabId = true;
    }
    currentTabId = activeInfo.tabId;
}

function tabUpdated(tabId, changeInfo, tab) {
    if (changeInfo.favIconUrl !== undefined) {
        sendMessage("TAB_FAV_ICON_CHANGED", {
            tabId: tabId,
            favIconUrl: changeInfo.favIconUrl
        });
    }
    if (changeInfo.pinned !== undefined) {
        sendMessage("TAB_PINNED_STATUS_CHANGED", {
            tabId: tabId,
            pinned: changeInfo.pinned
        });
    }
    if (changeInfo.title !== undefined) {
        sendMessage("TAB_TITLE_CHANGED", {
            tabId: tabId,
            title: changeInfo.title
        });
    }
}

function tabRemoved(tabId, removeInfo) {
    sendMessage("TAB_REMOVED", {
        tabId: tabId, 
        windowId: removeInfo.windowId,
        windowClosing: removeInfo.isWindowClosing
    });
    if (lastTabId === tabId) {
        lastTabId = undefined;
    }
    if (currentTabId === tabId) {
        currentTabId = undefined;
        dropCurrentTabId = false;
    }
}

function windowFocusChanged(windowId) {
    if (windowId !== browser.windows.WINDOW_ID_NONE) {
        if (dropCurrentWindowId) {
            lastWindowId = currentWindowId;
        } else {
            dropCurrentWindowId = true;
        }
        currentWindowId = windowId;
    }
}

function windowRemoved(windowId) {
    sendMessage("WINDOW_REMOVED", {
        windowId: windowId
    });
    if (lastWindowId === windowId) {
        lastWindowId = undefined;
    }
    if (currentWindowId === windowId) {
        currentWindowId = undefined;
        dropCurrentWindowId = false;
    }
}

function onCommand(name) {
    switch (name) {
        case "last-used-tab":
            if (lastTabId !== undefined) {
                browser.tabs.update(lastTabId, {
                    active: true
                });
            }
            break;
        case "last-used-window":
            if (lastWindowId !== undefined) {
                browser.windows.update(lastWindowId, {
                    focused: true
                });
            }
            break;
    }
}

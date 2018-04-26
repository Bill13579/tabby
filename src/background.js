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

/********** Fix for cross-window dragging issue **********/
var wrongToRight = {};
var rightToWrong = {};

browser.tabs.onAttached.addListener(fixOnAttached);
browser.tabs.onRemoved.addListener(fixOnRemoved);
browser.runtime.onMessage.addListener(onMessage);

function fixOnAttached(tabId, attachInfo) {
    browser.tabs.get(tabId).then(function (tab){
        if (tabId !== tab.id) {
            let lastWrongId = rightToWrong[tabId];
            if (lastWrongId) {
                delete wrongToRight[lastWrongId];
            }
            wrongToRight[tab.id] = tabId;
            rightToWrong[tabId] = tab.id;
        }
    });
}

function fixOnRemoved(tabId, removeInfo) {
    let wrongId = rightToWrong[tabId];
    if (wrongId) {
        delete wrongToRight[wrongId];
    }
    delete rightToWrong[tabId];
}

function getCorrectTabId(tabId) {
    return wrongToRight[tabId] || tabId;
}

function onMessage(request, sender, sendResponse) {
    switch (request.msg) {
        case "WRONG_TO_RIGHT_GET":
            sendResponse({
                wrongToRight: wrongToRight
            });
            break;
    }
}

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
            tabId: getCorrectTabId(tabId),
            favIconUrl: changeInfo.favIconUrl
        });
    }
    if (changeInfo.pinned !== undefined) {
        sendMessage("TAB_PINNED_STATUS_CHANGED", {
            tabId: getCorrectTabId(tabId),
            pinned: changeInfo.pinned
        });
    }
    if (changeInfo.title !== undefined) {
        sendMessage("TAB_TITLE_CHANGED", {
            tabId: getCorrectTabId(tabId),
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
        browser.tabs.query({
            active: true,
            windowId: windowId
        }).then(function (tabs){
            if (tabs[0].id !== currentTabId) {
                if (dropCurrentTabId) {
                    lastTabId = currentTabId;
                } else {
                    dropCurrentTabId = true;
                }
                currentTabId = tabs[0].id;
            }
        });
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
                browser.windows.getLastFocused({}).then(function (w){
                    browser.tabs.get(lastTabId).then(function (tab) {
                        if (w.id !== tab.windowId) {
                            browser.windows.update(tab.windowId, {
                                focused: true
                            });
                            lastTabId = currentTabId;
                        }
                    });
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

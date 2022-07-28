import "Polyfill"

import { TTabActions, TWindowActions } from "../tapi/taction"

let currentTabId = undefined;
let lastTabId = undefined;
let currentWindowId = undefined;
let lastWindowId = undefined;
let dropCurrentTabId = false;
let dropCurrentWindowId = false;

let __search = undefined;

browser.runtime.onMessage.addListener(message => {
    if (message["_"] !== "initialFocus") return;
    let promise = Promise.resolve({
        "_": "initialFocus",
        "search": __search
    });
    if (__search !== undefined) __search = undefined;
    return promise;
});

browser.tabs.onActivated.addListener((activeInfo) => {
    if (dropCurrentTabId) {
        lastTabId = currentTabId;
    } else {
        dropCurrentTabId = true;
    }
    currentTabId = activeInfo.tabId;
});
browser.tabs.onRemoved.addListener((tabId, _) => {
    if (lastTabId === tabId) {
        lastTabId = undefined;
    }
    if (currentTabId === tabId) {
        currentTabId = undefined;
        dropCurrentTabId = false;
    }
});
browser.windows.onFocusChanged.addListener((windowId) => {
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
        }).then(tabs => {
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
});
browser.windows.onRemoved.addListener((windowId) => {
    if (lastWindowId === windowId) {
        lastWindowId = undefined;
    }
    if (currentWindowId === windowId) {
        currentWindowId = undefined;
        dropCurrentWindowId = false;
    }
});

browser.commands.onCommand.addListener((name) => {
    switch (name) {
        case "last-used-tab": {
            if (lastTabId !== undefined) {
                new TTabActions(lastTabId).activate();
                browser.windows.getLastFocused({ populate: false }).then(w => {
                    browser.tabs.get(lastTabId).then(tab => {
                        if (w.id !== tab.windowId) {
                            new TWindowActions(tab.windowId).activate();
                            lastTabId = currentTabId;
                        }
                    });
                });
            }
            break;
        }
        case "last-used-window": {
            if (lastWindowId !== undefined) {
                new TWindowActions(lastWindowId).activate();
            }
            break;
        }
        case "open-tabby-focus-current": {
            __search = false;
            browser.browserAction.openPopup();
            break;
        }
        case "open-tabby-focus-search": {
            __search = true;
            browser.browserAction.openPopup();
            break;
        }
    }
});


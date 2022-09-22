import "Polyfill"
import { $local$ } from "../tapi/store";

import { TTabActions, TWindowActions } from "../tapi/taction"
import { closeTabby, cycleLayout, LAYOUT_POPUP, openTabby } from "./exports";

let currentTabId = undefined;
let lastTabId = undefined;
let currentWindowId = undefined;
let lastWindowId = undefined;
let dropCurrentTabId = false;
let dropCurrentWindowId = false;

let __search = undefined;
let __justOpened = false;

browser.runtime.onMessage.addListener((message) => {
    if (message["_"] !== "justOpened") return;
    let promise = Promise.resolve({
        "_": "justOpened",
        "justOpened": __justOpened
    });
    if (__justOpened) __justOpened = false;
    return promise;
});
browser.runtime.onMessage.addListener((message) => {
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

browser.commands.onCommand.addListener(async (name) => {
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
            __justOpened = true;
            openTabby(LAYOUT_CACHE);
            break;
        }
        case "open-tabby-focus-search": {
            __search = true;
            __justOpened = true;
            openTabby(LAYOUT_CACHE);
            break;
        }
        case "open-tabby-switch-view": {
            __search = false;
            __justOpened = true;
            closeTabby();
            openTabby(cycleLayout(LAYOUT_CACHE));
            $local$.modify("memory:layout", layout => cycleLayout(layout), true);
            break;
        }
    }
});
let LAYOUT_CACHE = LAYOUT_POPUP;
$local$.fulfill("memory:layout", layout => {
    LAYOUT_CACHE = layout;
});


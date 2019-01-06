import G from "../globals"
import { sendTabMessage } from "../messaging"
import { getCorrectTabId } from "../wrong-to-right"

export function tabActivated(activeInfo) {
    sendTabMessage({
        windowId: activeInfo.windowId,
        tabId: activeInfo.tabId
    }, "ACTIVE_TAB_CHANGED");
    if (G.dropCurrentTabId) {
        G.lastTabId = G.currentTabId;
    } else {
        G.dropCurrentTabId = true;
    }
    G.currentTabId = activeInfo.tabId;
}

export function tabUpdated(tabId, changeInfo, tab) {
    if (changeInfo.favIconUrl !== undefined) {
        sendTabMessage({
            tabId: getCorrectTabId(tabId),
            favIconUrl: changeInfo.favIconUrl
        }, "TAB_FAV_ICON_CHANGED");
    }
    if (changeInfo.pinned !== undefined) {
        sendTabMessage({
            tabId: getCorrectTabId(tabId),
            pinned: changeInfo.pinned
        }, "TAB_PINNED_STATUS_CHANGED");
    }
    if (changeInfo.title !== undefined) {
        sendTabMessage({
            tabId: getCorrectTabId(tabId),
            title: changeInfo.title
        }, "TAB_TITLE_CHANGED");
    }
}

export function tabRemoved(tabId, removeInfo) {
    sendTabMessage({
        tabId: tabId,
        windowId: removeInfo.windowId,
        windowClosing: removeInfo.isWindowClosing
    }, "TAB_REMOVED");
    if (G.lastTabId === tabId) {
        G.lastTabId = undefined;
    }
    if (G.currentTabId === tabId) {
        G.currentTabId = undefined;
        G.dropCurrentTabId = false;
    }
}

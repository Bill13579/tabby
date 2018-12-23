import G from "./globals"
import { getCorrectTabId } from "./wrong-to-right"

export function getTabByTabEntry(entry) {
    return browser.tabs.get(parseInt(entry.getAttribute("data-tab_id")));
}

// Find tab entry by tab id
export function findTabEntryById(tabId) {
    return document.querySelector(".tab-entry[data-tab_id=\"" + tabId + "\"]");
}

// Find correct tab entry by tab id
export function findCorrectTabEntryById(tabId) {
    return findTabEntryById(getCorrectTabId(tabId));
}

// Get favicon from a tab entry
export function getFavIconFromTabEntry(entry) {
    return entry.getElementByClassName("tab-entry-favicon");
}

// Find window entry by tab id
export function findWindowEntryById(windowId) {
    return G.tabsList.querySelector("li[data-window_id=\"" + windowId + "\"]");
}

// Find tab entry inside a window entry
export function findTabEntryInWindow(windowEntry, tabId) {
    return windowEntry.querySelector("li[data-tab_id=\"" + tabId + "\"]");
}

// Get active tab in the specified window
export function getActiveTab(windowId) {
    let window = findWindowEntryById(windowId);
    return window.getElementByClassName("current-tab");
}

// Set active tab in the specified window
export function setActiveTab(windowId, tabId) {
    let window = findWindowEntryById(windowId), lastActiveTab;
    if ((lastActiveTab = getActiveTab(windowId)) !== null) {
        lastActiveTab.classList.remove("current-tab");
    }
    findTabEntryInWindow(window, tabId).classList.add("current-tab");
}

// Remove tab
export function removeTab(tabId, windowId) {
    let tabEntry = findTabEntryById(tabId);
    tabEntry.parentElement.removeChild(tabEntry);
    browser.tabs.query({
        active: true,
        windowId: windowId
    }).then(tabs => {
        findCorrectTabEntryById(tabs[0].id).classList.add("current-tab");
    });
}

// Move tab
export function moveTab(tabId, windowId, toIndex) {
    let tab = findTabEntryById(tabId);
    let tabsListDOM = findWindowEntryById(windowId).getElementByClassName("window-entry-tabs");
    tabsListDOM.removeChild(tab);
    if (toIndex === -1) {
        tabsListDOM.appendChild(tab);
        return;
    }
    tabsListDOM.insertBefore(tab, tabsListDOM.childNodes[toIndex]);
}

// Attach tab
export function attachTab(tabId, from, to, toIndex) {
    let tab = findTabEntryById(tabId);
    let oldTabsListDOM = findWindowEntryById(from).getElementByClassName("window-entry-tabs");
    let newTabsListDOM = findWindowEntryById(to).getElementByClassName("window-entry-tabs");
    oldTabsListDOM.removeChild(tab);
    if (toIndex === -1) {
        newTabsListDOM.appendChild(tab);
        return;
    }
    newTabsListDOM.insertBefore(tab, newTabsListDOM.childNodes[toIndex]);
}

// Remove window
export function removeWindow(windowId) {
    let windowEntry = findWindowEntryById(windowId);
    windowEntry.parentElement.removeChild(windowEntry);
    browser.windows.getCurrent({}).then(window => {
        findWindowEntryById(window.id).classList.add("current-window");
    });
}

export function getWindowFromTab(tab) {
    return tab.parentElement.parentElement;
}

// Test if tab is draggable
export function tabDraggable(sourceTab, targetTab, under, sourceWindow) {
    return sourceTab !== targetTab
            && ((!sourceTab.classList.contains("pinned-tab") && !targetTab.classList.contains("pinned-tab"))
            || (sourceTab.classList.contains("pinned-tab") && targetTab.classList.contains("pinned-tab"))
            || (under && !sourceTab.classList.contains("pinned-tab")))
            && ((!sourceWindow.classList.contains("incognito-window") && !getWindowFromTab(targetTab).classList.contains("incognito-window"))
            || (sourceWindow.classList.contains("incognito-window") && getWindowFromTab(targetTab).classList.contains("incognito-window")));
}

export function tabEntryIndex(tabEntry) {
    let tabs = document.getElementsByClassName("tab-entry");
    for (let i = 0; i < tabs.length; i++) {
        if (tabs[i] === tabEntry) {
            return i;
        }
    }
    return -1;
}

/* Multiselect */
let selectedTabs = 0;
// Select
export function multiSelect(element) {
    if (!element.classList.contains("multiselect")) {
        selectedTabs++;
        G.isSelecting = true;
        element.classList.add("multiselect");
    }
}
// Cancel Selection
export function multiSelectCancel(element) {
    if (element.classList.contains("multiselect")) {
        if (--selectedTabs == 0) {
            G.isSelecting = false;
        }
        element.classList.remove("multiselect");
    }
}
// Toggle Selection
export function multiSelectToggle(element) {
    if (element.classList.contains("multiselect")) {
        multiSelectCancel(element);
    } else {
        multiSelect(element);
    }
}
// Reset slide selection
export function resetSlideSelection() {
    G.slideSelection.sliding = false;
    G.slideSelection.initiator = undefined;
    G.slideSelection.vector = 0;
}

import "Polyfill";
import G from "./globals";
import { getCorrectTabId } from "./wrong-to-right";
import { getLastFocusedWindow } from "./wtutils";

// Select tab and go to it
export function selectTabEntry(tabEntry) {
    let tabId = getTabId(tabEntry);
    let parentWindowId = getWindowId(getWindowFromTab(tabEntry));
    browser.tabs.update(tabId, {
        active: true
    });
    browser.windows.get(parentWindowId).then(w => {
        getLastFocusedWindow().then(cw => {
            if (w.id !== cw.id) {
                browser.windows.update(w.id, {
                    focused: true
                });
            } else {
                if (G.hideAfterTabSelection) window.close();
            }
        });
    });
}

// Hides the tab preview
export function hideTabPreview() {
    document.getElementById("details-img").style.display = "none";
}

// Get a tab by a tab entry
export function getTabByTabEntry(entry) {
    return browser.tabs.get(getTabId(entry));
}

// Get the TabId of a tab entry
export function getTabId(entry) {
    return parseInt(entry.getAttribute("data-tab_id"));
}

// Get the WindowId of a window entry
export function getWindowId(entry) {
    return parseInt(entry.getAttribute("data-window_id"));
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
export function moveTab(target, dest) {
    getWindowFromTab(dest).getElementByClassName("window-entry-tabs").insertBefore(target, dest);
}

// Move tabs
export function moveTabs(targets, dest) {
    for (let i = 0; i < targets.length; i++) moveTab(targets[i], dest);
}

// Attach tab
export function attachTab(target, dest) {
    dest.getElementByClassName("window-entry-tabs").appendChild(target);
}

// Attach tabs
export function attachTabs(targets, dest) {
    for (let i = 0; i < targets.length; i++) attachTab(targets[i], dest);
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
export function getTabEntriesFromWindow(windowEntry) {
    return Array.from(windowEntry.getElementsByClassName("tab-entry"));
}

// Test if tab is draggable
export function tabDraggable(sourceTab, targetTab, under, sourceWindow) {
    return !sourceTab.isSameNode(targetTab)
            && ((!sourceTab.classList.contains("pinned-tab") && !targetTab.classList.contains("pinned-tab"))
                || (sourceTab.classList.contains("pinned-tab") && targetTab.classList.contains("pinned-tab"))
                || (under && !sourceTab.classList.contains("pinned-tab")))
            && ((!sourceWindow.classList.contains("incognito-window") && !getWindowFromTab(targetTab).classList.contains("incognito-window"))
                || (sourceWindow.classList.contains("incognito-window") && getWindowFromTab(targetTab).classList.contains("incognito-window")));
}

// Test if tab is draggable to window
export function tabDraggableToWindow(sourceTab, targetWindow, sourceWindow) {
    return !sourceWindow.isSameNode(targetWindow)
            && !sourceTab.classList.contains("pinned-tab")
            && ((!sourceWindow.classList.contains("incognito-window") && !targetWindow.classList.contains("incognito-window"))
                || (sourceWindow.classList.contains("incognito-window") && targetWindow.classList.contains("incognito-window")));
}

// Returns the index of a tab entry
export function tabEntryIndex(tabEntry) {
    let tabs = Array.from(document.getElementsByClassName("tab-entry"));
    for (let i = 0; i < tabs.length; i++) {
        if (tabs[i] === tabEntry) {
            return i;
        }
    }
    return -1;
}

// Get next tab
export function getNextTabEntry(tabEntry) {
    if (tabEntry.nextElementSibling !== null) {
        return tabEntry.nextElementSibling;
    } else if (getWindowFromTab(tabEntry).nextElementSibling !== null) {
        return getTabEntriesFromWindow(getWindowFromTab(tabEntry).nextElementSibling)[0];
    } else {
        return null;
    }
}
// Get last tab
export function getLastTabEntry(tabEntry) {
    if (tabEntry.previousElementSibling !== null) {
        return tabEntry.previousElementSibling;
    } else if (getWindowFromTab(tabEntry).previousElementSibling !== null) {
        return getTabEntriesFromWindow(getWindowFromTab(tabEntry).previousElementSibling)[0];
    } else {
        return null;
    }
}

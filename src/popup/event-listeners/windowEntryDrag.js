import G from "../globals"
import { ctrlOrCmd } from "../keyutils"
import { moveTab, attachTab, getWindowFromTab, tabDraggable, multiSelect, findTabEntryById } from "../wtdom"

let sourceTab, targetTab, under, sourceWindow, sourceWindowId;

export function windowEntryDragStarted(e) {
    if (e.target.classList.contains("tab-entry")) {
        if (ctrlOrCmd()) {
            multiSelect(e.target);
            G.slideSelection.sliding = true;
            e.preventDefault();
        } else {
            sourceTab = e.target;
            sourceWindow = getWindowFromTab(sourceTab);
            sourceWindowId = parseInt(sourceWindow.getAttribute("data-window_id"));
            e.dataTransfer.effectAllowed = "move";
        }
        e.dataTransfer.setData('text/plain', null);
    }
}

export function windowEntryDraggingOver(e) {
    e.preventDefault();
    let cursors = G.tabsList.getElementsByClassName("insert-cursor");
    for (let c of cursors) {
        c.parentElement.removeChild(c);
    }
    let cursorWindow = G.tabsList.getElementByClassName("insert-cursor-window");
    if (cursorWindow !== null) {
        cursorWindow.classList.remove("insert-cursor-window");
    }

    let windowEntry;
    if (e.target.classList.contains("tab-entry")) {
        let tabEntryBoundingClientRect = e.target.getBoundingClientRect();
        targetTab = e.target;
        under = false;
        if ((e.clientY - tabEntryBoundingClientRect.top) >= tabEntryBoundingClientRect.height / 2) {
            targetTab = targetTab.nextSibling;
            if (targetTab === null) {
                under = true;
                targetTab = e.target;
            }
        }
        if (tabDraggable(sourceTab, targetTab, under, sourceWindow)) {
            let cursor = document.createElement("div");
            cursor.classList.add("insert-cursor");
            if (under) {
                targetTab.parentElement.appendChild(cursor);
            } else {
                targetTab.parentElement.insertBefore(cursor, targetTab);
            }
        }
    } else if ((windowEntry = e.target.parentElement) !== null) {
        if (windowEntry.classList.contains("window-entry")
            && sourceWindow !== windowEntry
            && !sourceTab.classList.contains("pinned-tab")
            && ((!sourceWindow.classList.contains("incognito-window") && !windowEntry.classList.contains("incognito-window"))
            || (sourceWindow.classList.contains("incognito-window") && windowEntry.classList.contains("incognito-window")))) {
            e.target.classList.add("insert-cursor-window");
        }
    }
}

export function windowEntryDropped(e) {
    e.preventDefault();
    e.stopPropagation();
    let cursors = G.tabsList.getElementsByClassName("insert-cursor");
    for (let cursor of cursors) {
        cursor.parentElement.removeChild(cursor);
    }
    let cursorWindow = G.tabsList.getElementByClassName("insert-cursor-window");
    if (cursorWindow !== null) {
        cursorWindow.classList.remove("insert-cursor-window");
    }
    
    let windowEntry;
    if (e.target.classList.contains("tab-entry")) {
        if (!e.target.isSameNode(targetTab)) {
            let tabEntryBoundingClientRect = e.target.getBoundingClientRect();
            targetTab = e.target;
            under = false;
            if ((e.clientY - tabEntryBoundingClientRect.top) >= tabEntryBoundingClientRect.height / 2) {
                targetTab = targetTab.nextSibling;
                if (targetTab === null) {
                    under = true;
                    targetTab = e.target;
                }
            }
        }
        if (tabDraggable(sourceTab, targetTab, under, sourceWindow)) {
            let destinationWindowId = parseInt(getWindowFromTab(targetTab).getAttribute("data-window_id"));
            let sourceTabIndex = Array.prototype.indexOf.call(targetTab.parentElement.childNodes, sourceTab);
            let destinationIndex = Array.prototype.indexOf.call(targetTab.parentElement.childNodes, targetTab);
            let moveIndex = under ? -1 : ((sourceTabIndex !== -1 && destinationIndex > sourceTabIndex && destinationWindowId === sourceWindowId) ? destinationIndex-1 : destinationIndex);
            let sourceTabId = parseInt(sourceTab.getAttribute("data-tab_id"));
            browser.tabs.move(sourceTabId, {
                windowId: destinationWindowId,
                index: moveIndex
            });
            if (under) {
                attachTab(sourceTab, getWindowFromTab(targetTab));
            } else {
                moveTab(sourceTab, targetTab);
            }
        }
    } else if ((windowEntry = e.target.parentElement) !== null) {
        if (windowEntry.classList.contains("window-entry")
            && sourceWindow !== windowEntry
            && !sourceTab.classList.contains("pinned-tab")
            && ((!sourceWindow.classList.contains("incognito-window") && !windowEntry.classList.contains("incognito-window"))
            || (sourceWindow.classList.contains("incognito-window") && windowEntry.classList.contains("incognito-window")))) {
            let sourceTabId = parseInt(sourceTab.getAttribute("data-tab_id"));
            let destinationWindowId = parseInt(windowEntry.getAttribute("data-window_id"));
            browser.tabs.move(sourceTabId, {
                windowId: destinationWindowId,
                index: -1
            });
            attachTab(sourceTab, windowEntry);
        }
    }
}

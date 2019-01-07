import G from "../globals"
import { ctrlOrCmd } from "../keyutils"
import { moveTab, attachTab, getWindowFromTab, tabDraggable, multiSelect, findTabEntryById } from "../wtdom"

var sourceTab, targetTab, under, sourceWindow, sourceWindowId;

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
    var cursors = G.tabsList.getElementsByClassName("insert-cursor");
    for (var c of cursors) {
        c.parentElement.removeChild(c);
    }
    var cursorWindow = G.tabsList.getElementByClassName("insert-cursor-window");
    if (cursorWindow !== null) {
        cursorWindow.classList.remove("insert-cursor-window");
    }

    var windowEntry;
    if (e.target.classList.contains("tab-entry")) {
        var tabEntryBoundingClientRect = e.target.getBoundingClientRect();
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
            var cursor = document.createElement("div");
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
    var cursors = G.tabsList.getElementsByClassName("insert-cursor");
    for (var cursor of cursors) {
        cursor.parentElement.removeChild(cursor);
    }
    var cursorWindow = G.tabsList.getElementByClassName("insert-cursor-window");
    if (cursorWindow !== null) {
        cursorWindow.classList.remove("insert-cursor-window");
    }
    
    var windowEntry;
    if (e.target.classList.contains("tab-entry")) {
        if (!e.target.isSameNode(targetTab)) {
            var tabEntryBoundingClientRect = e.target.getBoundingClientRect();
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
            var destinationWindowId = parseInt(getWindowFromTab(targetTab).getAttribute("data-window_id"));
            var sourceTabIndex = Array.prototype.indexOf.call(targetTab.parentElement.childNodes, sourceTab);
            var destinationIndex = Array.prototype.indexOf.call(targetTab.parentElement.childNodes, targetTab);
            var moveIndex = under ? -1 : ((sourceTabIndex !== -1 && destinationIndex > sourceTabIndex && destinationWindowId === sourceWindowId) ? destinationIndex-1 : destinationIndex);
            var sourceTabId = parseInt(sourceTab.getAttribute("data-tab_id"));
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
            var sourceTabId = parseInt(sourceTab.getAttribute("data-tab_id"));
            var destinationWindowId = parseInt(windowEntry.getAttribute("data-window_id"));
            browser.tabs.move(sourceTabId, {
                windowId: destinationWindowId,
                index: -1
            });
            attachTab(sourceTab, windowEntry);
        }
    }
}

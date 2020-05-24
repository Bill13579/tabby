import "Polyfill";
import G from "../globals";
import { attachTab, getTabId, getWindowFromTab, getWindowId, moveTab, tabDraggable, tabDraggableToWindow } from "../wtdom";
import { showContextMenu } from "../domutils";

let sourceTab, targetTab, under, sourceWindow, sourceWindowId;

export function windowEntryDragStarted(e) {
    if (e.target.classList.contains("tab-entry")) {
        sourceTab = e.target;
        sourceWindow = getWindowFromTab(sourceTab);
        sourceWindowId = getWindowId(sourceWindow);
        e.dataTransfer.effectAllowed = "move";
        e.dataTransfer.setData('text/plain', null);
    }
}

export function windowEntryDraggingOver(e) {
    e.preventDefault();
    let cursors = Array.from(G.tabsList.getElementsByClassName("insert-cursor"));
    for (let i = 0; i < cursors.length; i++) {
        let c = cursors[i];
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
    } else if ((windowEntry = e.target.parentElement) !== null && windowEntry.classList.contains("window-entry")) {
        if (tabDraggableToWindow(sourceTab, windowEntry, sourceWindow)) {
            e.target.classList.add("insert-cursor-window");
        }
    }
}

export function windowEntryDropped(e) {
    e.preventDefault();
    e.stopPropagation();
    let cursors = Array.from(G.tabsList.getElementsByClassName("insert-cursor"));
    for (let i = 0; i < cursors.length; i++) {
        let cursor = cursors[i];
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
            let destinationWindowId = getWindowId(getWindowFromTab(targetTab));
            let sourceTabIndex = Array.prototype.indexOf.call(targetTab.parentElement.childNodes, sourceTab);
            let destinationIndex = Array.prototype.indexOf.call(targetTab.parentElement.childNodes, targetTab);
            let moveIndex = under ? -1 : ((sourceTabIndex !== -1 && destinationIndex > sourceTabIndex && destinationWindowId === sourceWindowId) ? destinationIndex-1 : destinationIndex);
            let sourceTabId = getTabId(sourceTab);
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
    } else if ((windowEntry = e.target.parentElement) !== null && windowEntry.classList.contains("window-entry")) {
        if (tabDraggableToWindow(sourceTab, windowEntry, sourceWindow)) {
            let sourceTabId = getTabId(sourceTab);
            let destinationWindowId = getWindowId(windowEntry);
            browser.tabs.move(sourceTabId, {
                windowId: destinationWindowId,
                index: -1
            });
            attachTab(sourceTab, windowEntry);
        }
    }
}

export function windowEntryTitleClicked(e) {
    let windowId = getWindowId(e.target.parentElement);
    browser.windows.update(windowId, {
        focused: true
    });
}

export function windowEntryContextMenu(e) {
    e.preventDefault();
    let menu = document.getElementById("window-entry-context-menu");
    menu.setAttribute("data-window-id", getWindowId(e.target.parentElement));
    showContextMenu(e.pageX, e.pageY, menu);
}

export function windowCloseClick(e) {
    let windowId = getWindowId(e.target.parentElement.parentElement.parentElement);
    browser.windows.remove(windowId);
}

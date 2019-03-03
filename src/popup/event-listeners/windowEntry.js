import "Polyfill"
import G from "../globals"
import { ctrlOrCmd } from "../keyutils"
import { moveTab, attachTab, getWindowFromTab, tabDraggable, multiSelect, getSelectedItems, multiSelected, tabDraggableToWindow, getTabId, getWindowId } from "../wtdom"

let multiDragging = false, sourceTab, targetTab, under, sourceWindow, sourceWindowId;

function getMultiDragImage(target, clientX, clientY) {
    let dragImage = document.createElement("div"), x, y;
    let selectedItems = getSelectedItems();
    if (selectedItems.length === 1) return selectedItems[i];
    for (let i = 0; i < selectedItems.length - 1; i++) {
        let ref1 = selectedItems[i], ref2 = selectedItems[i+1];
        let ref1br = ref1.getBoundingClientRect(), ref2br = ref2.getBoundingClientRect();
        let distance = ref2br.top - (ref1br.top + ref1br.height);
        let ref1Clone = ref1.cloneNode(true);
        ref1Clone.style.marginBottom = distance + "px";
        dragImage.appendChild(ref1Clone);
    } dragImage.appendChild(selectedItems[selectedItems.length - 1].cloneNode(true));
    dragImage.style.width = selectedItems[0].getBoundingClientRect().width + "px";
    document.body.appendChild(dragImage);
    return {
        image: dragImage,
        x: 0,
        y: 0
    };
}

export function windowEntryDragStarted(e) {
    if (e.target.classList.contains("tab-entry")) {
        if (ctrlOrCmd()) {
            multiSelect(e.target);
            G.slideSelection.sliding = true;
            e.preventDefault();
        } else {
            sourceTab = e.target;
            sourceWindow = getWindowFromTab(sourceTab);
            sourceWindowId = getWindowId(sourceWindow);
            e.dataTransfer.effectAllowed = "move";
            if (G.isSelecting && multiSelected(e.target)) {
                multiDragging = true;
                let dragImage = getMultiDragImage();
                e.dataTransfer.setDragImage(dragImage.image, dragImage.x, dragImage.y);
            }
        }
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
        if (tabDraggable(sourceTab, targetTab, under, sourceWindow, multiDragging)) {
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
        if (tabDraggable(sourceTab, targetTab, under, sourceWindow, multiDragging)) {
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

export function windowCloseClick(e) {
    let windowId = getWindowId(e.target.parentElement.parentElement.parentElement);
    browser.windows.remove(windowId);
}

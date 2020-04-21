import "Polyfill"
import G from "../globals"
import { ctrlOrCmd } from "../keyutils"
import { getLastFocusedWindow } from "../wtutils"
import * as captureTab from "../captureTab"
import { getWindowFromTab, multiSelect, multiSelectToggle, getTabId, getWindowId, multiSelectCancel, selectTabEntry } from "../wtdom"

export function selectTab(tabEntry) {
    let tabId = getTabId(tabEntry);
    let currentSelected = document.getElementsByClassName("selected-entry");
    if (currentSelected.length > 0) currentSelected[0].classList.remove("selected-entry");
    tabEntry.classList.add("selected-entry");
    document.getElementById("details").setAttribute("data-details-of", tabId);
    captureTab.captureTab(tabId).then(dataUri => {
        if (dataUri !== null) {
            document.getElementById("details-img").src = dataUri;
        }
        browser.tabs.get(tabId).then(tab => {
            document.getElementById("details-title").textContent = tab.title;
            document.getElementById("details-url").textContent = tab.url;
            document.getElementById("details-placeholder").style.display = "none";
            document.getElementById("tab-details").style.display = "inline-block";
            document.getElementById("tab-details").setAttribute("data-tab_id", tabId);
            if (tab.pinned) {
                document.getElementById("details-pinned").style.display = "inline";
            } else {
                document.getElementById("details-pinned").style.display = "none";
            }
            if (tab.hidden) {
                document.getElementById("details-hidden").style.display = "inline";
            } else {
                document.getElementById("details-hidden").style.display = "none";
            }
            if (tab.pinned && tab.hidden) {
                document.getElementById("details-comma").style.display = "inline";
            } else {
                document.getElementById("details-comma").style.display = "none";
            }
        });
    });
}

export function tabEntryMouseOver(e) {
    if (ctrlOrCmd() && G.slideSelection.sliding) {
        if (G.slideSelection.initiator !== e.target) {
            if (G.slideSelection.initiator.classList.contains("multiselect")) {
                multiSelect(e.target);
            } else {
                multiSelectCancel(e.target);
            }
        }
    } else {
        selectTab(e.target);
    }
    e.preventDefault();
}

export function tabEntryClicked(e) {
    if (e.button === 0) {
        if (ctrlOrCmd()) {
            multiSelectToggle(e.target);
            e.stopPropagation();
        } else {
            selectTabEntry(e.target);
        }
    }
}

export function tabCloseClick(e) {
    e.stopPropagation();
    let tabId = e.target.parentElement.parentElement.getAttribute("data-tab_id");
    let tabDetails = document.getElementById("tab-details");
    if (tabDetails.getAttribute("data-tab_id") === tabId) {
        tabDetails.style.display = "none";
        document.getElementById("details-placeholder").style.display = "inline-block";
    }
    browser.tabs.remove(parseInt(tabId));
}

export function tabPinClick(e) {
    e.stopPropagation();
    let tabId = getTabId(e.target.parentElement.parentElement);
    browser.tabs.get(tabId).then(tab => {
        if (tab.pinned) {
            browser.tabs.update(tab.id, {
                pinned: false
            });
        } else {
            browser.tabs.update(tab.id, {
                pinned: true
            });
        }
    });
}

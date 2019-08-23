import "Polyfill"
import G from "../globals"
import { ctrlOrCmd } from "../keyutils"
import { getLastFocusedWindow } from "../wtutils"
import * as captureTab from "../captureTab"
import { getWindowFromTab, multiSelect, multiSelectToggle, resetSlideSelection, multiSelectReset, getTabId, getWindowId } from "../wtdom"

export function tabEntryMouseOver(e) {
    e.target.getElementByClassName("tab-entry-pin-btn").style.display = "inline-block";
    if (ctrlOrCmd() && G.slideSelection.sliding) {
        multiSelect(e.target);
    } else {
        let tabId = getTabId(e.target);
        captureTab.captureTab(tabId).then(dataUri => {
            if (dataUri !== null) {
                let detailsImage = document.getElementById("details-img");
                detailsImage.src = dataUri;
            }
            let detailsTitle = document.getElementById("details-title");
            let detailsURL = document.getElementById("details-url");
            browser.tabs.get(tabId).then(tab => {
                detailsTitle.textContent = tab.title;
                detailsURL.textContent = tab.url;
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
    e.preventDefault();
}

export function tabEntryMouseLeave(e) {
    e.target.getElementByClassName("tab-entry-pin-btn").style.display = "none";
}

export function tabEntryClicked(e) {
    if (e.button === 0) {
        if (ctrlOrCmd()) {
            multiSelectToggle(e.target);
        } else {
            let tabId = getTabId(e.target);
            let parentWindowId = getWindowId(getWindowFromTab(e.target));
            browser.tabs.update(tabId, {
                active: true
            });
            browser.windows.get(parentWindowId).then(w => {
                getLastFocusedWindow().then(cw => {
                    if (w.id !== cw.id) {
                        browser.windows.update(w.id, {
                            focused: true
                        });
                    }
                    if (G.hideAfterTabSelection) window.close();
                });
            });
        }
    }
}

export function tabCloseClick(e) {
    let tabId = e.target.parentElement.parentElement.getAttribute("data-tab_id");
    let tabDetails = document.getElementById("tab-details");
    if (tabDetails.getAttribute("data-tab_id") === tabId) {
        tabDetails.style.display = "none";
        document.getElementById("details-placeholder").style.display = "inline-block";
    }
    browser.tabs.remove(parseInt(tabId));
}

export function tabPinClick(e) {
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

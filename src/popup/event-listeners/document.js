import G from "../globals"
import { ctrlOrCmd } from "../keyutils"
import { getCurrentWindow } from "../wtutils"
import { getWindowFromTab, multiSelect, multiSelectToggle, resetSlideSelection, multiSelectReset } from "../wtdom"

export function documentMouseOver(e) {
    if (e.button === 0) {
        if (e.target.classList.contains("tab-entry")) {
            if (ctrlOrCmd() && G.slideSelection.sliding) {
                multiSelect(e.target);
            } else {
                let tabId = parseInt(e.target.getAttribute("data-tab_id"));
                browser.tabs.captureTab(tabId).then(dataUri => {
                    let detailsImage = document.getElementById("details-img");
                    detailsImage.src = dataUri;
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
        }
    }
    e.preventDefault();
}

export function documentMouseUp(e) {
    if (G.slideSelection.sliding) resetSlideSelection();
}

export function documentClicked(e) {
    if (e.button === 0) {
        if (e.target.classList.contains("tab-entry")) {
            if (ctrlOrCmd()) {
                multiSelectToggle(e.target);
            } else {
                let tabId = parseInt(e.target.getAttribute("data-tab_id"));
                let parentWindowId = parseInt(getWindowFromTab(e.target).getAttribute("data-window_id"));
                browser.tabs.update(tabId, {
                    active: true
                });
                browser.windows.get(parentWindowId).then(w => {
                    getCurrentWindow().then(cw => {
                        if (w.id !== cw.id) {
                            browser.windows.update(w.id, {
                                focused: true
                            });
                        }
                        window.close();
                    });
                });
            }
        } else if (e.target.parentElement.classList.contains("window-entry")) {
            let windowId = parseInt(e.target.parentElement.getAttribute("data-window_id"));
            browser.windows.update(windowId, {
                focused: true
            });
        } else if (e.target.id === "details-close") {
            document.getElementById("details-placeholder").style.display = "inline-block";
            document.getElementById("tab-details").style.display = "none";
            browser.tabs.remove(parseInt(document.getElementById("tab-details").getAttribute("data-tab_id")));
        } else if (e.target.classList.contains("tab-entry-remove-btn")) {
            let tabId = e.target.parentElement.parentElement.getAttribute("data-tab_id");
            let tabDetails = document.getElementById("tab-details");
            if (tabDetails.getAttribute("data-tab_id") === tabId) {
                tabDetails.style.display = "none";
                document.getElementById("details-placeholder").style.display = "inline-block";
            }
            browser.tabs.remove(parseInt(tabId));
        } else if (e.target.classList.contains("tab-entry-pin-btn")) {
            let tabId = e.target.parentElement.parentElement.getAttribute("data-tab_id");
            browser.tabs.get(parseInt(tabId)).then(tab => {
                if (tab.pinned) {
                    browser.tabs.update(parseInt(tabId), {
                        pinned: false
                    });
                } else {
                    browser.tabs.update(parseInt(tabId), {
                        pinned: true
                    });
                }
            });
        } else if (e.target.classList.contains("window-entry-remove-btn")) {
            let windowId = e.target.parentElement.parentElement.parentElement.getAttribute("data-window_id");
            browser.windows.remove(parseInt(windowId));
        } else {
            if (G.isSelecting) multiSelectReset();
        }
    }
}

export function documentDragOver(e) {
    if (G.archive.classList.contains("saving-for-later")) {
        G.archive.classList.remove("saving-for-later");
    }
}

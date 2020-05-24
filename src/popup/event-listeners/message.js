import "Polyfill"
import "../domutils"
import { getImage } from "../net"
import { findTabEntryById, getFavIconFromTabEntry, setActiveTab, removeTab, removeWindow, getWindowFromTab } from "../wtdom"

export function onMessage(request, sender) {
    switch (request.type) {
        case "INIT__PUT_FOCUS_ON_CURRENT": {
            let e = document.getElementsByClassName("current-window")[0].getElementsByClassName("current-tab")[0];
            e.classList.add("selected-entry");
            e.scrollIntoView({ behavior: 'smooth' });
            e.focus();
            break;
        }
        case "ACTIVE_TAB_CHANGED": {
            setActiveTab(request.details.windowId, request.details.tabId);
            break;
        }
        case "TAB_FAV_ICON_CHANGED": {
            browser.tabs.get(request.details.tabId).then(tab => {
                let favIconPromise;
                if (tab.incognito) {
                    favIconPromise = getImage(request.details.favIconUrl, true);
                } else {
                    favIconPromise = getImage(request.details.favIconUrl);
                }
                favIconPromise.then(function (base64Image){
                    getFavIconFromTabEntry(findTabEntryById(request.details.tabId)).src = base64Image;
                });
            });
            break;
        }
        case "TAB_PINNED_STATUS_CHANGED": {
            let tabEntry = findTabEntryById(request.details.tabId);
            let pinBtn = tabEntry.getElementByClassName("tab-entry-pin-btn");
            let windowEntryList = tabEntry.parentElement;
            let pinnedTabs;
            if (request.details.pinned) {
                pinnedTabs = Array.from(windowEntryList.getElementsByClassName("pinned-tab"));
                tabEntry.classList.add("pinned-tab");
                pinBtn.style.backgroundImage = "url(../icons/pinremove.svg)";
            } else {
                pinnedTabs = Array.from(windowEntryList.getElementsByClassName("pinned-tab"));
                tabEntry.classList.remove("pinned-tab");
                pinBtn.style.backgroundImage = "url(../icons/pin.svg)";
            }
            let lastPinnedTab = pinnedTabs[pinnedTabs.length-1];
            if (lastPinnedTab !== undefined) {
                windowEntryList.insertBefore(tabEntry, lastPinnedTab.nextSibling);
            } else {
                windowEntryList.insertBefore(tabEntry, windowEntryList.childNodes[0]);
            }
            break;
        }
        case "TAB_TITLE_CHANGED": {
            findTabEntryById(request.details.tabId).getElementByClassName("tab-title").textContent = request.details.title;
            break;
        }
        case "TAB_AUDIBLE_CHANGED": {
            browser.tabs.get(request.details.tabId).then(tab => {
                findTabEntryById(tab.id).getElementByClassName("tab-entry-speaker-btn").setAttribute("data-state", tab.mutedInfo.muted ? "off" : "on");
                resolve();
            });
            break;
        }
        case "TAB_MUTE_CHANGED": {
            findTabEntryById(request.details.tabId).getElementByClassName("tab-entry-speaker-btn").setAttribute("data-state", request.details.mutedInfo.muted ? "off" : "on");
            break;
        }
        case "TAB_REMOVED": {
            if (!request.details.windowClosing) {
                removeTab(request.details.tabId, request.details.windowId);
            }
            break;
        }
        case "WINDOW_REMOVED": {
            removeWindow(request.details.windowId);
            break;
        }
    }
}

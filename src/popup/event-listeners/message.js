import "../domutils"
import { getImage } from "../net"
import { findTabEntryById, getFavIconFromTabEntry, setActiveTab, removeTab, removeWindow } from "../wtdom"

export function onMessage(request, sender) {
    switch (request.type) {
        case "ACTIVE_TAB_CHANGED":
            setActiveTab(request.details.windowId, request.details.tabId);
            break;
        case "TAB_FAV_ICON_CHANGED":
            browser.tabs.get(request.details.tabId).then(tab => {
                var favIconPromise;
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
        case "TAB_PINNED_STATUS_CHANGED":
            var tabEntry = findTabEntryById(request.details.tabId);
            var pinBtn = tabEntry.getElementByClassName("tab-entry-pin-btn");
            var windowEntryList = tabEntry.parentElement;
            var pinnedTabs;
            if (request.details.pinned) {
                pinnedTabs = windowEntryList.getElementsByClassName("pinned-tab");
                tabEntry.classList.add("pinned-tab");
                pinBtn.style.backgroundImage = "url(../icons/pinremove.svg)";
            } else {
                pinnedTabs = windowEntryList.getElementsByClassName("pinned-tab");
                tabEntry.classList.remove("pinned-tab");
                pinBtn.style.backgroundImage = "url(../icons/pin.svg)";
            }
            var lastPinnedTab = pinnedTabs[pinnedTabs.length-1];
            if (lastPinnedTab !== undefined) {
                windowEntryList.insertBefore(tabEntry, lastPinnedTab.nextSibling);
            } else {
                windowEntryList.insertBefore(tabEntry, windowEntryList.childNodes[0]);
            }
            break;
        case "TAB_TITLE_CHANGED":
            findTabEntryById(request.details.tabId).getElementByClassName("tab-title").textContent = request.details.title;
            break;
        case "TAB_REMOVED":
            if (!request.details.windowClosing) {
                removeTab(request.details.tabId, request.details.windowId);
            }
            break;
        case "WINDOW_REMOVED":
            removeWindow(request.details.windowId);
            break;
    }
}

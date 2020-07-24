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
      setActiveTab(request.data.windowId, request.data.tabId);
      break;
    }
    case "TAB_FAV_ICON_CHANGED": {
      browser.tabs.get(request.data.tabId).then(tab => {
        let favIconPromise;
        if (!tab.favIconUrl.startsWith("chrome://")) {
          if (tab.incognito) {
            favIconPromise = getImage(request.data.favIconUrl, true);
          } else {
            favIconPromise = getImage(request.data.favIconUrl);
          }
        } else {
          favIconPromise = Promise.resolve(tab.favIconUrl);
        }
        favIconPromise.then(function (base64Image) {
          let tabEntry = findTabEntryById(request.data.tabId);
          tabEntry.classList.remove("noicon");
          let favIcon = getFavIconFromTabEntry(tabEntry);
          favIcon.src = base64Image;
          favIcon.style.display = "";
        });
      });
      break;
    }
    case "TAB_PINNED_STATUS_CHANGED": {
      let tabEntry = findTabEntryById(request.data.tabId);
      let pinBtn = tabEntry.getElementByClassName("tab-entry-pin-btn");
      let windowEntryList = tabEntry.parentElement;
      let pinnedTabs;
      if (request.data.pinned) {
        pinnedTabs = Array.from(windowEntryList.getElementsByClassName("pinned-tab"));
        tabEntry.classList.add("pinned-tab");
        pinBtn.style.backgroundImage = "url(../icons/pinremove.svg)";
      } else {
        pinnedTabs = Array.from(windowEntryList.getElementsByClassName("pinned-tab"));
        tabEntry.classList.remove("pinned-tab");
        pinBtn.style.backgroundImage = "url(../icons/pin.svg)";
      }
      let lastPinnedTab = pinnedTabs[pinnedTabs.length - 1];
      if (lastPinnedTab !== undefined) {
        windowEntryList.insertBefore(tabEntry, lastPinnedTab.nextSibling);
      } else {
        windowEntryList.insertBefore(tabEntry, windowEntryList.childNodes[0]);
      }
      break;
    }
    case "TAB_TITLE_CHANGED": {
      findTabEntryById(request.data.tabId).getElementByClassName("tab-title").textContent = request.data.title;
      break;
    }
    case "TAB_AUDIBLE_CHANGED": {
      browser.tabs.get(request.data.tabId).then(tab => {
        findTabEntryById(tab.id).getElementByClassName("tab-entry-speaker-btn").setAttribute("data-state", tab.mutedInfo.muted ? "off" : "on");
        resolve();
      });
      break;
    }
    case "TAB_MUTE_CHANGED": {
      findTabEntryById(request.data.tabId).getElementByClassName("tab-entry-speaker-btn").setAttribute("data-state", request.data.mutedInfo.muted ? "off" : "on");
      break;
    }
    case "TAB_REMOVED": {
      if (!request.data.windowClosing) {
        removeTab(request.data.tabId, request.data.windowId);
      }
      break;
    }
    case "WINDOW_REMOVED": {
      removeWindow(request.data.windowId);
      break;
    }
  }
}

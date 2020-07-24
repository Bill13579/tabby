import "Polyfill"
import G from "../globals"
import { sendRuntimeMessage } from "../../messaging"
import { getCorrectTabId } from "../wrong-to-right"

export function tabActivated(activeInfo) {
  sendRuntimeMessage("ACTIVE_TAB_CHANGED", {
    windowId: activeInfo.windowId,
    tabId: activeInfo.tabId
  }).catch(() => { });
  if (G.dropCurrentTabId) {
    G.lastTabId = G.currentTabId;
  } else {
    G.dropCurrentTabId = true;
  }
  G.currentTabId = activeInfo.tabId;
}

export function tabUpdated(tabId, changeInfo, tab) {
  if (changeInfo.favIconUrl !== undefined) {
    sendRuntimeMessage("TAB_FAV_ICON_CHANGED", {
      tabId: getCorrectTabId(tabId),
      favIconUrl: changeInfo.favIconUrl
    }).catch(() => { });
  }
  if (changeInfo.pinned !== undefined) {
    sendRuntimeMessage("TAB_PINNED_STATUS_CHANGED", {
      tabId: getCorrectTabId(tabId),
      pinned: changeInfo.pinned
    }).catch(() => { });
  }
  if (changeInfo.title !== undefined) {
    sendRuntimeMessage("TAB_TITLE_CHANGED", {
      tabId: getCorrectTabId(tabId),
      title: changeInfo.title
    }).catch(() => { });
  }
  if (changeInfo.audible !== undefined) {
    sendRuntimeMessage("TAB_AUDIBLE_CHANGED", {
      tabId: getCorrectTabId(tabId),
      audible: changeInfo.audible
    }).catch(() => { });
  }
  if (changeInfo.mutedInfo !== undefined) {
    sendRuntimeMessage("TAB_MUTE_CHANGED", {
      tabId: getCorrectTabId(tabId),
      mutedInfo: changeInfo.mutedInfo
    }).catch(() => { });
  }
}

export function tabRemoved(tabId, removeInfo) {
  sendRuntimeMessage("TAB_REMOVED", {
    tabId: tabId,
    windowId: removeInfo.windowId,
    windowClosing: removeInfo.isWindowClosing
  }).catch(() => { });
  if (G.lastTabId === tabId) {
    G.lastTabId = undefined;
  }
  if (G.currentTabId === tabId) {
    G.currentTabId = undefined;
    G.dropCurrentTabId = false;
  }
}

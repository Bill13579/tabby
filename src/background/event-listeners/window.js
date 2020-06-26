import "Polyfill"
import G from "../globals"
import { sendTabMessage } from "../messaging"
import { updateContextMenu } from "../contextMenu";

export function windowFocusChanged(windowId) {
    if (windowId !== browser.windows.WINDOW_ID_NONE) {
        if (G.dropCurrentWindowId) {
            G.lastWindowId = G.currentWindowId;
        } else {
            G.dropCurrentWindowId = true;
        }
        G.currentWindowId = windowId;
        browser.tabs.query({
            active: true,
            windowId: windowId
        }).then(tabs => {
            if (tabs[0].id !== G.currentTabId) {
                if (G.dropCurrentTabId) {
                    G.lastTabId = G.currentTabId;
                } else {
                    G.dropCurrentTabId = true;
                }
                G.currentTabId = tabs[0].id;
            }
        });
    }
}

export function windowRemoved(windowId) {
    sendTabMessage({
        windowId: windowId
    }, "WINDOW_REMOVED");
    if (G.lastWindowId === windowId) {
        G.lastWindowId = undefined;
    }
    if (G.currentWindowId === windowId) {
        G.currentWindowId = undefined;
        G.dropCurrentWindowId = false;
    }
    updateContextMenu();
}

export function windowCreated(w) {
    updateContextMenu();
}

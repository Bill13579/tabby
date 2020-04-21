import "Polyfill"
import G from "../globals"
import { sendRuntimeMessage } from "../../popup/messaging";

export function onCommand(name) {
    switch (name) {
        case "last-used-tab":
            if (G.lastTabId !== undefined) {
                browser.tabs.update(G.lastTabId, {
                    active: true
                });
                browser.windows.getLastFocused({}).then(w => {
                    browser.tabs.get(G.lastTabId).then(tab => {
                        if (w.id !== tab.windowId) {
                            browser.windows.update(tab.windowId, {
                                focused: true
                            });
                            G.lastTabId = G.currentTabId;
                        }
                    });
                });
            }
            break;
        case "last-used-window":
            if (G.lastWindowId !== undefined) {
                browser.windows.update(G.lastWindowId, {
                    focused: true
                });
            }
            break;
        case "open-tabby":
            browser.browserAction.openPopup();
            break;
        case "open-tabby-focus-current":
            browser.browserAction.openPopup();
            sendRuntimeMessage("INIT__PUT_FOCUS_ON_CURRENT", {});
            break;
    }
}

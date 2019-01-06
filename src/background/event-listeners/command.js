import G from "../globals"

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
    }
}

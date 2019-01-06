import G from "./globals"

G.wrongToRight = {};
var rightToWrong = {};

browser.tabs.onAttached.addListener(fixOnAttached);
browser.tabs.onRemoved.addListener(fixOnRemoved);

function fixOnAttached(tabId, attachInfo) {
    browser.tabs.get(tabId).then(function (tab){
        if (tabId !== tab.id) {
            let lastWrongId = rightToWrong[tabId];
            if (lastWrongId) {
                delete G.wrongToRight[lastWrongId];
            }
            G.wrongToRight[tab.id] = tabId;
            rightToWrong[tabId] = tab.id;
        }
    });
}

function fixOnRemoved(tabId, removeInfo) {
    let wrongId = rightToWrong[tabId];
    if (wrongId) {
        delete G.wrongToRight[wrongId];
    }
    delete rightToWrong[tabId];
}

export function getCorrectTabId(tabId) {
    return G.wrongToRight[tabId] || tabId;
}
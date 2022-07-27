import "Polyfill"

export function callContentScript(tabId, target, data) {
    return browser.tabs.sendMessage(tabId, {
        target, data
    });
}
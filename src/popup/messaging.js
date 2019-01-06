// Function to send a message to the runtime
export function sendRuntimeMessage(type, data) {
    return browser.runtime.sendMessage({
        type: type,
        data: data
    });
}

// Function to send a message to a tab
export function sendTabMessage(tabId, target, data) {
    return browser.tabs.sendMessage(tabId, {
        target: target,
        data: data
    });
}

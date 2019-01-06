// Function to send a message
export function sendTabMessage(details, type=undefined) {
    browser.runtime.sendMessage({
        type: type,
        details: details
    });
}

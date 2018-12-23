// Get all windows
export function getWindows() {
    return browser.windows.getAll({
        populate: true,
        windowTypes: ["normal", "popup", "devtools"]
    });
}

// Get current window
export function getCurrentWindow() {
    return browser.windows.getLastFocused({});
}

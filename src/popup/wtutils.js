import "Polyfill"

// Get all windows
export function getWindows() {
    return browser.windows.getAll({
        populate: true,
        windowTypes: ["normal", "popup", "devtools"]
    });
}

// Get the correct last focused window id
export function getLastFocusedWindowId() {
    /*
    Due to a bug in Chromium, windows.getLastFocused() will sometimes
    return incorrect windows. So here, instead of calling getLastFocused(),
    we call getCurrent().
    Reference: https://crbug.com/809822
    */
    return browser.tabs.query({ lastFocusedWindow: true }).then(function (tabs) {
        if (tabs.length > 0) {
            return tabs[0].windowId;
        }
        return -1;
    });
}

// Correct focused property of windows
// In Chromium, window.focused doesn't work, so we manually set it here
export function correctFocused(windows) {
    return getLastFocusedWindowId().then(function (lastFocusedWindowId) {
        for (let i = 0; i < windows.length; i++) {
            if (windows[i].id === lastFocusedWindowId) {
                windows[i].focused = true;
            }
        }
    });
}

// Get current window
export function getLastFocusedWindow() {
    // return browser.windows.getLastFocused({}); // Doesn't work due to a bug in Chromium. See explanation in getLastFocusedWindowId
    return getLastFocusedWindowId().then(windowId => browser.windows.get(windowId));
}

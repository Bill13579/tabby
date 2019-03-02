import "Polyfill"

// Get all windows
export function getWindows() {
    return browser.windows.getAll({
        populate: true,
        windowTypes: ["normal", "popup", "devtools"]
    });
}

// Correct focused property of windows
export function correctFocused(windows) {
    return browser.windows.getLastFocused().then(function (w) {
        for (var i = 0; i < windows.length; i++) {
            if (windows[i].id === w.id) {
                windows[i].focused = true;
            }
        }
    });
}

// Get current window
export function getCurrentWindow() {
    return browser.windows.getLastFocused({});
}

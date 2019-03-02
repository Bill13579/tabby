import "Polyfill"

export var available = false;

export function init() {
    if (window["browser"] !== undefined
        && browser.tabs["captureTab"] !== undefined) {
        available = true;
        return;
    }
    document.getElementById("details-img").style.display = "none";
}

export function captureTab(id) {
    return available ? browser.tabs.captureTab(id) : new Promise((resolve, reject) => resolve(null));
}

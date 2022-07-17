import "Polyfill"

export class TTabActions {
    constructor(tabId) {
        this.id = tabId;
    }
    activate() {
        return browser.tabs.update(this.id, {active: true});
    }
    captureTab(signal, quality) {
        if (browser.tabs.captureTab) {
            return new Promise((resolve, reject) => {
                browser.tabs.captureTab(this.id, quality).then((dataURI) => {
                    if (!signal.aborted) resolve(dataURI);
                });
                signal.onabort = reject;
            });
        } else {
            return Promise.resolve(undefined);
        }
    }
    static move(tabIds, windowId, index) {
        return browser.tabs.move(tabIds, {windowId, index});
    }
}

export class TWindowActions {
    constructor(windowId) {
        this.id = windowId;
    }
    activate() {
        return browser.windows.update(this.id, {focused: true});
    }
}


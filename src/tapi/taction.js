export class TTabActions {
    constructor(tabId) {
        this.id = tabId;
    }
    activate() {
        return browser.tabs.update(this.id, {active: true});
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


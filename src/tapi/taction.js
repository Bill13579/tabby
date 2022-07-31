import "Polyfill"

export class TTabActions {
    constructor(...tabIds) {
        this.ids = tabIds;
    }
    activate() {
        return browser.tabs.update(this.ids[0], {active: true});
    }
    pin(v) {
        return Promise.all(this.ids.map(id => browser.tabs.update(id, {pinned: v})));
    }
    mute(v) {
        return Promise.all(this.ids.map(id => browser.tabs.update(id, {muted: v})));
    }
    openerTabId(v) {
        return Promise.all(this.ids.map(id => browser.tabs.update(id, {openerTabId: v})));
    }
    remove() {
        return browser.tabs.remove(this.ids);
    }
    captureTab(signal, quality) {
        if (browser.tabs.captureTab) {
            return new Promise((resolve, reject) => {
                browser.tabs.captureTab(this.ids[0], quality).then((dataURI) => {
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
    constructor(...windowIds) {
        this.ids = windowIds;
    }
    activate() {
        return browser.windows.update(this.ids[0], {focused: true});
    }
    remove() {
        return Promise.all(this.ids.map(id => browser.windows.remove(id)));
    }
    titlePreface(title) {
        return Promise.all(this.ids.map(id => browser.windows.update(id, {titlePreface: title})));
    }
}


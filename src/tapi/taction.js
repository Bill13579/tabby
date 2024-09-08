import "Polyfill"
import { TargetBrowser } from "../polyfill";

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
    reload(bypassCache=false) {
        return Promise.all(this.ids.map(id => browser.tabs.reload(id, {bypassCache})));
    }
    discard() {
        if (TargetBrowser === "firefox") {
            return browser.tabs.discard(this.ids);
        } else if (browser.tabs.discard) {
            return Promise.all(this.ids.map(id => browser.tabs.discard(id)));
        } else {
            // This should be fine for now, since there's not much that can be done if the API itself is unavailable.
        }
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
    moveTo(windowId, index) {
        return TTabActions.move(this.ids, windowId, index);
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
        if (TargetBrowser === "firefox") {
            return Promise.all(this.ids.map(id => browser.windows.update(id, {titlePreface: title})));
        } else {
            return Promise.resolve();
        }
    }
}


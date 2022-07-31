import "Polyfill"

import { TTab, TTAB_SERIALIZE } from "./ttab";
import { TRelativeOrder } from "./trelativeorder";
import { TTabActions, TWindowActions } from "./taction";
import { callContentScript } from "./content";

/**
 * Event handler class for handling window additions, window removals, and tab additions
 */
export class TSessionListener {
    onTabCreated(tab) {  }
    onWindowCreated(window) {  }
    onWindowClosed(windowId) {  }
    onWindowFocusChanged(windowId) {  }
}

export class TSession {
    constructor() {
        this._listeners = [];
        this._tabs = {};
        this._rel = new TRelativeOrder();
        this._tab_updated_hook = (tabId, changeInfo) => {
            this._tabs[tabId].mergeChanges(changeInfo);
        };
        this._tab_activated_hook = (activeInfo) => {
            this._tabs[this._rel.getActiveTab(activeInfo.windowId)].mergeChanges({active: false});
            this._rel.setActiveTab(activeInfo.windowId, activeInfo.tabId);
            this._tabs[activeInfo.tabId].mergeChanges({active: true});
        };
        this._tab_moved_hook = (tabId, moveInfo) => {
            this._rel.moveTabWithinWindow(moveInfo.windowId, tabId, moveInfo.toIndex);
            this._tabs[tabId].onMoved(moveInfo.windowId, moveInfo.toIndex);
        };
        this._tab_attached_hook = (tabId, attachInfo) => {
            this._rel.removeTabFromWindow(this._tabs[tabId].windowId, tabId);
            this._rel.insertTabIntoWindow(attachInfo.newWindowId, tabId, attachInfo.newPosition);
            this._tabs[tabId].mergeChanges({windowId: attachInfo.newWindowId});
            this._tabs[tabId].onMoved(attachInfo.newWindowId, attachInfo.newPosition);
        };
        this._tab_removed_hook = (tabId, removeInfo) => {
            this._rel.removeTabFromWindow(removeInfo.windowId, tabId);
            this._tabs[tabId].onClosed();
            setTimeout(() => delete this._tabs[tabId], 1000); //TODO: Find out why a setTimeout is necessary in order to not break onUpdated
        };
        this._tab_created_hook = (t) => {
            if (!this._rel.hasWindow(t.windowId)) this._rel.registerWindow(t.windowId);
            this._rel.appendTabToWindow(t.windowId, t);
            this._tabs[t.id] = TTab.fromTab(t);
            for (let listener of this._listeners) listener.onTabCreated(this._tabs[t.id]);
        };
        this._window_removed_hook = (windowId) => {
            for (let listener of this._listeners) listener.onWindowClosed(windowId);
            this._rel.unregisterWindow(windowId);
        };
        this._window_created_hook = (window) => {
            for (let listener of this._listeners) listener.onWindowCreated(window);
        };
        this._window_focus_changed_hook = (windowId) => {
            windowId = windowId === browser.windows.WINDOW_ID_NONE ? -1 : windowId;
            this._rel.setFocusedWindow(windowId);
            for (let listener of this._listeners) listener.onWindowFocusChanged(windowId);
        };
    }
    /**
     * Add a session listener
     * @param {TSessionListener} listener 
     */
    addListener(listener) {
        this._listeners.push(listener);
    }
    /**
     * Check if a session listener exists
     * @param {TSessionListener} listener 
     */
    hasListener(listener) {
        return this._listeners.indexOf(listener) !== -1;
    }
    /**
     * Remove a session listener
     * @param {TSessionListener} listener 
     */
    removeListener(listener) {
        let index = this._listeners.indexOf(listener);
        if (index !== -1) {
            this._listeners.splice(index, 1);
        }
    }
    /**
     * Returns an array of tab ids in the session
     * @returns {String[]}
     */
    getAllTabIdsAsStrings() {
        let ids = [];
        for (let id in this._tabs) {
            if (this._tabs.hasOwnProperty(id)) {
                ids.push(id);
            }
        }
        return ids;
    }
    /**
     * Get TTab by ID, undefined if otherwise
     * @returns {TTab}
     */
    getTab(tabId) {
        return this._tabs[tabId];
    }
    /**
     * Get TTabActions by ID
     */
    getTabActions(tabId) { //TODO: Replace usage of this with just straight up calling the constructor
        return new TTabActions(tabId);
    }
    /**
     * Get TWindowActions by ID
     */
    getWindowActions(windowId) { //TODO: Replace usage of this with just straight up calling the constructor
        return new TWindowActions(windowId);
    }
    /**
     * Enables browser hooks to sync the browser's state with this object's state
     */
    enableBrowserHooks() {
        browser.tabs.onUpdated.addListener(this._tab_updated_hook);
        browser.tabs.onActivated.addListener(this._tab_activated_hook);
        browser.tabs.onMoved.addListener(this._tab_moved_hook);
        browser.tabs.onAttached.addListener(this._tab_attached_hook);
        browser.tabs.onRemoved.addListener(this._tab_removed_hook);
        browser.tabs.onCreated.addListener(this._tab_created_hook);
        //TODO: Deal with chrome prerendering onReplaced
        browser.windows.onRemoved.addListener(this._window_removed_hook);
        browser.windows.onCreated.addListener(this._window_created_hook);
        browser.windows.onFocusChanged.addListener(this._window_focus_changed_hook);
    }
    /**
     * Returns a 2D array of TTab's representing the order of all tabs and windows
     * @returns {Array<Array<TTab>>}
     */
    getAllAs2DArray() {
        return this._rel.getAllAs2DArray().map(v => v.map(tid => this._tabs[tid]));
    }
    /**
     * Promise returning all the Firefox contextual identities in the session, if the browser is Firefox. 
     * If the browser is not Firefox, returns a promise that resolves immediately to an undefined (which is different from
     * the similar `mozContextualIdentity` property in `TTab`)
     */
    get mozContextualIdentities() {
        if (browser.contextualIdentities) {
            return browser.contextualIdentities.query({});
        } else {
            return Promise.resolve(undefined);
        }
    }
    /**
     * Creates a Session object by reading in the current state of the browser
     * 
     * @returns {TSession}
     */
    static async read_from_current() {
        let sess = new TSession();
        let q = await browser.tabs.query({}); //get all tabs
        for (let t of q) {
            if (!sess._rel.hasWindow(t.windowId)) {
                sess._rel.registerWindow(t.windowId);
                let win = await browser.windows.get(t.windowId, {populate: false});
                if (win.focused) { //check if the window is focused
                    sess._rel.setFocusedWindow(t.windowId);
                }
            }
            sess._rel.appendTabToWindow(t.windowId, t);
            sess._tabs[t.id] = TTab.fromTab(t);
        }
        await sess._rel.reloadNamesFromTemporaryStore();
        return sess;
    }
    /**
     * Converts the `TSession` into a serializable format
     * @returns {Object}
     */
    async toSerializable() {
        let tabs = {};
        for (let tabId in this._tabs) {
            if (this._tabs.hasOwnProperty(tabId)) {
                let unserialized = this._tabs[tabId];
                let tab = unserialized.serialize(TTAB_SERIALIZE);
                // reduce favIconUrl to a url to save space
                try {
                    let icons = await callContentScript(unserialized.id, "packd", {
                        action: "favicon"
                    });
                    if (icons.length === 0) {
                        try {
                            let href = new URL("/favicon.ico", unserialized.url).href;
                            await t_getImage(href, unserialized.incognito);
                            icons.push({ href, sizes: "" });
                        } catch (e) {  }
                    }
                    if (icons.length !== 0) {
                        let favicon = new URL(icons[icons.length-1].href, unserialized.url).href;
                        tab["favIconUrl"] = favicon;
                    }
                } catch (e) {
                    console.error(`could not contact tab ${tabId}, error: ${e}`);
                }
                tabs[tabId] = tab;
            }
        }
        let rel = this._rel.toSerializable();
        return { tabs, rel };
    }
    /**
     * Recreates a `TSession` object from the provided serializable object, made from the corresponding `toSerializable` method
     * @param {Object} root 
     * @returns {TSession}
     */
    static fromSerializable(root) {
        let sess = new TSession();
        for (let tabId in root.tabs) {
            if (root.tabs.hasOwnProperty(tabId)) {
                sess._tabs[tabId] = TTab.fromSerialized(root.tabs[tabId]);
            }
        }
        sess._rel = TRelativeOrder.fromSerializable(root.rel);
        return sess;
    }
    /**
     * Given a map of remote `cookieStoreId`'s to their corresponding local `cookieStoreId`'s, open
     *  all the tabs stored in the session based on the order stored in `TRelativeOrder`. Also restore
     *  the user defined names for the windows.
     * Recreate the session.
     * @param {Object.<string, string>} mozContextualIdentityMap 
     */
    async openAll(mozContextualIdentityMap=undefined) {
        let all = this.getAllAs2DArray();
        let shouldFocusWindow;
        for (let tabs of all) {
            let window = await browser.windows.create({
                focused: this._rel._focusedWindow === tabs[0].windowId,
                incognito: tabs[0].incognito
            });
            // If this window should be focused, leave it to later to do it
            if (this._rel._focusedWindow === tabs[0].windowId) {
                shouldFocusWindow = window;
            }
            for (let ttab of tabs) {
                try {
                    let tab = await TTab.toTab(ttab, window.id, mozContextualIdentityMap ? mozContextualIdentityMap[ttab.cookieStoreId] : undefined);
                    await new TTabActions(tab.id).openerTabId(ttab.openerTabId);
                } catch (e) {
                    console.error(`could not recreate tab`, ttab, `due to`, e);
                }
            }
            if (window.tabs.length > 0) {
                try {
                    await new TTabActions(window.tabs[0].id).remove();
                } catch (e) {
                    console.error(`could not clear away the opened-by-default tab in window ${window.id}`, e);
                }
            }
            // Re-apply window name
            let windowName = this._rel.getName(tabs[0].windowId);
            this._rel.setName(window.id, windowName ? windowName : "");
        }
        // Focus the window that should be focused
        if (shouldFocusWindow) {
            await new TWindowActions(shouldFocusWindow.id).activate();
        }
    }
}
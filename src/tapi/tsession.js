import "Polyfill"

import { TTab } from "./ttab";
import { TRelativeOrder } from "./trelativeorder";
import { TTabActions, TWindowActions } from "./taction";

/**
 * Event handler class for handling window additions, window removals, and tab additions
 */
export class TSessionListener {
    onTabCreated(tab) {  }
    onWindowCreated(window) {  }
    onWindowClosed(windowId) {  }
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
    }
    /**
     * Add a session listener
     * @param {TSessionListener} listener 
     */
    addListener(listener) {
        this._listeners.push(listener);
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
    getTabActions(tabId) {
        return new TTabActions(tabId);
    }
    /**
     * Get TWindowActions by ID
     */
    getWindowActions(windowId) {
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
    }
    /**
     * Returns a 2D array of TTab's representing the order of all tabs and windows
     * @returns {Array<Array<TTab>>}
     */
    getAllAs2DArray() {
        return this._rel.getAllAs2DArray().map(v => v.map(tid => this._tabs[tid]));
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
            if (!sess._rel.hasWindow(t.windowId)) sess._rel.registerWindow(t.windowId);
            sess._rel.appendTabToWindow(t.windowId, t);
            sess._tabs[t.id] = TTab.fromTab(t);
        }
        return sess;
    }
}
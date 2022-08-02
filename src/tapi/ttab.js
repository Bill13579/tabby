import "Polyfill"
import { TargetBrowser } from "../polyfill";

export const TTAB_TRACK_ONUPDATED = ["favIconUrl", "isArticle", "mutedInfo", "pinned", "title", "url", "attention", "audible", "hidden", "status", "discarded"];
export const TTAB_TRACK_ONUPDATED_MANUAL = ["isInReaderMode", "lastAccessed"];
export const TTAB_TRACK_ONACTIVATED = ["active"];
export const TTAB_TRACK_ONMOVED = [];
export const TTAB_TRACK_ONATTACHED = ["windowId"];
export const TTAB_TRACK_UNCHANGING = ["cookieStoreId", "incognito", "openerTabId", "id"];
export const TTAB_TRACK = TTAB_TRACK_ONUPDATED.concat(TTAB_TRACK_ONUPDATED_MANUAL, TTAB_TRACK_ONACTIVATED, TTAB_TRACK_ONMOVED, TTAB_TRACK_ONATTACHED, TTAB_TRACK_UNCHANGING);

export const TTAB_SERIALIZE = ["favIconUrl", "isArticle", "mutedInfo", "pinned", "title", "url", "hidden", "discarded",
                        "isInReaderMode",
                        "active",
                        "windowId",
                        "cookieStoreId", "incognito", "openerTabId"];

export class TTab {
    constructor() {
        for (let k of TTAB_TRACK) {
            this[k] = undefined;
        }
    }
    /**
     * @callback proxy_handler
     * @param {string} prop 
     * @param {object} value 
     */
    /**
     * @callback proxy_revoked
     */
    /**
     * Given a proxy handler, creates a proxy, monitoring the tab's various properties
     * (The values returned should NOT be edited, it is unsafe and can lead to unexpected behavior)
     * 
     * @param {proxy_handler} handler2
     * @param {proxy_revoked} revoked
     * @returns {Proxy}
     */
    proxy(handler2, revoked) {
        if (this["_proxies"] === undefined) {
            this._proxies = [];
        }
        let view = {};
        for (let k of TTAB_TRACK) {
            view[k] = this[k];
        }
        const handler = {
            set(obj, prop, value) {
                handler2(prop, value);

                // The default behavior to store the value
                obj[prop] = value;

                // Indicate success
                return true;
            }
        };
        let proxy = Proxy.revocable(view, handler);
        this._proxies.push({
            proxy, revoked, handler: handler2
        });
        return proxy;
    }
    _proxy_helper(field, value) {
        if (this._proxies) {
            for (let {proxy} of this._proxies) {
                proxy.proxy[field] = value;
            }
        }
    }
    clearProxies() {
        if (this._proxies) {
            for (let {proxy, revoked} of this._proxies) {
                revoked();
                proxy.revoke();
            }
            this._proxies = undefined;
        }
    }
    /**
     * Merge tracked changes into this tab object
     * @param {*} changes 
     */
    mergeChanges(changes) {
        for (let k in changes) {
            if (t_in(changes, k)) {
                if (TTAB_TRACK.indexOf(k) != -1) {
                    this[k] = changes[k];
                    this._proxy_helper(k, changes[k]);
                }
            }
        }
    }
    /**
     * Event listener called by a browser-hooked TSession when the tab is closed
     */
    onClosed() { this.clearProxies(); }
    /**
     * Event listener called by a browser-hooked TSession when the tab is moved (both within a window and across windows)
     */
    onMoved(newWindowId, newPosition) {
        if (this._proxies) {
            for (let {handler} of this._proxies) {
                handler("#position", {newWindowId, newPosition});
            }
        }
    }
    /**
     * Export parameters listed in exportList as a serialized object
     * @param {Array} exportList 
     * @returns {Object}
     */
    serialize(exportList) {
        let data = {};
        for (let k of exportList) {
            data[k] = this[k];
        }
        return data;
    }
    /**
     * Promise returning the Firefox contextual identity of the tab, if the browser is Firefox. 
     * If the browser is not Firefox, returns a promise that resolves immediately to a false
     */
    get mozContextualIdentity() {
        if (browser.contextualIdentities && !["firefox-default", "firefox-private"].includes(this.cookieStoreId))
            return browser.contextualIdentities.get(this.cookieStoreId)
        else
            return Promise.resolve(false)
    }
    /**
     * Promise returning the full tabs.Tab object
     */
    get full() {
        return browser.tabs.get(this.id);
    }
    /**
     * Promise returning the tab's index
     */
    get index() {
        return this.full.then(tab => tab.index);
    }
    /**
     * Opens the tab
     * @param {TTab} ttab 
     * @param {Integer} windowId 
     * @param {String} cookieStoreId
     * @returns {Promise<Tab>}
     */
    static toTab(ttab, windowId, cookieStoreId) {
        // ============= FOR REFERENCE =============
        // export const TTAB_SERIALIZE = ["favIconUrl", "isArticle", "mutedInfo", "pinned", "title", "url", "hidden", "discarded",
        //                 "isInReaderMode",
        //                 "active",
        //                 "windowId",
        //                 "cookieStoreId", "incognito", "openerTabId"]; "hidden" is currently not recovered, "openerTabId" must be done separately later
        let prefs = {
            active: ttab.active,
            pinned: ttab.pinned,
            url: ttab.url,
            windowId
        };
        if (cookieStoreId) {
            prefs.cookieStoreId = cookieStoreId;
        }
        if (TargetBrowser === "firefox") {
            prefs.discarded = ttab.discarded;
            prefs.openInReaderMode = ttab.isInReaderMode;
            prefs.title = ttab.discarded ? ttab.title : undefined;
            prefs.muted = ttab.mutedInfo.muted;
        }
        return browser.tabs.create(prefs);
    }
    /**
     * Create an instance of TTab from a Tab object
     * @param {Tab} tab 
     * @returns {TTab}
     */
    static fromTab(tab) {
        let ttab = new TTab();
        for (let k of TTAB_TRACK) {
            ttab[k] = tab[k];
        }
        return ttab;
    }
    /**
     * Create an instance of TTab from serialized object
     * @param {Object} data 
     * @returns {TTab}
     */
    static fromSerialized(data) {
        let ttab = new TTab();
        ttab.mergeChanges(data);
        return ttab;
    }
}
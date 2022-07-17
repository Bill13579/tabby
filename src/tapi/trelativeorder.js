import "Polyfill"

import { T1DLinkedList } from "./linkedlist";

/**
 * Keeps track of the relative order of windows and tabs
 */
export class TRelativeOrder {
    constructor() {
        this._worder = new T1DLinkedList();
        this._order = {};
        this._active = {};
    }
    /**
     * Record active tab in specified window
     * @param {Integer} parentWindowId 
     * @param {Integer} tabId 
     */
    setActiveTab(parentWindowId, tabId) {
        this._active[parentWindowId] = tabId;
    }
    /**
     * Returns the recorded active tab for the specified window
     * @param {Integer} parentWindowId 
     * @returns {Integer}
     */
    getActiveTab(parentWindowId) {
        return this._active[parentWindowId];
    }
    /**
     * Check if there are records present for the specified window id
     * @param {Integer} windowId 
     * @returns {boolean}
     */
    hasWindow(windowId) {
        return t_in(this._order, windowId);
    }
    /**
     * Create an entry for the window (WILL OVERWRITE)
     * @param {Integer} windowId 
     */
    registerWindow(windowId) {
        this._order[windowId] = new T1DLinkedList();
        this._active[windowId] = -1;
        this._worder.append(windowId);
    }
    /**
     * Delete entry for window
     * @param {Integer} windowId 
     */
    unregisterWindow(windowId) {
        delete this._order[windowId];
        delete this._active[windowId];
        this._worder.remove(windowId);
    }
    /**
     * Append a single tab to the specified window (also records the window's active tab if given tab is active)
     * @param {Integer} windowId 
     * @param {Tab} t 
     */
    appendTabToWindow(windowId, t) {
        this._order[windowId].insert(t.id, t.index);
        if (t.active) this._active[windowId] = t.id;
    }
    /**
     * Remove tab from specified window on record
     * @param {Integer} windowId 
     * @param {Integer} tabId 
     */
    removeTabFromWindow(windowId, tabId) {
        this._order[windowId].remove(tabId);
    }
    /**
     * Insert tab into specified window at specified position on record
     * @param {Integer} windowId 
     * @param {Integer} tabId 
     * @param {Integer} i 
     */
    insertTabIntoWindow(windowId, tabId, i) {
        this._order[windowId].insert(tabId, i);
    }
    /**
     * Move tab within specified window on record
     * @param {Integer} windowId 
     * @param {Integer} tabId 
     * @param {Integer} i 
     */
    moveTabWithinWindow(windowId, tabId, i) {
        this._order[windowId].move(tabId, i);
    }
    /**
     * Returns an array of arrays containing tab ids representing the entire session's order of windows and tabs
     * @returns {Array<Array<Integer>>}
     */
    getAllAs2DArray() {
        let windowOrder = this._worder.toArray();
        let ret = [];
        for (let windowId of windowOrder) {
            ret.push(this._order[windowId].toArray());
        }
        return ret;
    }
}
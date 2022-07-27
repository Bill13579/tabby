// window.workers = [];
// window.__workersReady = 0;
// // Setup workers
// for (let i = 0; i < navigator.hardwareConcurrency; i++) {
//     let worker = new Worker(new URL('./searchWorker.js', import.meta.url));
//     workers.push(worker);
//     worker.onmessage = ({data}) => {
//         console.log(data);
//         if (data === "ready") {
//             window.__workersReady++;
//         }
//     };
// }
// window.workersReady = () => {
//     return workers.length === window.__workersReady;
// };

import "Polyfill"

import { TSession, TSessionListener } from "tapi/tsession";
import { TTabActions, TWindowActions } from "../tapi/taction";
import { DetailsController } from "./details";
import { TUIEditableColorDot, TUIEditableDiv, TUIEditableLabel } from "./editablespan";
import { parse_query, shard_doc, query as query_all } from "../../cartographer/pkg/cartographer";

import { $localtmp$, normal } from "../tapi/store";

class TUIListOptions {
    constructor() {
        this.allowMove = true;
        this.allowMultiselect = true;
        this.allowKBOnly = true;
        this.kbNavigation_skipLevels = [];
        this.changeListeners = {};
    }
    on(t, callback) {
        if (!this.changeListeners.hasOwnProperty(t)) {
            this.changeListeners[t] = [];
        }
        this.changeListeners[t].push(callback);
    }
    off(t, callback) {
        if (!this.changeListeners.hasOwnProperty(t)) {
            this.changeListeners[t] = [];
        }
        let i = this.changeListeners[t].indexOf(callback);
        if (i !== -1) {
            this.changeListeners[t].splice(i, 1);
        }
    }
    __trigger(t, ...params) {
        if (!this.changeListeners.hasOwnProperty(t)) {
            this.changeListeners[t] = [];
        }
        for (let listener of this.changeListeners[t]) {
            listener(...params);
        }
    }
    move(allowMove) {
        if (allowMove !== this.allowMove) this.__trigger("change", {allowMove});
        this.allowMove = allowMove;
        return this;
    }
    multiselect(allowMultiselect) {
        if (allowMultiselect !== this.allowMultiselect) this.__trigger("change", {allowMultiselect});
        this.allowMultiselect = allowMultiselect;
        return this;
    }
    kbonly(allowKBOnly, skipLevels=[]) {
        if (allowKBOnly !== this.allowKBOnly) this.__trigger("change", {allowKBOnly, kbNavigation_skipLevels: skipLevels});
        this.allowKBOnly = allowKBOnly;
        if (allowKBOnly) {
            this.kbNavigation_skipLevels = skipLevels;
        }
        return this;
    }
    get _draggableAttributeValue() {
        return this.allowMove ? "true" : "false";
    }
    static default() {
        return new TUIListOptions();
    }
}

class TUIList {
    static makeRoot(dataInterpret, data) {
        let rootContainer = dataInterpret.createRoot(data);
        rootContainer.classList.add("-tui-list-container");
        return rootContainer;
    }
    set kb(v) {
        if (v !== this.__kb) { /*TODO: Make use */}
        this.__kb = v;
    }
    get kb() {
        return this.__kb;
    }
    static clearRoot(root) {
        root.innerHTML = "";
    }
    static isElementSelected(ele) {
        return ele.classList.contains("-tui-list-selected") || ele.classList.contains("-tui-list-all-children-selected");
    }
    static isElementHidden(ele) {
        let compStyles = window.getComputedStyle(ele);
        return compStyles.getPropertyValue("display") === "none";
    }
    static isElementVisible(ele) {
        return !TUIList.isElementHidden(ele);
    }
    isElementKeyboardNavigable(ele) {
        return this.listOptions.kbNavigation_skipLevels.indexOf(TUIList.levelOf(ele)) === -1;
    }
    static and(...conditions) {
        return (ele) => {
            let condition = true;
            for (let cond of conditions) {
                condition = condition && cond(ele);
            }
            return condition;
        };
    }
    children(ele, includeSub=false, condition=_ => true) {//TODO: Replace other implementations with this definitive one
        //TODO: Write another function that gets the child at a specific index
        if (ele.isSameNode(this.root)) {
            let c = [];
            for (let child of this.root.children) {
                if ((TUIList.levelOf(child) === 0 || includeSub) && condition(child)) {
                    c.push(child);
                }
            }
            return c;
        }
        let current = ele.nextElementSibling;
        let level = TUIList.levelOf(ele);
        let c = [];
        while (current !== null && level < TUIList.levelOf(current)) {
            if ((TUIList.levelOf(current) === level + 1 || includeSub) && condition(current)) {
                c.push(current);
            }
            current = current.nextElementSibling;
        }
        return c;
    }
    parent(ele) {//TODO: Replace other implementations with this definitive one
        if (ele.isSameNode(this.root)) return null;
        let current = ele.previousElementSibling;
        let level = TUIList.levelOf(ele);
        while (current !== null && level <= TUIList.levelOf(current)) {
            current = current.previousElementSibling;
        }
        return current;
    }
    previous(ele, condition=_ => true) {
        if (ele.isSameNode(this.root)) return null;
        let current = ele.previousElementSibling;
        let currentCondition;
        if (current !== null) currentCondition = condition(current);
        while (current !== null && currentCondition === false) {
            current = current.previousElementSibling;
            if (current !== null) currentCondition = condition(current);
        }
        if (currentCondition["ret"]) {
            return currentCondition["ret"];
        }
        return current;
    }
    next(ele, condition=_ => true) {
        if (ele.isSameNode(this.root)) return null;
        let current = ele.nextElementSibling;
        let currentCondition;
        if (current !== null) currentCondition = condition(current);
        while (current !== null && currentCondition === false) {
            current = current.nextElementSibling;
            if (current !== null) currentCondition = condition(current);
        }
        if (currentCondition["ret"]) {
            return currentCondition["ret"];
        }
        return current;
    }
    first(condition=_ => true) {
        return this.next(this.root.children[0], condition);
    }
    last(condition=_ => true) {
        return this.previous(this.root.children[this.root.children.length-1], condition);
    }
    areSiblings(element1, element2, condition=_ => true) {
        let element1Next = this.next(element1, condition);
        let element1Prev = this.previous(element1, condition);
        return (element1Next && element1Next.isSameNode(element2)) ||
                (element1Prev && element1Prev.isSameNode(element2));
    }
    static levelOf(ele) {
        return parseInt(ele.getAttribute("data-level"));
    }
    hideElement(ele, reason) {
        for (let e of [ele, ...this.children(ele, true)]) {//TODO3
            const event = new Event("-tui-list-hidden");
            e.dispatchEvent(event);
            e.classList.add("-tui-list-hidden--" + reason);
        }
    }
    showElement(ele, reason) {
        for (let e of [ele, ...this.children(ele, true)]) {//TODO3
            const event = new Event("-tui-list-shown");
            e.dispatchEvent(event);
            e.classList.remove("-tui-list-hidden--" + reason);
        }
    }
    modifySelected(callback) {
        let multiselectDragging = this.multiselectDragging;
        let multiselect = this.multiselect;
        this.multiselectDragging = { action: "" };
        this.multiselect = true;

        let processSelectCB = (target, evt, action) => {
            // processSelect(<target>, evt, action);
            this.multiselectDragging.action = action;
            const event = new CustomEvent('-tui-list-internal--process-select', { detail: {
                originalEvent: evt, action
            } });
            target.dispatchEvent(event);
        };
        callback(processSelectCB);

        this.multiselectDragging = multiselectDragging;
        this.multiselect = multiselect;
    }
    constructor(root, dataInterpret, listOptions=TUIListOptions.default()) {
        this.dataInterpret = dataInterpret;
        dataInterpret.__setList(this);
        this.root = root;
        // this.root.addEventListener("contextmenu", ( e )=> { e.preventDefault(); return false; } );
        this.multiselect = false;
        this.multiselectDragging = false;
        this.__kb = false;
        this.lastSelected = undefined;
        this.documentHookInPlace_mouseUp = false;
        this.endMultiselect = undefined;
        this.draggedElements = [];
        this.listOptions = listOptions;
        this.kbMap = {};
        this.documentHook_keyDown = (evt) => {
            this.kbMap[evt.key] = true;
            if (this.kbMap["Meta"] || this.kbMap["Control"]) {
                this.enableMultiselect();
                this.root.parentElement.style.overflowY = "hidden"; //TODO: Consider replacing with class
            }
            // if (this.kbMap["Control"] && this.kbMap["Shift"]) {
            //     if (this.multiselect) {
            //         this.disableMultiselect();
            //     } else {
            //         this.enableMultiselect();
            //     }
            // }
        };
        this.documentHook_keyUp = (evt) => {
            delete this.kbMap[evt.key];
            if (!this.kbMap["Meta"] && !this.kbMap["Control"]) {
                this.disableMultiselect();
                this.root.parentElement.style.overflowY = "";
            }
        };
        if (listOptions.allowMultiselect) {
            document.addEventListener("keydown", this.documentHook_keyDown);
        }
        document.addEventListener("keyup", this.documentHook_keyUp);
        this.documentHook_keyDownKBOnly = (evt) => {
            //ArrowUp,ArrowDown
            this.kb = true;
            let lastHover = this.root.querySelector(".-tui-list-hover");
            let nextHover;
            if (evt.key === 'ArrowUp') {
                if (lastHover) {
                    let lastHoverPrevious = this.previous(lastHover, TUIList.and(TUIList.isElementVisible, this.isElementKeyboardNavigable.bind(this)));
                    if (lastHoverPrevious) {
                        lastHover.classList.remove("-tui-list-hover");
                        nextHover = lastHoverPrevious;
                    }
                } else {
                    nextHover = this.last(TUIList.and(TUIList.isElementVisible, this.isElementKeyboardNavigable.bind(this)));
                }
            } else if (evt.key === 'ArrowDown') {
                if (lastHover) {
                    let lastHoverNext = this.next(lastHover, TUIList.and(TUIList.isElementVisible, this.isElementKeyboardNavigable.bind(this)));
                    if (lastHoverNext) {
                        lastHover.classList.remove("-tui-list-hover");
                        nextHover = lastHoverNext;
                    }
                } else {
                    nextHover = this.first(TUIList.and(TUIList.isElementVisible, this.isElementKeyboardNavigable.bind(this)));
                }
            }
            if (nextHover) {
                nextHover.classList.add("-tui-list-hover");
                nextHover.dispatchEvent(new KeyboardEvent("keydown", {'key': evt.key}));
            } else if (lastHover) {
                lastHover.dispatchEvent(new KeyboardEvent("keydown", {'key': evt.key}));
            }
        };
        this.documentHook_keyUpKBOnly = (evt) => {
            let lastHover = this.root.querySelector(".-tui-list-hover");
            if (lastHover) {
                lastHover.dispatchEvent(new KeyboardEvent("keyup", {'key': evt.key}));
            }
        };
        if (listOptions.allowKBOnly) {
            document.addEventListener("keydown", this.documentHook_keyDownKBOnly);
            document.addEventListener("keyup", this.documentHook_keyUpKBOnly);
        }
        // Will only trigger when the options actually change, preventing duplicate event listeners
        this.listOptionsHook_change = (change) => {
            if (change["allowMultiselect"] !== undefined) {
                if (change["allowMultiselect"]) {
                    document.addEventListener("keydown", this.documentHook_keyDown);
                } else {
                    document.removeEventListener("keydown", this.documentHook_keyDown);
                }
            } else if (change["allowKBOnly"] !== undefined) {
                if (change["allowKBOnly"]) {
                    document.addEventListener("keydown", this.documentHook_keyDownKBOnly);
                    document.addEventListener("keyup", this.documentHook_keyUpKBOnly);
                } else {
                    document.removeEventListener("keydown", this.documentHook_keyDownKBOnly);
                    document.removeEventListener("keyup", this.documentHook_keyUpKBOnly);
                }
            }
        };
        listOptions.on("change", this.listOptionsHook_change);
    }
    create(level, data) {
        let e = this.dataInterpret.createElement(level, data);
        e.setAttribute("draggable", this.listOptions._draggableAttributeValue);
        e.setAttribute("tabindex", "0");
        e.setAttribute("data-level", level);
        e.addEventListener("mouseenter", () => {
            if (!this.kb) {
                let lastHover = this.root.querySelector(".-tui-list-hover");
                if (lastHover) lastHover.classList.remove("-tui-list-hover");
                e.classList.add("-tui-list-hover");
            }
        });
        let processSelect = (element, originalEvent, action=undefined/*, skipInterpolate=false*/) => {
            // Don't do anything if element is hidden
            if (TUIList.isElementHidden(element)) return "hidden";
            
            if (this.multiselect || this.kbMap["Shift"]) {
                let noop = false;
                let parentCheck = (action, noop) => {
                    // Loop through parents and check if their children have all been selected
                    let countImpact;
                    if (noop)
                        countImpact = 0;
                    else if (action === "unselecting")
                        countImpact = -1;
                    else if (action === "selecting")
                        countImpact = 1;
                    else
                        countImpact = 0; //wut
                    
                    let current = this.parent(element);
                    while (current !== null) {
                        // Create count if not already exists
                        if (!current.hasAttribute("data-selected-children-count")) {
                            current.setAttribute("data-selected-children-count", 0);
                        }

                        // Update count
                        let oldCount = parseInt(current.getAttribute("data-selected-children-count"));
                        let newCount = oldCount + countImpact;
                        current.setAttribute("data-selected-children-count", newCount.toString());

                        // Check if every child is selected
                        if (this.children(current, true).length === parseInt(current.getAttribute("data-selected-children-count"))) {
                            current.classList.add("-tui-list-all-children-selected");
                        } else {
                            current.classList.remove("-tui-list-all-children-selected");
                        }
                        current = this.parent(current);
                    }
                };
                if (this.multiselectDragging) {
                    if (action === undefined && element.classList.contains("-tui-list-selected")) {
                        action = "unselecting";
                    }
                    //TODO: Replace relational selection with the TUIList utility functions, consider visibility
                    //TODO: Replace t_getElementsBetween
                    // // Keep a record of the farthest selection
                    // if (this.multiselectDragging.hasOwnProperty("start") && !skipInterpolate) {
                    //     if (!this.multiselectDragging.hasOwnProperty("end")) this.multiselectDragging.end = this.multiselectDragging.start;
                    //     let relativePosToStart = this.multiselectDragging.start.compareDocumentPosition(element);
                    //     let relativePosToEnd = this.multiselectDragging.end.compareDocumentPosition(element);
                    //     let endRelativePosToStart = this.multiselectDragging.start.compareDocumentPosition(this.multiselectDragging.end);
                    //     let increaseSelection = undefined;
                    //     if (relativePosToStart & Node.DOCUMENT_POSITION_FOLLOWING) { // dragging downwards
                    //         if (relativePosToEnd & Node.DOCUMENT_POSITION_FOLLOWING) { // further down
                    //             increaseSelection = true;
                    //         } else if (relativePosToEnd & Node.DOCUMENT_POSITION_PRECEDING) { // back up
                    //             increaseSelection = false;
                    //         }
                    //     } else if (relativePosToStart & Node.DOCUMENT_POSITION_PRECEDING) { // dragging upwards
                    //         if (relativePosToEnd & Node.DOCUMENT_POSITION_FOLLOWING) { // back up
                    //             increaseSelection = false;
                    //         } else if (relativePosToEnd & Node.DOCUMENT_POSITION_PRECEDING) { // further up
                    //             increaseSelection = true;
                    //         }
                    //     } else { // back to the start element
                    //         increaseSelection = false;
                    //     }
                    //     if (increaseSelection !== undefined) {
                    //         if (((relativePosToStart & (Node.DOCUMENT_POSITION_FOLLOWING | Node.DOCUMENT_POSITION_PRECEDING)) !==
                    //             (endRelativePosToStart & (Node.DOCUMENT_POSITION_FOLLOWING | Node.DOCUMENT_POSITION_PRECEDING)))
                    //             && !this.multiselectDragging.end.isSameNode(this.multiselectDragging.start)) {
                    //             processSelect(this.multiselectDragging.end, originalEvent, action === "selecting" ? "unselecting" : "selecting", true);
                    //             for (let interpolate of t_getElementsBetween(this.multiselectDragging.end, this.multiselectDragging.start)) {
                    //                 processSelect(interpolate, originalEvent, action === "selecting" ? "unselecting" : "selecting", true);
                    //             }
                    //             for (let interpolate of t_getElementsBetween(this.multiselectDragging.start, element)) {
                    //                 if (increaseSelection) {
                    //                     processSelect(interpolate, originalEvent, action, true);
                    //                 } else {
                    //                     processSelect(interpolate, originalEvent, action === "selecting" ? "unselecting" : "selecting", true);
                    //                 }
                    //             }
                    //         } else {
                    //             if (increaseSelection) {
                    //                 processSelect(this.multiselectDragging.end, originalEvent, action, true);
                    //             } else {
                    //                 processSelect(this.multiselectDragging.end, originalEvent, action === "selecting" ? "unselecting" : "selecting", true);
                    //             }
                    //             for (let interpolate of t_getElementsBetween(this.multiselectDragging.end, element)) {
                    //                 if (increaseSelection) {
                    //                     processSelect(interpolate, originalEvent, action, true);
                    //                 } else {
                    //                     processSelect(interpolate, originalEvent, action === "selecting" ? "unselecting" : "selecting", true);
                    //                 }
                    //             }
                    //         }
                    //         if (increaseSelection) {
                    //             processSelect(element, originalEvent, action, true);
                    //         } else {
                    //             processSelect(element, originalEvent, action === "selecting" ? "unselecting" : "selecting", true);
                    //         }
                    //     }
                    //     this.multiselectDragging.end = element;
                    // }
                    // Interpolate (mousemove is too slow to react, and sometimes misses elements when the mouse is moved fast)
                    //TODO: Prevent it from looping through all elements from the initial selection to the mouse element
                    if (this.multiselectDragging.hasOwnProperty("start")) {
                        let relativePosToStart = this.multiselectDragging.start.compareDocumentPosition(element);
                        let getNext;
                        if (relativePosToStart & Node.DOCUMENT_POSITION_FOLLOWING) {
                            getNext = (element) => this.previous(element, TUIList.isElementVisible);
                        } else if (relativePosToStart & Node.DOCUMENT_POSITION_PRECEDING) {
                            getNext = (element) => this.next(element, TUIList.isElementVisible);
                        } else {
                            getNext = (element) => element;
                        }
                        let getNextSafe = (element) => {
                            if (element.isSameNode(this.multiselectDragging.start)) return undefined;
                            if (getNext(element)) {
                                if (getNext(element).isSameNode(this.multiselectDragging.start))
                                    return undefined;
                                else
                                    return getNext(element);
                            } else {
                                return undefined;
                            }
                        };
                        let next = getNextSafe(element);
                        if (next) processSelect(next, originalEvent, action);
                    }
                    if (action === "unselecting") {
                        if (!element.classList.contains("-tui-list-selected")) {
                            noop = true;
                        }
                        element.classList.remove("-tui-list-selected");
                        // // reset last-selected if we are unselecting
                        // if (this.lastSelected) this.lastSelected.classList.remove("-tui-list-last-selected");
                        // this.lastSelected = undefined;
                        // parentCheck("unselecting", noop);
                        // return "unselecting";
                        // set new last-selected element if we are unselecting as well
                        if (this.lastSelected !== undefined) {
                            this.lastSelected.classList.remove("-tui-list-last-selected");
                        }
                        this.lastSelected = element;
                        element.classList.add("-tui-list-last-selected");
                        parentCheck("unselecting", noop);
                        return "unselecting";
                    } else {
                        if (element.classList.contains("-tui-list-selected")) {
                            noop = true;
                        }
                        element.classList.add("-tui-list-selected");
                        // set new last-selected element if we are selecting
                        if (this.lastSelected !== undefined) {
                            this.lastSelected.classList.remove("-tui-list-last-selected");
                        }
                        this.lastSelected = element;
                        element.classList.add("-tui-list-last-selected");
                        parentCheck("selecting", noop);
                        return "selecting";
                    }
                }
            } else {
                this.dataInterpret.handleClick(element, this.root.getElementsByClassName("-tui-list-selected"), originalEvent);
                return "click";
            }
        };
        e.addEventListener("click", (evt) => {
            if (!this.multiselect) {
                processSelect(e, evt);
            }
        });
        e.addEventListener("auxclick", (evt) => {
            if (!this.multiselect && evt.button === 1) {
                evt.preventDefault();
                processSelect(e, evt);
                return false;
            }
        });
        let getRidOfOtherCursors = () => {
            for (let ele of document.querySelectorAll(".-tui-list-container li[data-drag-relation]")) {
                ele.removeAttribute("data-drag-relation");
            }
        };
        // if (this.listOptions.allowMove) {
            e.addEventListener("dragstart", (evt) => {
                if (!this.multiselect && this.listOptions.allowMove) {
                    let pastGhosts = document.getElementsByClassName("-tui-drag-ghost");
                    if (pastGhosts.length > 0) {
                        for (let g of pastGhosts) {
                            g.parentElement.removeChild(g);
                        }
                    }

                    let draggables = Array.from(this.root.getElementsByClassName("-tui-list-selected"));
                    if (draggables.length == 0) {
                        draggables = [e];
                    }
                    this.draggedElements = draggables;

                    // let closestDraggable = evt.target;
                    // while (closestDraggable && !closestDraggable.classList.contains("-tui-list-selected")) {
                    //     closestDraggable = closestDraggable.previousElementSibling;
                    // }
                    // if (closestDraggable === null) {
                    //     closestDraggable = draggables[draggables.length-1];
                    // }

                    let ghost = document.createElement("div");
                    this.dataInterpret.ghostSetup(ghost);
                    ghost.classList.add("-tui-drag-ghost");
                    ghost.style.position = "fixed";

                    for (let i = 0; i < draggables.length; i++) {
                        let draggableClone = draggables[i].cloneNode(true);
                        ghost.appendChild(draggableClone);
                        // if (closestDraggable.isSameNode(draggables[i])) {
                        //     console.log(closestDraggable);
                        // }
                        if (i !== draggables.length-1) {
                            if (!this.areSiblings(draggables[i], draggables[i+1])) {
                                ghost.lastElementChild.style.marginBottom = "10px";
                            }
                        }
                    }

                    document.body.appendChild(ghost);

                    evt.dataTransfer.setDragImage(ghost, 0, ghost.getBoundingClientRect().height*4);

                }
            });
            e.addEventListener("dragend", () => {
                getRidOfOtherCursors();
            });
            e.addEventListener("dragover", (evt) => {
                evt.preventDefault();
                getRidOfOtherCursors();
                if (evt.offsetY <= e.getBoundingClientRect().height / 2) {
                    e.setAttribute("data-drag-relation", "above");
                } else {
                    e.setAttribute("data-drag-relation", "below");
                }
            });
            e.addEventListener("dragleave", (evt) => {  });
            e.addEventListener("drop", (evt) => {
                this.dataInterpret.handleDrop(this.draggedElements, e, e.getAttribute("data-drag-relation"));
                e.removeAttribute("data-drag-relation");
            });

        let startMultiselect = (e, evt) => {
            this.multiselectDragging = true;
            this.multiselectDragging = { start: e, action: processSelect(e, evt) };
            this.multiselectDragging.start.classList.add("-tui-list-drag-starter");
        };
        let onSelection = (e, evt) => {
            this.dataInterpret.handleHover(e, evt);
            if (this.multiselect && this.multiselectDragging) processSelect(e, evt, this.multiselectDragging.action);
        };
        this.endMultiselect = () => {
            if (this.multiselectDragging) {
                this.multiselectDragging.start.classList.remove("-tui-list-drag-starter");
                this.multiselectDragging.start.setAttribute("draggable", this.listOptions._draggableAttributeValue);
            }
            this.multiselectDragging = false;
        };

        e.addEventListener("mousedown", (evt) => {
            // Select all nodes from -tui-list-last-selected to the clicked element if "Shift" is pressed
            if (this.kbMap["Shift"] && this.listOptions.allowMultiselect) {
                if (this.lastSelected) {
                    let ret = true;
                    if (e.isSameNode(this.lastSelected)) {
                        ret = false;
                    }
                    let action = this.lastSelected.classList.contains("-tui-list-selected") ? "selecting" : "unselecting";
                    this.modifySelected((processSelectCB) => {
                        for (let target of t_getElementsBetween(this.lastSelected, e, TUIList.isElementVisible)) {
                            processSelectCB(target, evt, action);
                        }
                        processSelectCB(e, evt, action);
                    });
                    if (ret) return;
                } else {
                    // When nothing has been selected yet, for the first-select only, allow use of Shift key to select
                    let action = e.classList.contains("-tui-list-selected") ? "unselecting" : "selecting";
                    this.modifySelected((processSelectCB) => processSelectCB(e, evt, action));
                    return;
                }
            }
            if (this.multiselect) {
                // Select all visible children of node
                if (e.nextElementSibling) {
                    let action = this.next(e, TUIList.isElementVisible).classList.contains("-tui-list-selected") ? "unselecting" : "selecting";
                    this.modifySelected((processSelectCB) => {
                        for (let child of this.children(e, true, TUIList.isElementVisible)) {
                            processSelectCB(child, evt, action);
                        }
                    });
                }

                e.setAttribute("draggable", "false");
                startMultiselect(e, evt);
            }
        });
        if (!this.documentHookInPlace_mouseUp) {
            this.documentHookInPlace_mouseUp = true;
            document.addEventListener("mouseup", this.endMultiselect);
        }
        e.addEventListener("mousemove", (evt) => {
            this.kb = false;
            onSelection(e, evt);
        });
        // The key down event is also artificially activated by ArrowDown and ArrowUp listeners
        e.addEventListener("keydown", (evt) => {
            onSelection(e, evt);
            this.dataInterpret.handleClick(e, this.root.getElementsByClassName("-tui-list-selected"), evt);
        });
        let setHoverToNearest = (reason) => {
            // Set hover to another element
            if (e.classList.contains("-tui-list-hover")) {
                let selfLevel = TUIList.levelOf(e);

                let passedLowerLevel = false; // Passed a lower level entry while trying to find the next element below
                let closestDown = this.next(e, ele => {
                    let eleLevel = TUIList.levelOf(ele);
                    if (eleLevel < selfLevel) passedLowerLevel = true;
                    return TUIList.isElementVisible(ele) && this.isElementKeyboardNavigable(ele);
                });
                if (closestDown && !passedLowerLevel) {
                    closestDown.classList.add("-tui-list-hover");
                    setTimeout(() => this.dataInterpret.handleHover(closestDown, reason), 1);
                } else {
                    let closestUp = this.previous(e, ele => {
                        return TUIList.isElementVisible(ele) && this.isElementKeyboardNavigable(ele);
                    });
                    if (closestUp) {
                        closestUp.classList.add("-tui-list-hover");
                        setTimeout(() => this.dataInterpret.handleHover(closestUp, reason), 1);
                    } else if (closestDown && passedLowerLevel) {
                        closestDown.classList.add("-tui-list-hover");
                        setTimeout(() => this.dataInterpret.handleHover(closestDown, reason), 1);
                    }
                }
            }
        };
        // Hidden and shown events
        e.addEventListener("-tui-list-hidden", (_) => {
            setHoverToNearest("-tui-list-hidden");
            this.modifySelected((processSelectCB) => processSelectCB(e, "hidden", "unselecting"));
        });
        // Removed event
        e.addEventListener("-tui-list-removed", (_) => {
            setHoverToNearest("-tui-list-removed");
        });

        e.addEventListener("-tui-list-internal--process-select", (evt) => {
            processSelect(e, evt.detail.originalEvent, evt.detail.action);
        });
        // e.addEventListener("keydown", (evt) => {
        //     if (this.kb && this.kbMap["Shift"]) {
        //         if (this.multiselectDragging) {
        //             onSelection(e, evt);
        //         } else {
        //             startMultiselect(e, evt);
        //         }
        //     }
        // });
        // e.addEventListener("keyup", (evt) => {
        //     if (evt.key === "Shift") {
        //         this.endMultiselect();
        //     }
        // });
        return e;
    }
    enableMultiselect() {
        this.multiselect = true;
    }
    disableMultiselect() {
        this.multiselect = false;
    }
}

class TUIListView extends TUIList {
}

class TUISessionView extends TUIListView {
    /**
     * Initializes the view unsorted, call resort if necessary, since
     *  after the constructor's execution, the list should be in a sorted state
     * Also, insert any event listeners here to listen for new items that need to be inserted, use `put` to insert
     * @param {TSession} sess 
     */
    constructor(root, sess, dataInterpret, listOptions=TUIListOptions.default(), hookPos=true) {
        listOptions.kbonly(true, [0]); // Make window entries unnavigable by keyboard
        super(root, dataInterpret, listOptions);

        this.sess = sess;
        let all = sess.getAllAs2DArray();
        let addWindow = (tabs) => {
            root.appendChild(this.create(0, {
                id: tabs[0].windowId,
                incognito: tabs[0].incognito
            }));
            for (let tab of tabs) {
                root.appendChild(this.createTab(tab, this, true, hookPos));
            }
        };
        for (let tabs of all) {
            addWindow(tabs);
        }
        this.sessionListener = {
            onTabCreated: (tab) => {
                this.put(tab, this.createTab(tab, this, true, hookPos));
            },
            onWindowClosed: (windowId) => {
                let w = root.querySelector(`.window-entry[data-window-id="${windowId}"]`);
                if (w) {
                    w.parentElement.removeChild(w);
                }
            },
            onWindowFocusChanged: (windowId) => {
                let w = root.querySelector(`.window-entry[data-current]`);
                if (w) {
                    w.removeAttribute("data-current");
                }
                w = root.querySelector(`.window-entry[data-window-id="${windowId}"]`);
                if (w) {
                    w.setAttribute("data-current", "true");
                }
            }
        };
        sess.addListener(this.sessionListener);
    }
    static keywordSearch(s, key) {
        let keywords = key.trim().split(" "), count = 0;
        for (let i = 0; i < keywords.length; i++) {
            let word = keywords[i];
            if (word.trim() !== "" && word.match(/^[a-zA-Z0-9]+$/)) {
                if (s.toUpperCase().includes(word.toUpperCase())) {
                    count++;
                }
            }
        }
        return count >= 2;
    }
    static search(s, key) {
        return s.toUpperCase().includes(key.toUpperCase()) || TUISessionView.keywordSearch(s, key);
    }
    /**
     * Filter list based on search results (undefined to reset)
     */
    filter(key, results=undefined) {
        console.log(results);
        if (results === undefined) {
            for (let c of this.root.children) {
                this.showElement(c, "filter");
            }
        } else {
            let tabMap = {};
            for (let c of this.root.children) {
                if (c.hasAttribute("data-tab-id")) {
                    tabMap[c.getAttribute("data-tab-id")] = c;
                }
            }
            let rangeLow = 0;
            let rangeHigh = 0;
            for (let value of Object.values(results)) {
                if (value.score < rangeLow) {
                    rangeLow = value.score;
                }
                if (value.score > rangeHigh) {
                    rangeHigh = value.score;
                }
            }
            let center = (rangeLow + rangeHigh) / 2.0;
            for (let tabId in results) {
                if (results.hasOwnProperty(tabId)) {
                    let tab = this.sess.getTab(parseInt(tabId));
                    if (results[tabId].score >= center) {
                        this.showElement(tabMap[tabId], "filter");
                    } else {
                        if (TUISessionView.search(tab.url, key) ||
                            TUISessionView.search(tab.title, key)) {
                                this.showElement(tabMap[tabId], "filter");
                            } else {
                                this.hideElement(tabMap[tabId], "filter");
                            }
                    }
                    delete tabMap[tabId];
                }
            }
            for (let tabId in tabMap) {
                if (tabMap.hasOwnProperty(tabId)) {
                    let tab = this.sess.getTab(parseInt(tabId));
                    if (TUISessionView.search(tab.url, key) ||
                        TUISessionView.search(tab.title, key)) {
                            this.showElement(tabMap[tabId], "filter");
                        } else {
                            this.hideElement(tabMap[tabId], "filter");
                        }
                }
            }
        }
    }
    /**
     * Resort the view completely, as well as any heavy operations concerning going through the entire list,
     *  in order to fix the list's order
     */
    resort() {  }
    /**
     * A new item is inserted into the list, or an existing item is modified so that its position should now be different
     */
    async put(tab, tabElement) {
        let windowId = tab.windowId;
        let w = this.root.querySelector(`.window-entry[data-window-id="${windowId}"]`);
        if (w === null) {
            this.root.appendChild(this.create(0, {
                id: windowId,
                incognito: tab.incognito
            }));
            this.root.appendChild(tabElement);
        } else {
            let before = w;
            let index = (await tab.index) + 1;
            for (let i = 0; i < index; i++) {
                before = before.nextElementSibling;//TODO3
            }
            this.root.insertBefore(tabElement, before);
        }
    }
    cleanUp() {
        let all = this.sess.getAllAs2DArray();
        for (let tabs of all) {
            for (let tab of tabs) {
                tab.clearProxies();
            }
        }
        TUISessionView.clearRoot(this.root);
        this.sess.removeListener(this.sessionListener);
        document.removeEventListener("keydown", this.documentHook_keyDown);
        document.removeEventListener("keyup", this.documentHook_keyUp);
        document.removeEventListener("keydown", this.documentHook_keyDownKBOnly);
        document.removeEventListener("keyup", this.documentHook_keyUpKBOnly);
        if (this.endMultiselect) {
            document.removeEventListener("mouseup", this.endMultiselect);
        }
        this.listOptions.off("change", this.listOptionsHook_change);
        return this.root;
    }
    createTab(tab, list, hook=true, hookPos=true) {
        let e = list.create(1, tab);
    
        // Hook the tab up with its respective TTab object
        if (hook) {
            tab.proxy((prop, value) => {
                console.log("Tab " + tab.id + "'s property " + prop + " has been set to '" + value + "'")
    
                if (prop === "#position" && hookPos) {
                    let after = list.root.querySelector(`.window-entry[data-window-id="${value.newWindowId}"]`);
                    after.parentElement.removeChild(e);
                    let i = value.newPosition;
                    while (i > 0) {
                        after = after.nextElementSibling;//TODO3
                        i--;
                    }
                    after.parentElement.insertBefore(e, after.nextElementSibling);//TODO3
                } else if (prop === "active") {
                    if (value) e.setAttribute("data-current", "");
                    else e.removeAttribute("data-current");
                } else if (prop === "title") {
                    let title = e.querySelector(".title");
                    if (title) {
                        title.innerText = value;
                    }
                } else if (prop === "url") {
                    //TODO
                } else if (prop === "favIconUrl") {
                    let favicon = e.querySelector(".favicon");
                    let favIconPromise;
                    if (!value.startsWith("chrome://")) {
                        if (tab.incognito) {
                            favIconPromise = t_getImage(value, true);
                        } else {
                            favIconPromise = t_getImage(value);
                        }
                    } else {
                        favIconPromise = Promise.resolve(value);
                    }
                    favIconPromise.then(base64Image => {
                        favicon.src = base64Image;
                    });
                } else if (prop === "mutedInfo") {
                    let speaker = e.querySelector(".speaker");
                    if (speaker) {
                        if (value.muted) {
                            speaker.setAttribute("data-state", "off");
                        } else {
                            if (tab.audible) {
                                speaker.setAttribute("data-state", "on");
                            } else {
                                speaker.setAttribute("data-state", "");
                            }
                        }
                    }
                } else if (prop === "audible") {
                    let speaker = e.querySelector(".speaker");
                    if (speaker) {
                        if (tab.mutedInfo.muted) {
                            speaker.setAttribute("data-state", "off");
                        } else {
                            if (value) {
                                speaker.setAttribute("data-state", "on");
                            } else {
                                speaker.setAttribute("data-state", "");
                            }
                        }
                    }
                } else if (prop === "pinned") {
                    let pin = e.querySelector(".pin");
                    if (pin) {
                        pin.setAttribute("data-state", value ? "pinned" : "");
                    }
                }// TODO: isArticle, status?
            }, () => {
                // if (e.classList.contains("-tui-list-hover")) {
                //     let passedWindowEntry = false; // Passed a window entry while trying to find the next tab below
                //     let closestDown = this.next(e, ele => {
                //         let isTabEntry = ele.classList.contains("tab-entry");
                //         if (!isTabEntry) passedWindowEntry = true;
                //         return TUIList.isElementVisible(ele) && isTabEntry;
                //     });
                //     if (closestDown && !passedWindowEntry) {
                //         closestDown.classList.add("-tui-list-hover");
                //         setTimeout(() => list.dataInterpret.handleHover(closestDown, "tabClosedClosestDown"), 1);
                //     } else {
                //         let closestUp = this.previous(e, ele => {
                //             return TUIList.isElementVisible(ele) && ele.classList.contains("tab-entry");
                //         });
                //         if (closestUp) {
                //             closestUp.classList.add("-tui-list-hover");
                //             setTimeout(() => list.dataInterpret.handleHover(closestUp, "tabClosedClosestUp"), 1);
                //         } else if (closestDown && passedWindowEntry) {
                //             closestDown.classList.add("-tui-list-hover");
                //             setTimeout(() => list.dataInterpret.handleHover(closestDown, "tabClosedClosestDown"), 1);
                //         }
                //     }
                // }
                const event = new Event("-tui-list-removed");
                e.dispatchEvent(event);
                e.parentElement.removeChild(e);
            });
        }

        return e;
    }
}

/**
 * TUISessionView, with the window entries removed, leaving a plain tab list
 */
class TUISessionNoWindowsView extends TUISessionView {
    create(level, data) {
        let ele = super.create(level, data);
        if (level === 0) {
            ele.classList.add("hidden");
        }
        return ele;
    }
}
/**
 * In addition to being a basic tab list without windows, also disable the position hooks
 *  for the tabs. Base class for various sorted views
 */
class TUISessionNoWindowsPosHooklessView extends TUISessionNoWindowsView {
    constructor(root, sess, dataInterpret, listOptions=TUIListOptions.default()) {
        super(root, sess, dataInterpret, listOptions, false);
    }
}

/**
 * Base class for connecting the list to the data behind the list
 */
class TUIListDataInterpret {
    createRoot(data) { return document.createElement("div"); /*OVERRIDE*/ }
    createElement(level, data) { return document.createElement("div"); /*OVERRIDE*/ }
    handleClick(element, allMultiselected, originalEvent) { /*OVERRIDE*/ }
    handleHover(element, originalEvent) { /*OVERRIDE*/ }
    ghostSetup(ghost) { /*OVERRIDE*/ }
    handleDrop(elements, dropTarget, relation) { /*OVERRIDE*/ }
}

class SearchDiv extends TUIEditableDiv {
    constructor(sess, tabsList) {
        super(true);
        this.sess = sess;
        this.tabsList = tabsList;
        this.root.id = "_search";
        this.root.classList.add("search");
        this.root.setAttribute("type", "text");
        this.editing = true;
        this.value = "";
        // this._offset = 0;
    }
    reconstructQuery(query, last=false) {
        switch (query.t) {
            case "ALL":
                let result = "";
                for (let i = 0; i < query.children.length; i++) {
                    result += this.reconstructQuery(query.children[i], i == query.children.length-1);
                }
                return result;
            break;
            case "SENTENCE":
                if (last) {
                    return query.originalString;
                } else {
                    this._offset += query.adjustedString.length - query.originalString.length;
                    return query.adjustedString;
                }
            break;
            case "REGEX":
                return query.originalString;
            break;
            case "NOOP":
                return query.originalString;
            break;
        }
    }
    async onInput(value) {
        if (value.trim() === "") {
            this.tabsList.filter(value, undefined);
        } else {
            let ids = this.sess.getAllTabIdsAsStrings();
            await browser.runtime.sendMessage({
                _: "search",
                queryString: value,
                ids
            });
        }
    }
}
/**
 * Window name input handler
 */
class WindowName extends TUIEditableLabel {
    static __instances = new Map();
    static sessionListener = {
        onTabCreated: (tab) => {  },
        onWindowClosed: (closedWindowId) => {
            if (WindowName.__instances.has(closedWindowId)) {
                WindowName.__instances.delete(closedWindowId);
            }
            WindowName.recalculateOrder();
        },
        onWindowFocusChanged: (windowId) => {  }
    };
    static recalculateOrder() {
        let i = 1;
        for (let [, windowName] of WindowName.__instances) {
            windowName.initialWindowName = `Window ${i}`;
            i++;
        }
    }
    /**
     * Returns the correct instance of WindowName based on the window id (undefined if instance does not exist)
     * @param {Integer} windowId 
     * @returns {WindowName}
     */
    static getInstance(windowId) {
        return WindowName.__instances.get(windowId);
    }
    // The window name will not actually be set until the "wrapper" is added to the DOM and the value property of this object is changed for the first time
    constructor(windowId, sess, defaultWindowName) {
        super();

        this.windowId = windowId;
        this.sess = sess;

        WindowName.__instances.set(windowId, this);
        // This sessionListener must be added in order to prevent memory leaks
        if (!sess.hasListener(WindowName.sessionListener)) {
            sess.addListener(WindowName.sessionListener);
        }

        this.__initialWindowName = defaultWindowName;
        this.__currentValue = "";

        this.wrapper = document.createElement("span");
        this.wrapper.classList.add("title");

        this.wrapper.appendChild(this.root);

        this.currentWindowIndicator = document.createElement("span");
        this.currentWindowIndicator.innerText = " - Current";
        this.currentWindowIndicator.classList.add("current-window-indicator");

        this.wrapper.appendChild(this.currentWindowIndicator);

        WindowName.recalculateOrder();
    }
    /**
     * Initialize window name from temp store
     * (As with most other methods in this class, call only after adding "wrapper" to DOM)
     */
    initializeFromStore() {
        let nameFromStore = this.sess._rel.getName(this.windowId);
        this.value = nameFromStore ? nameFromStore : "";
    }
    // Careful with the getter, if used inside of value's setter WILL cause an infinite loop
    set initialWindowName(v) {
        this.__initialWindowName = v;
        this.value = this.__currentValue;
    }
    set value(v) {
        this.__currentValue = v;
        if (v.trim() === "") {
            super.value = this.__initialWindowName;
        } else {
            super.value = v;
        }
    }
    get editing() {
        return super.editing;
    }
    set editing(v) {
        super.editing = v;
        if (this.wrapper && this.wrapper.parentElement) {
            if (v) {
                this.wrapper.parentElement.querySelector(".rename-window").classList.add("hold-while-editing");
            } else {
                this.wrapper.parentElement.querySelector(".rename-window").classList.remove("hold-while-editing");
            }
        }
    }
    onEnter(value) {
        this.sess._rel.setName(this.windowId, value);
        this.editing = false;
        t_altReleasedEarly();
    }
}
/**
 * Extends TUIListDataInterpret to connect the list to the tab data
 *  (Never call any methods from this class directly! They are called automatically by TUIList)
 */
class TUITabsList extends TUIListDataInterpret {
    constructor(sess, detailsController) {
        super();
        this.sess = sess;
        this.details = detailsController;
        this.list = undefined;
    }
    __setList(list) {
        this.list = list;
    }
    createRoot(data) {
        let list = document.createElement("ul");
        list.id = "tab-list";
        list.classList.add("tab-list");
        document.querySelector("#session-display-pane > #where-to-put-the-tab-list").appendChild(list);
        return list;
    }
    createElement(level, data) {
        // DO NOT HANDLE CLICKS DIRECTLY (event listeners, etc.)! That is handled by TUIList
        if (level == 0) {
            let entry = document.createElement("li");
            entry.className = "window-entry";
            if (data.incognito) entry.classList.add("incognito");
            entry.setAttribute("data-window-id", data.id);
            if (this.sess._rel.getFocusedWindow() === data.id) entry.setAttribute("data-current", "true");
            
            let tmp = document.createElement("span");
            tmp.className = "single-controls";
            let tmp1 = document.createElement("span");
            tmp1.className = "inline-button inline-icon-button -opacity-indication -force-filter-svg-to-match-theme hide-window-tabs";
            tmp.appendChild(tmp1);
            entry.appendChild(tmp);

            let windowNameComponent = new WindowName(data.id, this.sess, "Window #");
            entry.appendChild(windowNameComponent.wrapper);
            setTimeout(() => windowNameComponent.value = "", 1);
            setTimeout(() => windowNameComponent.initializeFromStore(), 2);

            tmp = document.createElement("span");
            tmp.className = "single-controls";
            tmp1 = document.createElement("span");
            tmp1.className = "inline-button inline-icon-button -opacity-indication -force-filter-svg-to-match-theme rename-window";
            let tmp2 = document.createElement("span");
            tmp2.className = "inline-button inline-icon-button -opacity-indication -force-filter-svg-to-match-theme close-window";
            tmp.appendChild(tmp1);
            tmp.appendChild(tmp2);
            entry.appendChild(tmp);

            return entry;
        } else if (level == 1) {
            let entry = document.createElement("li");
            entry.className = "tab-entry";
            if (data.incognito) entry.classList.add("incognito");
            entry.setAttribute("data-tab-id", data.id);
            if (data.active) entry.setAttribute("data-current", "");
            
            let tmp;
            tmp = document.createElement("div");
            tmp.className = "last-selected-indicator";
            entry.appendChild(tmp);

            tmp = document.createElement("div");
            tmp.className = "selected-indicator";
            entry.appendChild(tmp);

            tmp = document.createElement("div");
            tmp.className = "contextual-identity-indicator";
            let ciElement = tmp;
            data.mozContextualIdentity.then(v => {
                if (v) ciElement.style = "--contextual-identity-color: " + v.colorCode + ";";
            });
            entry.appendChild(tmp);

            tmp = document.createElement("img");
            tmp.className = "favicon";
            let faviconElement = tmp;
            if (data.favIconUrl) {
                let favIconPromise;
                if (!data.favIconUrl.startsWith("chrome://")) {
                    if (data.incognito) {
                        favIconPromise = t_getImage(data.favIconUrl, true);
                    } else {
                        favIconPromise = t_getImage(data.favIconUrl);
                    }
                } else {
                    favIconPromise = Promise.resolve(data.favIconUrl);
                }
                favIconPromise.then(base64Image => {
                    faviconElement.src = base64Image;
                });
            }
            entry.appendChild(tmp);

            tmp = document.createElement("div");
            tmp.className = "title-wrapper";
            let tmp2 = document.createElement("span");
            tmp2.className = "title";
            tmp2.innerText = data.title;
            tmp.appendChild(tmp2);
            entry.appendChild(tmp);

            tmp = document.createElement("div");
            tmp.className = "single-controls";
            let pin = document.createElement("span");
            pin.className = "inline-button inline-icon-button -opacity-indication -force-filter-svg-to-match-theme show-when-on hide-when-not-selected pin";
            pin.setAttribute("data-state", data.pinned ? "pinned" : "");
            let speaker = document.createElement("span");
            speaker.className = "inline-button inline-icon-button -opacity-indication -force-filter-svg-to-match-theme show-when-on speaker";
            speaker.setAttribute("data-state", data.mutedInfo.muted ? "off" : (data.audible ? "on" : ""));
            let closeTab = document.createElement("span");
            closeTab.className = "inline-button inline-icon-button close-tab";
            tmp.appendChild(pin); tmp.appendChild(speaker); tmp.appendChild(closeTab);
            entry.appendChild(tmp);

            return entry;
        }
    }
    async handleClick(element, allMultiselected, evt) {
        allMultiselected = Array.from(allMultiselected);
        let elementIsInMultiselection = allMultiselected.some(node => node.isSameNode(element));
        if (element.classList.contains("tab-entry")) {
            let tabId = parseInt(element.getAttribute("data-tab-id"));
            let tabObj = this.sess.getTab(tabId);
            let actions;
            if (elementIsInMultiselection) {
                let multiselectIds = allMultiselected.filter(node => node.hasAttribute("data-tab-id")).map(node => parseInt(node.getAttribute("data-tab-id")));
                actions = new TTabActions(...multiselectIds);
            } else {
                actions = new TTabActions(tabId);
            }
            if (evt.target.classList.contains("pin") || evt.key === "p") {
                await actions.pin(!tabObj.pinned);
            } else if (evt.target.classList.contains("speaker") || evt.key === "m") {
                await actions.mute(!tabObj.mutedInfo.muted);
            } else if (evt.target.classList.contains("close-tab") || evt.button === 1 || evt.key === "Delete") {
                await actions.remove();
            } else {
                if (evt.key && evt.key !== "Enter") return;
                await actions.activate();
                this.sess.getWindowActions(tabObj.windowId).activate();
            }
        } else if (element.classList.contains("window-entry")) {
            let windowId = parseInt(element.getAttribute("data-window-id"));
            let actions = new TWindowActions(windowId);
            if (evt.target.classList.contains("rename-window")) {
                let windowName = WindowName.getInstance(windowId);
                if (windowName) {
                    windowName.editing = true;
                }
            } else if (evt.target.classList.contains("close-window")) {
                await actions.remove();
            } else {
                if (evt.key && evt.key !== "Enter") return;
                await actions.activate();
            }
        }
    }
    handleHover(element, originalEvent) {
        if (originalEvent.key) {
            if (originalEvent.key === "ArrowUp") {
                t_getInView(element, this.list.root.parentElement, true);
            } else if (originalEvent.key === "ArrowDown") {
                t_getInView(element, this.list.root.parentElement, false);
            }
        }
        let tabId = parseInt(element.getAttribute("data-tab-id"));
        let tabObj = this.sess.getTab(tabId);
        if (element.classList.contains("tab-entry") && tabObj) {
            this.details.setCurrent(tabId);
            this.details.setTitle(tabObj.title);
            this.details.setURL(tabObj.url);
            this.details.captureTab();
        }
    }
    ghostSetup(ghost) {
        ghost.classList.add("tab-list");
        ghost.style.width = "calc(var(--width) * 0.45)";
    }
    handleDrop(elements, dropTarget, relation) {
        //let elementsClone = Array.from(elements);
        let toMove = elements.filter(ele => ele.classList.contains("tab-entry")).map(ele => parseInt(ele.getAttribute("data-tab-id")));
        
        if (dropTarget.classList.contains("window-entry")) {
            let targetWindowId = parseInt(dropTarget.getAttribute("data-window-id"));
            TTabActions.move(toMove, targetWindowId, -1);
        } else {
            // let targetTab = this.sess.getTab(parseInt(dropTarget.getAttribute("data-tab-id")));
            // let targetWindowId = targetTab.windowId;
            // let firstMove = toMove.shift();
            // elementsClone.shift();
            // let movingDownwards = () => {
            //     let ele = undefined;
            //     let elementWindowId = this.sess.getTab(firstMove).windowId;
            //     if (elementWindowId === targetWindowId) {
            //         ele = elements[0];
            //     }
            //     if (ele) {
            //         return ele.compareDocumentPosition(dropTarget) & Node.DOCUMENT_POSITION_FOLLOWING;
            //     } else {
            //         return false;
            //     }
            // };
            // targetTab.index.then(pos => {
            //     if (movingDownwards()) {
            //         pos--;
            //     }
            //     if (relation === "below") {
            //         pos++;
            //     }
            //     TTabActions.move([firstMove], targetWindowId, pos).then(async () => {
            //         let nextMove = toMove.shift();
            //         let nextMoveElement = elementsClone.shift();
            //         let moveAfter = firstMove;
            //         let canMoveWithoutCalc = [];
            //         let moveAllFromOtherWindows = async () => {
            //             canMoveWithoutCalc = [];
            //             let moveChunkAfter = moveAfter;
            //             if (nextMove === undefined) return;
            //             let tabInformation = this.sess.getTab(nextMove);
                        
            //             while (nextMove !== undefined && tabInformation.windowId !== targetWindowId) {
            //                 canMoveWithoutCalc.push(nextMove);
                            
            //                 moveAfter = nextMove;
            //                 nextMove = toMove.shift();
            //                 nextMoveElement = elementsClone.shift();
            //                 if (nextMove) tabInformation = this.sess.getTab(nextMove);
            //             }
            //             console.log("move without calculations: ", canMoveWithoutCalc);
            //             await TTabActions.move(canMoveWithoutCalc, targetWindowId, (await this.sess.getTab(moveChunkAfter).index) + 1);
            //         };
            //         await moveAllFromOtherWindows();
            //         await t_delay(5);

            //         let movingDown = [];
            //         let movingUp = [];
            //         let newDropBase = canMoveWithoutCalc[canMoveWithoutCalc.length-1];
            //         if (newDropBase === undefined) {
            //             newDropBase = firstMove;
            //         }
            //         let newDropTarget = dropTarget.parentElement.querySelector(`.tab-entry[data-tab-id="${newDropBase}"]`);
            //         while (nextMove !== undefined) {
            //             let nextMoveTabWID = this.sess.getTab(nextMove).windowId;
            //             let moveAfterTabWID = this.sess.getTab(moveAfter).windowId;
            //             if (nextMoveTabWID !== moveAfterTabWID) {
            //                 break;
            //             }
            //             let comparePos = nextMoveElement.compareDocumentPosition(newDropTarget);
            //             if (comparePos & Node.DOCUMENT_POSITION_FOLLOWING) { // We are moving the tab downwards
            //                 movingDown.push(nextMove);
            //             } else if (comparePos === 0) {

            //             } else {
            //                 movingUp.push(nextMove);
            //             }
            //             moveAfter = nextMove;
            //             nextMove = toMove.shift();
            //             nextMoveElement = elementsClone.shift();
            //         }
            //         let listElements = Array.from(newDropTarget.parentElement.children);
            //         let pos = listElements.indexOf(newDropTarget);
            //         let targetWindowElement = newDropTarget.parentElement.querySelector(`.window-entry[data-window-id="${targetWindowId}"]`);
            //         pos = pos - listElements.indexOf(targetWindowElement);
            //         // move up elements
            //         await TTabActions.move(movingUp, targetWindowId, pos);

            //         await t_delay(5);

            //         // move down elements
            //         await TTabActions.move(movingDown, targetWindowId, pos-1); //TODO: Why the heck is it pos-1?? (It works but still)

            //         await t_delay(5);

            //         await moveAllFromOtherWindows();
            //     });
            // });






            // let targetTab = this.sess.getTab(parseInt(dropTarget.getAttribute("data-tab-id")));
            // let targetWindowId = targetTab.windowId;
            // let firstMove = toMove.shift();
            // let movingDownwards = () => {
            //     let ele = undefined;
            //     let elementWindowId = this.sess.getTab(firstMove).windowId;
            //     if (elementWindowId === targetWindowId) {
            //         ele = elements[0];
            //     }
            //     if (ele) {
            //         return ele.compareDocumentPosition(dropTarget) & Node.DOCUMENT_POSITION_FOLLOWING;
            //     } else {
            //         return false;
            //     }
            // };
            // targetTab.index.then(pos => {
            //     if (movingDownwards()) {
            //         pos--;
            //     }
            //     if (relation === "below") {
            //         pos++;
            //     }
            //     TTabActions.move([firstMove], targetWindowId, pos).then(async () => {
            //         let nextMove = toMove.shift();
            //         let moveAfter = firstMove;
            //         let moveAllFromOtherWindows = async () => {
            //             let moveChunkAfter = moveAfter;
            //             if (nextMove === undefined) return;
            //             let tabInformation = this.sess.getTab(nextMove);
            //             let canMoveWithoutCalc = [];
            //             while (nextMove !== undefined && tabInformation.windowId !== targetWindowId) {
            //                 canMoveWithoutCalc.push(nextMove);
    
            //                 moveAfter = nextMove;
            //                 nextMove = toMove.shift();
            //                 if (nextMove) tabInformation = this.sess.getTab(nextMove);
            //             }
            //             console.log("move without calculations: ", canMoveWithoutCalc);
            //             await TTabActions.move(canMoveWithoutCalc, targetWindowId, (await this.sess.getTab(moveChunkAfter).index) + 1);
            //         };
            //         await moveAllFromOtherWindows();
            //         while (nextMove !== undefined) {
            //             let nextMoveTab = this.sess.getTab(nextMove);
            //             let nextMoveFullLive = await nextMoveTab.full;
            //             let nextMoveIndex = nextMoveFullLive.index;
            //             let nextMoveTabWID = nextMoveFullLive.windowId;

            //             let moveAfterTab = this.sess.getTab(moveAfter);
            //             let moveAfterFullLive = await moveAfterTab.full;
            //             let moveAfterIndex = moveAfterFullLive.index;
            //             let moveAfterTabWID = moveAfterFullLive.windowId;

            //             let finalPos = moveAfterIndex + 1;
            //             if (nextMoveTabWID !== moveAfterTabWID) {
            //                 break;
            //             }
            //             if (nextMoveIndex < moveAfterIndex) { // We are moving the tab downwards
            //                 finalPos--;
            //             }

            //             await TTabActions.move([nextMove], moveAfterTabWID, finalPos);

            //             moveAfter = nextMove;
            //             nextMove = toMove.shift();
            //         }
            //         await moveAllFromOtherWindows();
            //     });
            // });







            // let targetTab = this.sess.getTab(parseInt(dropTarget.getAttribute("data-tab-id")));
            // let targetWindowId = targetTab.windowId;
            // TTabActions.move(toMove, targetWindowId, -1).then(async () => {
            //     let pos = await targetTab.index;
            //     if (relation === "below") {
            //         pos++;
            //     }
            //     TTabActions.move(toMove, targetWindowId, pos);
            // });




            
            








            
            let targetWindowId = this.sess.getTab(parseInt(dropTarget.getAttribute("data-tab-id"))).windowId;
            let movingDownwards = () => {
                let ele = undefined;
                for (const element of elements) {
                    let elementWindowId = this.sess.getTab(parseInt(element.getAttribute("data-tab-id"))).windowId;
                    if (elementWindowId === targetWindowId) {
                        ele = element;
                        break;
                    }
                }
                if (ele) {
                    return ele.compareDocumentPosition(dropTarget) & Node.DOCUMENT_POSITION_FOLLOWING;
                } else {
                    return false;
                }
            };
            let listElements = Array.from(dropTarget.parentElement.children);
            let targetWindowElement = dropTarget.parentElement.querySelector(`.window-entry[data-window-id="${targetWindowId}"]`);
            let pos = listElements.indexOf(dropTarget);
            pos = pos - listElements.indexOf(targetWindowElement) - 1;
            //https://bugzilla.mozilla.org/show_bug.cgi?id=1766159
            if (movingDownwards()) pos--; // https://bugzilla.mozilla.org/show_bug.cgi?id=1323311
            if (relation === "below") pos++;
            if (this.list && relation === "below") {
                let targetWindowElementChildren = this.list.children(targetWindowElement, false);
                if (dropTarget.isSameNode(targetWindowElementChildren[targetWindowElementChildren.length-1])) {
                    pos = -1;
                }
            }
            TTabActions.move(toMove, targetWindowId, pos);
        }
    }
}

(async () => {
    let _alt = false;
    let altPressed = () => {
        if (!_alt) {
            _alt = true;
            document.body.classList.add("alt-pressed");
        }
    };
    let altReleased = () => {
        if (_alt) {
            _alt = false;
            document.body.classList.remove("alt-pressed");
        }
    };
    document.addEventListener("keydown", (evt) => {
        if (evt.key === 'Alt') {
            altPressed();
        }
    });
    document.addEventListener("drag", (evt) => {
        if (evt.altKey) {
            altPressed();
        } else {
            altReleased();
        }
    });
    document.addEventListener("keyup", (evt) => {
        if (evt.key === 'Alt') {
            altReleased();
        }
    });
    /**
     * For use when `keyup` is not called for whatever reason or the code wants to pretend that 
     * alt has been released early.
     */
    window.t_altReleasedEarly = altReleased;

    // Visually show when window is not focused
    window.onblur = () => {
        document.body.style.opacity = "0.8";
    };
    window.onfocus = () => {
        document.body.style.opacity = "";
    };

    let sess = await TSession.read_from_current();
    sess.enableBrowserHooks();

    let detailsController = new DetailsController();
    let dataInterpret = new TUITabsList(sess, detailsController);
    let root = TUIList.makeRoot(dataInterpret, undefined);
    let tabsList = new TUISessionView(root, sess, dataInterpret);
    tabsList.root.setAttribute("data-live", "true");

    // Create the search bar
    let search = new SearchDiv(sess, tabsList);
    let settingsBtn = document.getElementById("_access_settings");
    settingsBtn.parentElement.insertBefore(search.root, settingsBtn);

    browser.runtime.onMessage.addListener(data => {
        if (data["_"] !== "search") return;
        tabsList.filter(search.value, data.results);
    });
    //tabsList = new TUISessionNoWindowsView(tabsList.cleanUp(), sess, dataInterpret);
    // === MULTISELECT TEST ===
    //tabsList.enableMultiselect();
})();

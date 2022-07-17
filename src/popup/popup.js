import "Polyfill"

import { TSession, TSessionListener } from "tapi/tsession";
import { TTabActions } from "../tapi/taction";

(async () => {
    let sess = await TSession.read_from_current();
    sess.enableBrowserHooks();
    sess.addListener({
        onTabCreated(tab) {
            let w = document.querySelector(`#tab-list[data-live] .window-entry[data-window-id="${tab.windowId}"]`);
            if (w === null) {
                tabsList.append(0, {
                    id: tab.windowId
                });
            }
            addTab(tab);
        },
        onWindowClosed(windowId) {
            let w = document.querySelector(`#tab-list[data-live] .window-entry[data-window-id="${windowId}"]`);
            if (w) {
                w.parentElement.removeChild(w);
            }
        }
    });
    let all = sess.getAllAs2DArray();
    let tabsList = new TUIList(undefined, new TUITabsList(sess));
    tabsList.root.setAttribute("data-live", "true");
    let addTab = (tab) => {
        let e = tabsList.append(1, tab);

        // Hook the tab up with its respective TTab object
        tab.proxy((prop, value) => {
            console.log("Tab " + tab.id + "'s property " + prop + " has been set to '" + value + "'")

            if (prop === "#position") {
                let after = document.querySelector(`#tab-list[data-live] .window-entry[data-window-id="${value.newWindowId}"]`);
                after.parentElement.removeChild(e);
                let i = value.newPosition;
                while (i > 0) {
                    after = after.nextElementSibling;
                    i--;
                }
                after.parentElement.insertBefore(e, after.nextElementSibling);
            }
            if (prop === "active") {
                if (value) e.setAttribute("data-current", "");
                else e.removeAttribute("data-current");
            }
        }, () => {
            e.parentElement.removeChild(e);
        });
    };
    let addWindow = (tabs) => {
        tabsList.append(0, {
            id: tabs[0].windowId
        });
        for (let tab of tabs) {
            addTab(tab);
        }
    };
    for (let tabs of all) {
        addWindow(tabs);
    }
    // === MULTISELECT TEST ===
    //tabsList.enableMultiselect();
})();

class TUIList {
    constructor(data, dataInterpret) {
        this.dataInterpret = dataInterpret;
        let rootContainer = this.dataInterpret.createRoot(data);
        rootContainer.classList.add("-tui-list-container");
        this.root = rootContainer;
        this.multiselect = false;
        this.multiselectDragging = false;
        this.lastSelected = undefined;
        this.documentHookInPlace_mouseUp = false;
        this.draggedElements = [];
        document.addEventListener("keypress", (evt) => {
            if (evt.key === 'm') {
                if (this.multiselect) {
                    this.disableMultiselect();
                } else {
                    this.enableMultiselect();
                }
            }
        });
    }
    append(level, data) {
        let e = this.dataInterpret.createElement(level, data);
        e.setAttribute("draggable", "true");
        e.setAttribute("tabindex", "0");
        e.setAttribute("data-level", level);
        e.addEventListener("mouseenter", () => {
            let lastHover = this.root.querySelector(".-tui-list-hover");
            if (lastHover) lastHover.classList.remove("-tui-list-hover");
            e.classList.add("-tui-list-hover");
        });
        let processSelect = (element, action=undefined) => {
            if (this.multiselect) {
                if (this.multiselectDragging) {
                    if (action === undefined && element.classList.contains("-tui-list-selected")) {
                        action = "unselecting";
                    }
                    // Interpolate (mousemove is too slow to react, and sometimes misses elements when the mouse is moved fast)
                    //TODO: Prevent it from looping through all elements from the initial selection to the mouse element
                    if (this.multiselectDragging.hasOwnProperty("start")) {
                        let relativePosToStart = this.multiselectDragging.start.compareDocumentPosition(element);
                        let getNext;
                        if (relativePosToStart & Node.DOCUMENT_POSITION_FOLLOWING) {
                            getNext = (element) => element.previousElementSibling;
                        } else if (relativePosToStart & Node.DOCUMENT_POSITION_PRECEDING) {
                            getNext = (element) => element.nextElementSibling;
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
                        if (next) processSelect(next, action);
                    }
                    if (action === "unselecting") {
                        element.classList.remove("-tui-list-selected");
                        // reset last-selected if we are unselecting
                        if (this.lastSelected) this.lastSelected.classList.remove("-tui-list-last-selected");
                        this.lastSelected = undefined;
                        return "unselecting";
                    } else {
                        element.classList.add("-tui-list-selected");
                        // set new last-selected element if we are selecting
                        if (this.lastSelected !== undefined) {
                            this.lastSelected.classList.remove("-tui-list-last-selected");
                        }
                        this.lastSelected = element;
                        element.classList.add("-tui-list-last-selected");
                        return "selecting";
                    }
                }
            } else {
                this.dataInterpret.handleClick(element);
                return "click";
            }
        };
        e.addEventListener("click", () => {
            if (!this.multiselect) {
                processSelect(e);
            }
        });
        e.addEventListener("dragstart", (evt) => {
            if (!this.multiselect) {
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

                const areSiblings = (element1, element2) => 
                    (element1.nextElementSibling && element1.nextElementSibling.isSameNode(element2)) ||
                    (element1.previousElementSibling && element1.previousElementSibling.isSameNode(element2));

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
                        if (!areSiblings(draggables[i], draggables[i+1])) {
                            ghost.lastElementChild.style.marginBottom = "10px";
                        }
                    }
                }

                document.body.appendChild(ghost);

                evt.dataTransfer.setDragImage(ghost, 0, ghost.getBoundingClientRect().height*4);

            }
        });
        let getRidOfOtherCursors = () => {
            for (let ele of document.querySelectorAll(".-tui-list-container li[data-drag-relation]")) {
                ele.removeAttribute("data-drag-relation");
            }
        };
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

        e.addEventListener("mousedown", () => {
            if (this.multiselect) {
                e.setAttribute("draggable", "false");
                this.multiselectDragging = true;
                this.multiselectDragging = { start: e, action: processSelect(e) };
                this.multiselectDragging.start.classList.add("-tui-list-drag-starter");
            }
        });
        if (!this.documentHookInPlace_mouseUp) document.addEventListener("mouseup", () => {
            if (this.multiselectDragging) {
                this.multiselectDragging.start.classList.remove("-tui-list-drag-starter");
                this.multiselectDragging.start.setAttribute("draggable", "true");
            }
            this.documentHookInPlace_mouseUp = true;
            this.multiselectDragging = false;
        });
        e.addEventListener("mousemove", () => {
            if (this.multiselect && this.multiselectDragging) processSelect(e, this.multiselectDragging.action);
        });
        this.root.appendChild(e);
        return e;
    }
    enableMultiselect() {
        this.multiselect = true;
    }
    disableMultiselect() {
        this.multiselect = false;
    }
}

/**
 * Base class for connecting the list to the data behind the list
 */
class TUIListDataInterpret {
    createRoot(data) { return document.createElement("div"); /*OVERRIDE*/ }
    createElement(level, data) { return document.createElement("div"); /*OVERRIDE*/ }
    handleClick(element) { /*OVERRIDE*/ }
    ghostSetup(ghost) { /*OVERRIDE*/ }
    handleDrop(elements, dropTarget, relation) { /*OVERRIDE*/ }
}

/**
 * Extends TUIListDataInterpret to connect the list to the tab data
 */
class TUITabsList extends TUIListDataInterpret {
    constructor(sess) {
        super();
        this.sess = sess;
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
            entry.setAttribute("data-window-id", data.id);
            
            let tmp;
            tmp = document.createElement("span");
            tmp.className = "title";
            entry.appendChild(tmp);

            tmp = document.createElement("span");
            tmp.className = "single-controls";
            let tmp2 = document.createElement("span");
            tmp2.className = "inline-button inline-icon-button -opacity-indication -force-filter-svg-to-match-theme close-window";
            tmp.appendChild(tmp2);
            entry.appendChild(tmp);

            return entry;
        } else if (level == 1) {
            let entry = document.createElement("li");
            entry.className = "tab-entry";
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
            pin.className = "inline-button inline-icon-button -opacity-indication -force-filter-svg-to-match-theme hide-when-not-selected pin";
            let speaker = document.createElement("span");
            speaker.className = "inline-button inline-icon-button -opacity-indication -force-filter-svg-to-match-theme speaker";
            let closeTab = document.createElement("span");
            closeTab.className = "inline-button inline-icon-button close-tab";
            tmp.appendChild(pin); tmp.appendChild(speaker); tmp.appendChild(closeTab);
            entry.appendChild(tmp);

            return entry;
        }
    }
    handleClick(element) {
        if (element.classList.contains("tab-entry")) {
            let tabId = parseInt(element.getAttribute("data-tab-id"));
            let actions = this.sess.getTabActions(tabId);
            actions.activate();
        } else if (element.classList.contains("window-entry")) {
            let windowId = parseInt(element.getAttribute("data-window-id"));
            let actions = this.sess.getWindowActions(windowId);
            actions.activate();
        }
    }
    ghostSetup(ghost) {
        ghost.classList.add("tab-list");
        ghost.style.width = "calc(var(--width) * 0.45)";
    }
    handleDrop(elements, dropTarget, relation) {
        let movingDownwards = () => elements[0].compareDocumentPosition(dropTarget) & Node.DOCUMENT_POSITION_FOLLOWING;
        let toMove = elements.filter(ele => ele.classList.contains("tab-entry")).map(ele => parseInt(ele.getAttribute("data-tab-id")));
        let listElements = Array.from(dropTarget.parentElement.children);
        let pos = listElements.indexOf(dropTarget) - 1;
        if (relation === "below" && !movingDownwards()) pos++;
        if (relation === "above" && movingDownwards()) pos--;
        let targetWindowId = this.sess.getTab(parseInt(dropTarget.getAttribute("data-tab-id"))).windowId;
        pos = pos - listElements.indexOf(dropTarget.parentElement.querySelector(`.window-entry[data-window-id="${targetWindowId}"]`));
        TTabActions.move(toMove, targetWindowId, pos);
    }
}

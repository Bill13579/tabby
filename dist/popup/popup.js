/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./src/popup/popup.js");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./src/popup/domutils.js":
/*!*******************************!*\
  !*** ./src/popup/domutils.js ***!
  \*******************************/
/*! exports provided: toggleClass, getActualHeight */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "toggleClass", function() { return toggleClass; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "getActualHeight", function() { return getActualHeight; });
// Toggle a class of an element
function toggleClass(element, c) {
    if (element.classList.contains(c)) {
        element.classList.remove(c);
    } else {
        element.classList.add(c);
    }
}

// Get actual height of an element
function getActualHeight(element) {
    var styles = window.getComputedStyle(element);
    var margin = parseFloat(styles['marginTop']) +
               parseFloat(styles['marginBottom']);
    return element.offsetHeight + margin;
}

// getElementByClassName
Element.prototype.getElementByClassName = function (classNames) {
    return this.getElementsByClassName(classNames)[0] || null;
};


/***/ }),

/***/ "./src/popup/event-listeners/archive.js":
/*!**********************************************!*\
  !*** ./src/popup/event-listeners/archive.js ***!
  \**********************************************/
/*! exports provided: archiveDragStartReceiver, archiveDragOverReceiver, archiveDropReceiver */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "archiveDragStartReceiver", function() { return archiveDragStartReceiver; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "archiveDragOverReceiver", function() { return archiveDragOverReceiver; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "archiveDropReceiver", function() { return archiveDropReceiver; });
/* harmony import */ var _globals__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../globals */ "./src/popup/globals.js");
/* harmony import */ var _messaging__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../messaging */ "./src/popup/messaging.js");
/* harmony import */ var _wtdom__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../wtdom */ "./src/popup/wtdom.js");




let archiveTarget;

function archiveDragStartReceiver(e) {
    archiveTarget = e.target;
    e.dataTransfer.effectAllowed = "move";
}

function archiveDragOverReceiver(e) {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = "move";
    _globals__WEBPACK_IMPORTED_MODULE_0__["default"].archive.classList.add("saving-for-later");
}

function archiveDropReceiver(e) {
    if (archiveTarget.classList.contains("tab-entry")) {
        Object(_wtdom__WEBPACK_IMPORTED_MODULE_2__["getTabByTabEntry"])(archiveTarget).then(tab => {
            Object(_messaging__WEBPACK_IMPORTED_MODULE_1__["sendTabMessage"])(parseInt(archiveTarget.getAttribute("data-tab_id")), "packd", {
                action: "pack"
            }).then(response => {
                browser.storage.sync.get(["archive"], data => {
                    if (!data.archive) {
                        data.archive = {};
                        data.archive.default = [];
                    }
                    let repeat;
                    for (let i = 0; i < data.archive.default.length; i++) {
                        if (data.archive.default[i].url === tab.url) {
                            repeat = i;
                            break;
                        }
                    }
                    let scroll = {
                        top: response.top,
                        left: response.left
                    };
                    repeat === undefined ? data.archive.default.push({ url: tab.url, scroll: scroll }) : data.archive.default[repeat].scroll = scroll;
                    browser.storage.sync.set({ "archive": data.archive });
                });
            });
        });
    }
}


/***/ }),

/***/ "./src/popup/event-listeners/document.js":
/*!***********************************************!*\
  !*** ./src/popup/event-listeners/document.js ***!
  \***********************************************/
/*! exports provided: documentMouseOver, documentMouseUp, documentClicked, documentDragOver */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "documentMouseOver", function() { return documentMouseOver; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "documentMouseUp", function() { return documentMouseUp; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "documentClicked", function() { return documentClicked; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "documentDragOver", function() { return documentDragOver; });
/* harmony import */ var _globals__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../globals */ "./src/popup/globals.js");
/* harmony import */ var _keyutils__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../keyutils */ "./src/popup/keyutils.js");
/* harmony import */ var _wtutils__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../wtutils */ "./src/popup/wtutils.js");
/* harmony import */ var _wtdom__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../wtdom */ "./src/popup/wtdom.js");





function documentMouseOver(e) {
    if (e.button === 0) {
        if (e.target.classList.contains("tab-entry")) {
            if (Object(_keyutils__WEBPACK_IMPORTED_MODULE_1__["ctrlOrCmd"])() && _globals__WEBPACK_IMPORTED_MODULE_0__["default"].slideSelection.sliding) {
                Object(_wtdom__WEBPACK_IMPORTED_MODULE_3__["multiSelect"])(e.target);
            } else {
                let tabId = parseInt(e.target.getAttribute("data-tab_id"));
                browser.tabs.captureTab(tabId).then(dataUri => {
                    let detailsImage = document.getElementById("details-img");
                    detailsImage.src = dataUri;
                    let detailsTitle = document.getElementById("details-title");
                    let detailsURL = document.getElementById("details-url");
                    browser.tabs.get(tabId).then(tab => {
                        detailsTitle.textContent = tab.title;
                        detailsURL.textContent = tab.url;
                        document.getElementById("details-placeholder").style.display = "none";
                        document.getElementById("tab-details").style.display = "inline-block";
                        document.getElementById("tab-details").setAttribute("data-tab_id", tabId);
                        if (tab.pinned) {
                            document.getElementById("details-pinned").style.display = "inline";
                        } else {
                            document.getElementById("details-pinned").style.display = "none";
                        }
                        if (tab.hidden) {
                            document.getElementById("details-hidden").style.display = "inline";
                        } else {
                            document.getElementById("details-hidden").style.display = "none";
                        }
                        if (tab.pinned && tab.hidden) {
                            document.getElementById("details-comma").style.display = "inline";
                        } else {
                            document.getElementById("details-comma").style.display = "none";
                        }
                    });
                });
            }
        }
    }
    e.preventDefault();
}

function documentMouseUp(e) {
    if (_globals__WEBPACK_IMPORTED_MODULE_0__["default"].slideSelection.sliding) Object(_wtdom__WEBPACK_IMPORTED_MODULE_3__["resetSlideSelection"])();
}

function documentClicked(e) {
    if (e.button === 0) {
        if (e.target.classList.contains("tab-entry")) {
            if (Object(_keyutils__WEBPACK_IMPORTED_MODULE_1__["ctrlOrCmd"])()) {
                Object(_wtdom__WEBPACK_IMPORTED_MODULE_3__["multiSelectToggle"])(e.target);
            } else {
                let tabId = parseInt(e.target.getAttribute("data-tab_id"));
                let parentWindowId = parseInt(Object(_wtdom__WEBPACK_IMPORTED_MODULE_3__["getWindowFromTab"])(e.target).getAttribute("data-window_id"));
                browser.tabs.update(tabId, {
                    active: true
                });
                browser.windows.get(parentWindowId).then(w => {
                    Object(_wtutils__WEBPACK_IMPORTED_MODULE_2__["getCurrentWindow"])().then(cw => {
                        if (w.id !== cw.id) {
                            browser.windows.update(w.id, {
                                focused: true
                            });
                        }
                        window.close();
                    });
                });
            }
        } else if (e.target.parentElement.classList.contains("window-entry")) {
            let windowId = parseInt(e.target.parentElement.getAttribute("data-window_id"));
            browser.windows.update(windowId, {
                focused: true
            });
        } else if (e.target.id === "details-close") {
            document.getElementById("details-placeholder").style.display = "inline-block";
            document.getElementById("tab-details").style.display = "none";
            browser.tabs.remove(parseInt(document.getElementById("tab-details").getAttribute("data-tab_id")));
        } else if (e.target.classList.contains("tab-entry-remove-btn")) {
            let tabId = e.target.parentElement.parentElement.getAttribute("data-tab_id");
            let tabDetails = document.getElementById("tab-details");
            if (tabDetails.getAttribute("data-tab_id") === tabId) {
                tabDetails.style.display = "none";
                document.getElementById("details-placeholder").style.display = "inline-block";
            }
            browser.tabs.remove(parseInt(tabId));
        } else if (e.target.classList.contains("tab-entry-pin-btn")) {
            let tabId = e.target.parentElement.parentElement.getAttribute("data-tab_id");
            browser.tabs.get(parseInt(tabId)).then(tab => {
                if (tab.pinned) {
                    browser.tabs.update(parseInt(tabId), {
                        pinned: false
                    });
                } else {
                    browser.tabs.update(parseInt(tabId), {
                        pinned: true
                    });
                }
            });
        } else if (e.target.classList.contains("window-entry-remove-btn")) {
            let windowId = e.target.parentElement.parentElement.parentElement.getAttribute("data-window_id");
            browser.windows.remove(parseInt(windowId));
        } else {
            if (_globals__WEBPACK_IMPORTED_MODULE_0__["default"].isSelecting) Object(_wtdom__WEBPACK_IMPORTED_MODULE_3__["multiSelectReset"])();
        }
    }
}

function documentDragOver(e) {
    if (_globals__WEBPACK_IMPORTED_MODULE_0__["default"].archive.classList.contains("saving-for-later")) {
        _globals__WEBPACK_IMPORTED_MODULE_0__["default"].archive.classList.remove("saving-for-later");
    }
}


/***/ }),

/***/ "./src/popup/event-listeners/message.js":
/*!**********************************************!*\
  !*** ./src/popup/event-listeners/message.js ***!
  \**********************************************/
/*! exports provided: onMessage */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "onMessage", function() { return onMessage; });
/* harmony import */ var _domutils__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../domutils */ "./src/popup/domutils.js");
/* harmony import */ var _net__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../net */ "./src/popup/net.js");
/* harmony import */ var _wtdom__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../wtdom */ "./src/popup/wtdom.js");




function onMessage(request, sender) {
    switch (request.type) {
        case "ACTIVE_TAB_CHANGED":
            Object(_wtdom__WEBPACK_IMPORTED_MODULE_2__["setActiveTab"])(request.details.windowId, request.details.tabId);
            break;
        case "TAB_FAV_ICON_CHANGED":
            browser.tabs.get(request.details.tabId).then(tab => {
                let favIconPromise;
                if (tab.incognito) {
                    favIconPromise = Object(_net__WEBPACK_IMPORTED_MODULE_1__["getImage"])(request.details.favIconUrl, true);
                } else {
                    favIconPromise = Object(_net__WEBPACK_IMPORTED_MODULE_1__["getImage"])(request.details.favIconUrl);
                }
                favIconPromise.then(function (base64Image){
                    Object(_wtdom__WEBPACK_IMPORTED_MODULE_2__["getFavIconFromTabEntry"])(Object(_wtdom__WEBPACK_IMPORTED_MODULE_2__["findTabEntryById"])(request.details.tabId)).src = base64Image;
                });
            });
            break;
        case "TAB_PINNED_STATUS_CHANGED":
            let tabEntry = Object(_wtdom__WEBPACK_IMPORTED_MODULE_2__["findTabEntryById"])(request.details.tabId);
            let pinBtn = tabEntry.getElementByClassName("tab-entry-pin-btn");
            let windowEntryList = tabEntry.parentElement;
            let pinnedTabs;
            if (request.details.pinned) {
                pinnedTabs = windowEntryList.getElementsByClassName("pinned-tab");
                tabEntry.classList.add("pinned-tab");
                pinBtn.style.backgroundImage = "url(../icons/pinremove.svg)";
            } else {
                pinnedTabs = windowEntryList.getElementsByClassName("pinned-tab");
                tabEntry.classList.remove("pinned-tab");
                pinBtn.style.backgroundImage = "url(../icons/pin.svg)";
            }
            let lastPinnedTab = pinnedTabs[pinnedTabs.length-1];
            if (lastPinnedTab !== undefined) {
                windowEntryList.insertBefore(tabEntry, lastPinnedTab.nextSibling);
            } else {
                windowEntryList.insertBefore(tabEntry, windowEntryList.childNodes[0]);
            }
            break;
        case "TAB_TITLE_CHANGED":
            Object(_wtdom__WEBPACK_IMPORTED_MODULE_2__["findTabEntryById"])(request.details.tabId).getElementByClassName("tab-title").textContent = request.details.title;
            break;
        case "TAB_REMOVED":
            if (!request.details.windowClosing) {
                Object(_wtdom__WEBPACK_IMPORTED_MODULE_2__["removeTab"])(request.details.tabId, request.details.windowId);
            }
            break;
        case "WINDOW_REMOVED":
            Object(_wtdom__WEBPACK_IMPORTED_MODULE_2__["removeWindow"])(request.details.windowId);
            break;
    }
}


/***/ }),

/***/ "./src/popup/event-listeners/search.js":
/*!*********************************************!*\
  !*** ./src/popup/event-listeners/search.js ***!
  \*********************************************/
/*! exports provided: searchTextChanged */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "searchTextChanged", function() { return searchTextChanged; });
function keywordSearch(s, key) {
    let keywords = key.trim().split(" "), count = 0;
    for (let word of keywords) {
        if (word.trim() !== "" && word.match(/^[a-zA-Z0-9]+$/)) {
            if (s.toUpperCase().includes(word.toUpperCase())) {
                count++;
            }
        }
    }
    return count >= 2;
}

function search(s, key) {
    return s.toUpperCase().includes(key.toUpperCase()) || keywordSearch(s, key);
}

// Search
function searchTextChanged(e) {
    let input, filter, tabEntries;
    input = document.getElementById("search");
    filter = input.value;
    tabEntries = document.getElementsByClassName("tab-entry");
    if (filter !== "") {
        for (let tabEntry of tabEntries) {
            if (!search(tabEntry.getElementByClassName("tab-title").innerText, filter)) {
                tabEntry.style.display = "none";
            } else {
                tabEntry.style.display = "flex";
            }
        }
    } else {
        for (let tabEntry of tabEntries) {
            tabEntry.style.display = "flex";
        }
    }
}


/***/ }),

/***/ "./src/popup/event-listeners/windowEntryDrag.js":
/*!******************************************************!*\
  !*** ./src/popup/event-listeners/windowEntryDrag.js ***!
  \******************************************************/
/*! exports provided: windowEntryDragStarted, windowEntryDraggingOver, windowEntryDropped */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "windowEntryDragStarted", function() { return windowEntryDragStarted; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "windowEntryDraggingOver", function() { return windowEntryDraggingOver; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "windowEntryDropped", function() { return windowEntryDropped; });
/* harmony import */ var _globals__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../globals */ "./src/popup/globals.js");
/* harmony import */ var _keyutils__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../keyutils */ "./src/popup/keyutils.js");
/* harmony import */ var _wtdom__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../wtdom */ "./src/popup/wtdom.js");




let sourceTab, targetTab, under, sourceWindow, sourceWindowId;

function windowEntryDragStarted(e) {
    if (e.target.classList.contains("tab-entry")) {
        if (Object(_keyutils__WEBPACK_IMPORTED_MODULE_1__["ctrlOrCmd"])()) {
            Object(_wtdom__WEBPACK_IMPORTED_MODULE_2__["multiSelect"])(e.target);
            _globals__WEBPACK_IMPORTED_MODULE_0__["default"].slideSelection.sliding = true;
            e.preventDefault();
        } else {
            sourceTab = e.target;
            sourceWindow = Object(_wtdom__WEBPACK_IMPORTED_MODULE_2__["getWindowFromTab"])(sourceTab);
            sourceWindowId = parseInt(sourceWindow.getAttribute("data-window_id"));
            e.dataTransfer.effectAllowed = "move";
        }
        e.dataTransfer.setData('text/plain', null);
    }
}

function windowEntryDraggingOver(e) {
    e.preventDefault();
    let cursors = _globals__WEBPACK_IMPORTED_MODULE_0__["default"].tabsList.getElementsByClassName("insert-cursor");
    for (let c of cursors) {
        c.parentElement.removeChild(c);
    }
    let cursorWindow = _globals__WEBPACK_IMPORTED_MODULE_0__["default"].tabsList.getElementByClassName("insert-cursor-window");
    if (cursorWindow !== null) {
        cursorWindow.classList.remove("insert-cursor-window");
    }

    let windowEntry;
    if (e.target.classList.contains("tab-entry")) {
        let tabEntryBoundingClientRect = e.target.getBoundingClientRect();
        targetTab = e.target;
        under = false;
        if ((e.clientY - tabEntryBoundingClientRect.top) >= tabEntryBoundingClientRect.height / 2) {
            targetTab = targetTab.nextSibling;
            if (targetTab === null) {
                under = true;
                targetTab = e.target;
            }
        }
        if (Object(_wtdom__WEBPACK_IMPORTED_MODULE_2__["tabDraggable"])(sourceTab, targetTab, under, sourceWindow)) {
            let cursor = document.createElement("div");
            cursor.classList.add("insert-cursor");
            if (under) {
                targetTab.parentElement.appendChild(cursor);
            } else {
                targetTab.parentElement.insertBefore(cursor, targetTab);
            }
        }
    } else if ((windowEntry = e.target.parentElement) !== null) {
        if (windowEntry.classList.contains("window-entry")
            && sourceWindow !== windowEntry
            && !sourceTab.classList.contains("pinned-tab")
            && ((!sourceWindow.classList.contains("incognito-window") && !windowEntry.classList.contains("incognito-window"))
            || (sourceWindow.classList.contains("incognito-window") && windowEntry.classList.contains("incognito-window")))) {
            e.target.classList.add("insert-cursor-window");
        }
    }
}

function windowEntryDropped(e) {
    e.preventDefault();
    e.stopPropagation();
    let cursors = _globals__WEBPACK_IMPORTED_MODULE_0__["default"].tabsList.getElementsByClassName("insert-cursor");
    for (let cursor of cursors) {
        cursor.parentElement.removeChild(cursor);
    }
    let cursorWindow = _globals__WEBPACK_IMPORTED_MODULE_0__["default"].tabsList.getElementByClassName("insert-cursor-window");
    if (cursorWindow !== null) {
        cursorWindow.classList.remove("insert-cursor-window");
    }
    
    let windowEntry;
    if (e.target.classList.contains("tab-entry")) {
        if (!e.target.isSameNode(targetTab)) {
            let tabEntryBoundingClientRect = e.target.getBoundingClientRect();
            targetTab = e.target;
            under = false;
            if ((e.clientY - tabEntryBoundingClientRect.top) >= tabEntryBoundingClientRect.height / 2) {
                targetTab = targetTab.nextSibling;
                if (targetTab === null) {
                    under = true;
                    targetTab = e.target;
                }
            }
        }
        if (Object(_wtdom__WEBPACK_IMPORTED_MODULE_2__["tabDraggable"])(sourceTab, targetTab, under, sourceWindow)) {
            let destinationWindowId = parseInt(Object(_wtdom__WEBPACK_IMPORTED_MODULE_2__["getWindowFromTab"])(targetTab).getAttribute("data-window_id"));
            let sourceTabIndex = Array.prototype.indexOf.call(targetTab.parentElement.childNodes, sourceTab);
            let destinationIndex = Array.prototype.indexOf.call(targetTab.parentElement.childNodes, targetTab);
            let moveIndex = under ? -1 : ((sourceTabIndex !== -1 && destinationIndex > sourceTabIndex && destinationWindowId === sourceWindowId) ? destinationIndex-1 : destinationIndex);
            let sourceTabId = parseInt(sourceTab.getAttribute("data-tab_id"));
            browser.tabs.move(sourceTabId, {
                windowId: destinationWindowId,
                index: moveIndex
            });
            if (under) {
                Object(_wtdom__WEBPACK_IMPORTED_MODULE_2__["attachTab"])(sourceTab, Object(_wtdom__WEBPACK_IMPORTED_MODULE_2__["getWindowFromTab"])(targetTab));
            } else {
                Object(_wtdom__WEBPACK_IMPORTED_MODULE_2__["moveTab"])(sourceTab, targetTab);
            }
        }
    } else if ((windowEntry = e.target.parentElement) !== null) {
        if (windowEntry.classList.contains("window-entry")
            && sourceWindow !== windowEntry
            && !sourceTab.classList.contains("pinned-tab")
            && ((!sourceWindow.classList.contains("incognito-window") && !windowEntry.classList.contains("incognito-window"))
            || (sourceWindow.classList.contains("incognito-window") && windowEntry.classList.contains("incognito-window")))) {
            let sourceTabId = parseInt(sourceTab.getAttribute("data-tab_id"));
            let destinationWindowId = parseInt(windowEntry.getAttribute("data-window_id"));
            browser.tabs.move(sourceTabId, {
                windowId: destinationWindowId,
                index: -1
            });
            Object(_wtdom__WEBPACK_IMPORTED_MODULE_2__["attachTab"])(sourceTab, windowEntry);
        }
    }
}


/***/ }),

/***/ "./src/popup/globals.js":
/*!******************************!*\
  !*** ./src/popup/globals.js ***!
  \******************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
const globals = {
    tabsList: undefined,
    archive: undefined,
    isSelecting: false,
    slideSelection: {
        sliding: false,
        initiator: undefined,
        vector: 0
    }
};
/* harmony default export */ __webpack_exports__["default"] = (globals);


/***/ }),

/***/ "./src/popup/keyutils.js":
/*!*******************************!*\
  !*** ./src/popup/keyutils.js ***!
  \*******************************/
/*! exports provided: ctrlOrCmd */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "ctrlOrCmd", function() { return ctrlOrCmd; });
let keyPressed = {};
onkeydown = onkeyup = e => {
    e = e || event;
    keyPressed[e.code] = e.type == "keydown";
};

// Checks if either Ctrl(Windows & Linux) or Command(Mac) is pressed
function ctrlOrCmd() {
    if (window.navigator.platform.toUpperCase().indexOf("MAC") >= 0) {
        return keyPressed["OSRight"] || keyPressed["OSLeft"];
    }
    return keyPressed["ControlLeft"] || keyPressed["ControlRight"];
}


/***/ }),

/***/ "./src/popup/messaging.js":
/*!********************************!*\
  !*** ./src/popup/messaging.js ***!
  \********************************/
/*! exports provided: sendRuntimeMessage, sendTabMessage */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "sendRuntimeMessage", function() { return sendRuntimeMessage; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "sendTabMessage", function() { return sendTabMessage; });
// Function to send a message to the runtime
function sendRuntimeMessage(type, data) {
    return browser.runtime.sendMessage({
        type: type,
        data: data
    });
}

// Function to send a message to a tab
function sendTabMessage(tabId, target, data) {
    return browser.tabs.sendMessage(tabId, {
        target: target,
        data: data
    });
}


/***/ }),

/***/ "./src/popup/net.js":
/*!**************************!*\
  !*** ./src/popup/net.js ***!
  \**************************/
/*! exports provided: getImage, arrayBufferToBase64 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "getImage", function() { return getImage; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "arrayBufferToBase64", function() { return arrayBufferToBase64; });
// Function to get image from URL
function getImage(url, noCache=false) {
    return new Promise((resolve, reject) => {
        try {
            if (!url.startsWith("chrome://")) {
                let xhr = new XMLHttpRequest();
                xhr.onreadystatechange = function(){
                    if (this.readyState == 4 && this.status == 200) {
                        let contentType = xhr.getResponseHeader("Content-Type").trim();
                        if (contentType.startsWith("image/")) {
                            let flag = "data:" + contentType + ";charset=utf-8;base64,";
                            let imageStr = arrayBufferToBase64(xhr.response);
                            resolve(flag + imageStr);
                        } else {
                            reject("Image Request Failed: Content-Type is not an image! (Content-Type: \"" + contentType + "\")");
                        }
                    }
                };
                xhr.responseType = "arraybuffer";
                xhr.open("GET", url, true);
                if (noCache) { xhr.setRequestHeader("Cache-Control", "no-store"); }
                xhr.send();
            } else {
                resolve();
            }
        } catch (err) {
            reject(err.message);
        }
    });
}

// Function to transform ArrayBuffer into a Base64 String
function arrayBufferToBase64(buffer) {
    let binary = "";
    let bytes = [].slice.call(new Uint8Array(buffer));
    bytes.forEach((b) => binary += String.fromCharCode(b));
    return window.btoa(binary);
}


/***/ }),

/***/ "./src/popup/popup.js":
/*!****************************!*\
  !*** ./src/popup/popup.js ***!
  \****************************/
/*! no exports provided */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _globals__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./globals */ "./src/popup/globals.js");
/* harmony import */ var _wrong_to_right__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./wrong-to-right */ "./src/popup/wrong-to-right.js");
/* harmony import */ var _wtinit__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./wtinit */ "./src/popup/wtinit.js");
/* harmony import */ var _event_listeners_document__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./event-listeners/document */ "./src/popup/event-listeners/document.js");
/* harmony import */ var _event_listeners_archive__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./event-listeners/archive */ "./src/popup/event-listeners/archive.js");
/* harmony import */ var _event_listeners_search__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./event-listeners/search */ "./src/popup/event-listeners/search.js");
/* harmony import */ var _event_listeners_message__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./event-listeners/message */ "./src/popup/event-listeners/message.js");








_globals__WEBPACK_IMPORTED_MODULE_0__["default"].tabsList = document.getElementById("tabs-list");

async function main() {
    // Make tabs list fit the panel
    Object(_wtinit__WEBPACK_IMPORTED_MODULE_2__["extendTabsList"])();
    // Fix for cross-window dragging issue
    await Object(_wrong_to_right__WEBPACK_IMPORTED_MODULE_1__["getWrongToRight"])();
    // Populate tabs list with tabs
    Object(_wtinit__WEBPACK_IMPORTED_MODULE_2__["populateTabsList"])();
}

/* Add event listeners */

// Starting point
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", main);
} else {
    main();
}

document.addEventListener("mouseover", _event_listeners_document__WEBPACK_IMPORTED_MODULE_3__["documentMouseOver"]);
document.addEventListener("mouseup", _event_listeners_document__WEBPACK_IMPORTED_MODULE_3__["documentMouseUp"]);
document.addEventListener("click", _event_listeners_document__WEBPACK_IMPORTED_MODULE_3__["documentClicked"]);
document.addEventListener("dragover", _event_listeners_document__WEBPACK_IMPORTED_MODULE_3__["documentDragOver"]);

// Add keyup event listener and put focus on search
let search = document.getElementById("search");
search.addEventListener("keyup", _event_listeners_search__WEBPACK_IMPORTED_MODULE_5__["searchTextChanged"]);
search.focus();

// Add event listeners to all copy buttons
for (let copyBtn of document.getElementsByClassName("copy-button")) {
    copyBtn.addEventListener("click", e => {
        document.oncopy = ce => {
            ce.clipboardData.setData("text", document.getElementById(copyBtn.getAttribute("for")).innerText);
            ce.preventDefault();
        };
        document.execCommand("copy", false, null);
        copyBtn.innerText = "Copied!";
        setTimeout(() => {
            copyBtn.innerText = "Copy";
        }, 2000);
    });
}

_globals__WEBPACK_IMPORTED_MODULE_0__["default"].archive = document.getElementById("save-for-later");
_globals__WEBPACK_IMPORTED_MODULE_0__["default"].archive.addEventListener("dragover", _event_listeners_archive__WEBPACK_IMPORTED_MODULE_4__["archiveDragOverReceiver"]);
_globals__WEBPACK_IMPORTED_MODULE_0__["default"].archive.addEventListener("drop", _event_listeners_archive__WEBPACK_IMPORTED_MODULE_4__["archiveDropReceiver"]);

// Add event listener to listen for any messages from background.js
if (!browser.runtime.onMessage.hasListener(_event_listeners_message__WEBPACK_IMPORTED_MODULE_6__["onMessage"])) {
    browser.runtime.onMessage.addListener(_event_listeners_message__WEBPACK_IMPORTED_MODULE_6__["onMessage"]);
}


/***/ }),

/***/ "./src/popup/wrong-to-right.js":
/*!*************************************!*\
  !*** ./src/popup/wrong-to-right.js ***!
  \*************************************/
/*! exports provided: getWrongToRight, getCorrectTabId */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "getWrongToRight", function() { return getWrongToRight; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "getCorrectTabId", function() { return getCorrectTabId; });
/* harmony import */ var _messaging__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./messaging */ "./src/popup/messaging.js");


let wrongToRight;

function getWrongToRight() {
    return Object(_messaging__WEBPACK_IMPORTED_MODULE_0__["sendRuntimeMessage"])("WRONG_TO_RIGHT_GET", {}).then(response => {
        wrongToRight = response.wrongToRight;
    });
}

// Function to get correct tab id
function getCorrectTabId(tabId) {
    return wrongToRight[tabId] || tabId;
}


/***/ }),

/***/ "./src/popup/wtdom.js":
/*!****************************!*\
  !*** ./src/popup/wtdom.js ***!
  \****************************/
/*! exports provided: getTabByTabEntry, findTabEntryById, findCorrectTabEntryById, getFavIconFromTabEntry, findWindowEntryById, findTabEntryInWindow, getActiveTab, setActiveTab, removeTab, moveTab, moveTabs, attachTab, attachTabs, removeWindow, getWindowFromTab, tabDraggable, tabEntryIndex, multiSelect, multiSelectCancel, multiSelectReset, multiSelectToggle, resetSlideSelection */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "getTabByTabEntry", function() { return getTabByTabEntry; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "findTabEntryById", function() { return findTabEntryById; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "findCorrectTabEntryById", function() { return findCorrectTabEntryById; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "getFavIconFromTabEntry", function() { return getFavIconFromTabEntry; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "findWindowEntryById", function() { return findWindowEntryById; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "findTabEntryInWindow", function() { return findTabEntryInWindow; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "getActiveTab", function() { return getActiveTab; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "setActiveTab", function() { return setActiveTab; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "removeTab", function() { return removeTab; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "moveTab", function() { return moveTab; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "moveTabs", function() { return moveTabs; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "attachTab", function() { return attachTab; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "attachTabs", function() { return attachTabs; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "removeWindow", function() { return removeWindow; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "getWindowFromTab", function() { return getWindowFromTab; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "tabDraggable", function() { return tabDraggable; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "tabEntryIndex", function() { return tabEntryIndex; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "multiSelect", function() { return multiSelect; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "multiSelectCancel", function() { return multiSelectCancel; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "multiSelectReset", function() { return multiSelectReset; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "multiSelectToggle", function() { return multiSelectToggle; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "resetSlideSelection", function() { return resetSlideSelection; });
/* harmony import */ var _globals__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./globals */ "./src/popup/globals.js");
/* harmony import */ var _wrong_to_right__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./wrong-to-right */ "./src/popup/wrong-to-right.js");



function getTabByTabEntry(entry) {
    return browser.tabs.get(parseInt(entry.getAttribute("data-tab_id")));
}

// Find tab entry by tab id
function findTabEntryById(tabId) {
    return document.querySelector(".tab-entry[data-tab_id=\"" + tabId + "\"]");
}

// Find correct tab entry by tab id
function findCorrectTabEntryById(tabId) {
    return findTabEntryById(Object(_wrong_to_right__WEBPACK_IMPORTED_MODULE_1__["getCorrectTabId"])(tabId));
}

// Get favicon from a tab entry
function getFavIconFromTabEntry(entry) {
    return entry.getElementByClassName("tab-entry-favicon");
}

// Find window entry by tab id
function findWindowEntryById(windowId) {
    return _globals__WEBPACK_IMPORTED_MODULE_0__["default"].tabsList.querySelector("li[data-window_id=\"" + windowId + "\"]");
}

// Find tab entry inside a window entry
function findTabEntryInWindow(windowEntry, tabId) {
    return windowEntry.querySelector("li[data-tab_id=\"" + tabId + "\"]");
}

// Get active tab in the specified window
function getActiveTab(windowId) {
    let window = findWindowEntryById(windowId);
    return window.getElementByClassName("current-tab");
}

// Set active tab in the specified window
function setActiveTab(windowId, tabId) {
    let window = findWindowEntryById(windowId), lastActiveTab;
    if ((lastActiveTab = getActiveTab(windowId)) !== null) {
        lastActiveTab.classList.remove("current-tab");
    }
    findTabEntryInWindow(window, tabId).classList.add("current-tab");
}

// Remove tab
function removeTab(tabId, windowId) {
    let tabEntry = findTabEntryById(tabId);
    tabEntry.parentElement.removeChild(tabEntry);
    browser.tabs.query({
        active: true,
        windowId: windowId
    }).then(tabs => {
        findCorrectTabEntryById(tabs[0].id).classList.add("current-tab");
    });
}

/*
// Move tab
export function moveTab(tabId, windowId, toIndex) {
    let tab = findTabEntryById(tabId);
    let tabsListDOM = findWindowEntryById(windowId).getElementByClassName("window-entry-tabs");
    tabsListDOM.removeChild(tab);
    if (toIndex === -1) {
        tabsListDOM.appendChild(tab);
        return;
    }
    tabsListDOM.insertBefore(tab, tabsListDOM.childNodes[toIndex]);
}
*/

// Move tab
function moveTab(target, dest) {
    getWindowFromTab(dest).getElementByClassName("window-entry-tabs").insertBefore(target, dest);
}

// Move tabs
function moveTabs(targets, dest) {
    for (let i = 0; i < targets.length; i++) moveTab(targets[i], dest);
}

// Attach tab
function attachTab(target, dest) {
    dest.getElementByClassName("window-entry-tabs").appendChild(target);
}

// Attach tabs
function attachTabs(targets, dest) {
    for (let i = 0; i < targets.length; i++) attachTab(targets[i], dest);
}

/*
// Attach tab
export function attachTab(tabId, from, to, toIndex) {
    let tab = findTabEntryById(tabId);
    let oldTabsListDOM = findWindowEntryById(from).getElementByClassName("window-entry-tabs");
    let newTabsListDOM = findWindowEntryById(to).getElementByClassName("window-entry-tabs");
    oldTabsListDOM.removeChild(tab);
    if (toIndex === -1) {
        newTabsListDOM.appendChild(tab);
        return;
    }
    newTabsListDOM.insertBefore(tab, newTabsListDOM.childNodes[toIndex]);
}
*/

// Remove window
function removeWindow(windowId) {
    let windowEntry = findWindowEntryById(windowId);
    windowEntry.parentElement.removeChild(windowEntry);
    browser.windows.getCurrent({}).then(window => {
        findWindowEntryById(window.id).classList.add("current-window");
    });
}

function getWindowFromTab(tab) {
    return tab.parentElement.parentElement;
}

// Test if tab is draggable
function tabDraggable(sourceTab, targetTab, under, sourceWindow) {
    return sourceTab !== targetTab
            && ((!sourceTab.classList.contains("pinned-tab") && !targetTab.classList.contains("pinned-tab"))
            || (sourceTab.classList.contains("pinned-tab") && targetTab.classList.contains("pinned-tab"))
            || (under && !sourceTab.classList.contains("pinned-tab")))
            && ((!sourceWindow.classList.contains("incognito-window") && !getWindowFromTab(targetTab).classList.contains("incognito-window"))
            || (sourceWindow.classList.contains("incognito-window") && getWindowFromTab(targetTab).classList.contains("incognito-window")));
}

function tabEntryIndex(tabEntry) {
    let tabs = document.getElementsByClassName("tab-entry");
    for (let i = 0; i < tabs.length; i++) {
        if (tabs[i] === tabEntry) {
            return i;
        }
    }
    return -1;
}

/* Multiselect */
let selectedTabs = 0;
// Select
function multiSelect(element) {
    if (!element.classList.contains("multiselect")) {
        selectedTabs++;
        _globals__WEBPACK_IMPORTED_MODULE_0__["default"].isSelecting = true;
        element.classList.add("multiselect");
    }
}
// Cancel Selection
function multiSelectCancel(element) {
    if (element.classList.contains("multiselect")) {
        if (--selectedTabs == 0) {
            _globals__WEBPACK_IMPORTED_MODULE_0__["default"].isSelecting = false;
        }
        element.classList.remove("multiselect");
    }
}
// Reset multiselect
function multiSelectReset() {
    for (let element of Array.prototype.slice.call(document.getElementsByClassName("multiselect"))) {
        element.classList.remove("multiselect");
    }
    _globals__WEBPACK_IMPORTED_MODULE_0__["default"].isSelecting = false;
}
// Toggle Selection
function multiSelectToggle(element) {
    if (element.classList.contains("multiselect")) {
        multiSelectCancel(element);
    } else {
        multiSelect(element);
    }
}
// Reset slide selection
function resetSlideSelection() {
    _globals__WEBPACK_IMPORTED_MODULE_0__["default"].slideSelection.sliding = false;
    _globals__WEBPACK_IMPORTED_MODULE_0__["default"].slideSelection.initiator = undefined;
}


/***/ }),

/***/ "./src/popup/wtinit.js":
/*!*****************************!*\
  !*** ./src/popup/wtinit.js ***!
  \*****************************/
/*! exports provided: updateTabs, populateTabsList, extendTabsList */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "updateTabs", function() { return updateTabs; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "populateTabsList", function() { return populateTabsList; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "extendTabsList", function() { return extendTabsList; });
/* harmony import */ var _globals__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./globals */ "./src/popup/globals.js");
/* harmony import */ var _net__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./net */ "./src/popup/net.js");
/* harmony import */ var _wrong_to_right__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./wrong-to-right */ "./src/popup/wrong-to-right.js");
/* harmony import */ var _wtutils__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./wtutils */ "./src/popup/wtutils.js");
/* harmony import */ var _domutils__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./domutils */ "./src/popup/domutils.js");
/* harmony import */ var _event_listeners_archive__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./event-listeners/archive */ "./src/popup/event-listeners/archive.js");
/* harmony import */ var _event_listeners_windowEntryDrag__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./event-listeners/windowEntryDrag */ "./src/popup/event-listeners/windowEntryDrag.js");








// Update tabs
function updateTabs(windows) {
    _globals__WEBPACK_IMPORTED_MODULE_0__["default"].tabsList.innerHTML = "";
    let tabsListFragment = document.createDocumentFragment();
    let currentWindowEntry;
    /* Predefined elements for faster performance */
    // Window close button
    let WINDOW_CLOSE_BTN = document.createElement("span");
    WINDOW_CLOSE_BTN.classList.add("inline-button");
    WINDOW_CLOSE_BTN.classList.add("img-button");
    WINDOW_CLOSE_BTN.classList.add("opacity-changing-button");
    WINDOW_CLOSE_BTN.classList.add("window-entry-remove-btn");
    WINDOW_CLOSE_BTN.style.backgroundImage = "url(../icons/close.svg)";
    let DIV = document.createElement("div");
    DIV.style.display = "inline-block";
    WINDOW_CLOSE_BTN.appendChild(DIV);
    // Tab close button
    let TAB_CLOSE_BTN = document.createElement("span");
    TAB_CLOSE_BTN.classList.add("inline-button");
    TAB_CLOSE_BTN.classList.add("red-button");
    TAB_CLOSE_BTN.classList.add("img-button");
    TAB_CLOSE_BTN.classList.add("tab-entry-remove-btn");
    TAB_CLOSE_BTN.style.backgroundImage = "url(../icons/close.svg)";
    // Tab pin button
    let TAB_PIN_BTN = document.createElement("span");
    TAB_PIN_BTN.classList.add("inline-button");
    TAB_PIN_BTN.classList.add("img-button");
    TAB_PIN_BTN.classList.add("opacity-changing-button");
    TAB_PIN_BTN.classList.add("tab-entry-pin-btn");
    TAB_PIN_BTN.style.backgroundImage = "url(../icons/pin.svg)";
    // Loop through windows
    for (let i = 0; i < windows.length; i++) {
        // Set w to window
        let w = windows[i];

        // Create window entry
        let windowEntry = document.createElement("li");
        windowEntry.classList.add("window-entry");
        windowEntry.classList.add("category");

        // Create window entry fragment
        let windowEntryFragment = document.createDocumentFragment();

        // Set window id to window entry
        windowEntry.setAttribute("data-window_id", w.id);
        let span = document.createElement("span");

        // Create close button
        let closeBtn = WINDOW_CLOSE_BTN.cloneNode(true);

        // Buttons wrapper
        let buttons = document.createElement("span");
        buttons.classList.add("window-entry-buttons");
        buttons.appendChild(closeBtn);
        
        // Create window name span
        let windowName = document.createElement("span");
        windowName.classList.add("window-title");
        windowName.textContent += "Window " + (i+1);

        // Check if window is focused
        if (w.focused) {
            currentWindowEntry = windowEntry;
            windowEntry.classList.add("current-window");
            windowName.textContent += " - Current";
        }
        // Check if window is incognito
        if (w.incognito) {
            windowEntry.classList.add("incognito-window");
            windowName.textContent += " (Incognito)";
        }

        span.appendChild(windowName);
        span.appendChild(buttons);

        span.classList.add("darker-button");

        windowEntryFragment.appendChild(span);

        // Add window entry dragstart, dragover, and drop event listeners
        windowEntry.addEventListener("dragstart", _event_listeners_windowEntryDrag__WEBPACK_IMPORTED_MODULE_6__["windowEntryDragStarted"]);
        windowEntry.addEventListener("dragover", _event_listeners_windowEntryDrag__WEBPACK_IMPORTED_MODULE_6__["windowEntryDraggingOver"]);
        windowEntry.addEventListener("drop", _event_listeners_windowEntryDrag__WEBPACK_IMPORTED_MODULE_6__["windowEntryDropped"]);
        windowEntry.setAttribute("draggable", "true");

        // Add window button dragstart, dragover, and drop event listeners
        windowEntry.addEventListener("dragstart", _event_listeners_archive__WEBPACK_IMPORTED_MODULE_5__["archiveDragStartReceiver"]);

        let windowTabsList = document.createElement("ul");
        windowTabsList.classList.add("category-list");
        windowTabsList.classList.add("window-entry-tabs");

        let windowTabsListFragment = document.createDocumentFragment();
        // Loop through tabs
        for (let tab of w.tabs) {
            // Check tab id
            if (tab.id !== browser.tabs.TAB_ID_NONE) {
                // Create tab entry
                let tabEntry = document.createElement("li");
                tabEntry.classList.add("tab-entry");
                tabEntry.classList.add("button");
                // Set tab entry as draggable. Required to enable move tab feature
                tabEntry.setAttribute("draggable", "true");

                // Create tab entry fragment
                let tabEntryFragment = document.createDocumentFragment();

                let favicon;
                let title = document.createElement("span");
                title.classList.add("tab-title");
                title.textContent += tab.title;
                let titleWrapper = document.createElement("div");
                titleWrapper.classList.add("tab-title-wrapper");
                titleWrapper.appendChild(title);

                if (tab.active) {
                    tabEntry.classList.add("current-tab");
                }
                if (tab.favIconUrl) {
                    favicon = document.createElement("img");
                    favicon.classList.add("tab-entry-favicon");
                    let favIconPromise;
                    if (w.incognito) {
                        favIconPromise = Object(_net__WEBPACK_IMPORTED_MODULE_1__["getImage"])(tab.favIconUrl, true);
                    } else {
                        favIconPromise = Object(_net__WEBPACK_IMPORTED_MODULE_1__["getImage"])(tab.favIconUrl);
                    }
                    favIconPromise.then(base64Image => {
                        favicon.src = base64Image;
                    });
                }

                // Create close button
                let closeBtn = TAB_CLOSE_BTN.cloneNode(false);

                // Create pin button
                let pinBtn = TAB_PIN_BTN.cloneNode(false);

                // Buttons wrapper
                let buttons = document.createElement("span");
                buttons.classList.add("tab-entry-buttons");
                buttons.appendChild(pinBtn);
                buttons.appendChild(closeBtn);

                // Set tab entry tab id
                tabEntry.setAttribute("data-tab_id", Object(_wrong_to_right__WEBPACK_IMPORTED_MODULE_2__["getCorrectTabId"])(tab.id));
                if (favicon !== undefined) {
                    tabEntryFragment.appendChild(favicon);
                } else {
                    tabEntry.classList.add("noicon");
                }
                tabEntryFragment.appendChild(titleWrapper);
                tabEntryFragment.appendChild(buttons);
                
                tabEntry.appendChild(tabEntryFragment);

                if (tab.pinned) {
                    pinBtn.style.backgroundImage = "url(../icons/pinremove.svg)";
                    tabEntry.classList.add("pinned-tab");
                    let pinnedTabs = windowTabsList.getElementsByClassName("pinned-tab");
                    let lastPinnedTab = pinnedTabs[pinnedTabs.length-1];
                    if (lastPinnedTab !== undefined) {
                        windowTabsListFragment.insertBefore(tabEntry, lastPinnedTab.nextSibling);
                    } else {
                        windowTabsListFragment.insertBefore(tabEntry, windowTabsList.childNodes[0]);
                    }
                } else {
                    windowTabsListFragment.appendChild(tabEntry);
                }
            }
        }

        // Append fragment to actual windowTabsList
        windowTabsList.appendChild(windowTabsListFragment);

        windowEntryFragment.appendChild(windowTabsList);
        windowEntry.appendChild(windowEntryFragment);
        tabsListFragment.appendChild(windowEntry);
    }
    _globals__WEBPACK_IMPORTED_MODULE_0__["default"].tabsList.appendChild(tabsListFragment);
    document.getElementById("tabs").style.display = "block";
    currentWindowEntry.scrollIntoView({ behavior: 'smooth' });
}

// Add tabs to list
function populateTabsList() {
    Object(_wtutils__WEBPACK_IMPORTED_MODULE_3__["getWindows"])().then(windows => {
        updateTabs(windows);
    });
}

// Set tabs list height to any available height
function extendTabsList() {
    let searchArea = document.getElementById("search-area");
    let searchAreaHeight = Object(_domutils__WEBPACK_IMPORTED_MODULE_4__["getActualHeight"])(searchArea);
    let tabs = document.getElementById("tabs");
    tabs.style.height = "calc(100% - " + searchAreaHeight + "px)";
}


/***/ }),

/***/ "./src/popup/wtutils.js":
/*!******************************!*\
  !*** ./src/popup/wtutils.js ***!
  \******************************/
/*! exports provided: getWindows, getCurrentWindow */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "getWindows", function() { return getWindows; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "getCurrentWindow", function() { return getCurrentWindow; });
// Get all windows
function getWindows() {
    return browser.windows.getAll({
        populate: true,
        windowTypes: ["normal", "popup", "devtools"]
    });
}

// Get current window
function getCurrentWindow() {
    return browser.windows.getLastFocused({});
}


/***/ })

/******/ });
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vLy4vc3JjL3BvcHVwL2RvbXV0aWxzLmpzIiwid2VicGFjazovLy8uL3NyYy9wb3B1cC9ldmVudC1saXN0ZW5lcnMvYXJjaGl2ZS5qcyIsIndlYnBhY2s6Ly8vLi9zcmMvcG9wdXAvZXZlbnQtbGlzdGVuZXJzL2RvY3VtZW50LmpzIiwid2VicGFjazovLy8uL3NyYy9wb3B1cC9ldmVudC1saXN0ZW5lcnMvbWVzc2FnZS5qcyIsIndlYnBhY2s6Ly8vLi9zcmMvcG9wdXAvZXZlbnQtbGlzdGVuZXJzL3NlYXJjaC5qcyIsIndlYnBhY2s6Ly8vLi9zcmMvcG9wdXAvZXZlbnQtbGlzdGVuZXJzL3dpbmRvd0VudHJ5RHJhZy5qcyIsIndlYnBhY2s6Ly8vLi9zcmMvcG9wdXAvZ2xvYmFscy5qcyIsIndlYnBhY2s6Ly8vLi9zcmMvcG9wdXAva2V5dXRpbHMuanMiLCJ3ZWJwYWNrOi8vLy4vc3JjL3BvcHVwL21lc3NhZ2luZy5qcyIsIndlYnBhY2s6Ly8vLi9zcmMvcG9wdXAvbmV0LmpzIiwid2VicGFjazovLy8uL3NyYy9wb3B1cC9wb3B1cC5qcyIsIndlYnBhY2s6Ly8vLi9zcmMvcG9wdXAvd3JvbmctdG8tcmlnaHQuanMiLCJ3ZWJwYWNrOi8vLy4vc3JjL3BvcHVwL3d0ZG9tLmpzIiwid2VicGFjazovLy8uL3NyYy9wb3B1cC93dGluaXQuanMiLCJ3ZWJwYWNrOi8vLy4vc3JjL3BvcHVwL3d0dXRpbHMuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOzs7QUFHQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0Esa0RBQTBDLGdDQUFnQztBQUMxRTtBQUNBOztBQUVBO0FBQ0E7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QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSx5Q0FBeUMscURBQVE7QUFDakQscUJBQXFCO0FBQ3JCLHlDQUF5QyxxREFBUTtBQUNqRDtBQUNBO0FBQ0E7QUFDQSxxQkFBcUI7QUFDckI7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQSxxREFBcUQsdUVBQWU7QUFDcEU7QUFDQTtBQUNBLGlCQUFpQjtBQUNqQjtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHFCQUFxQjtBQUNyQjtBQUNBO0FBQ0EsaUJBQWlCO0FBQ2pCO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQSxJQUFJLGdEQUFDO0FBQ0w7QUFDQSx1Q0FBdUMscUJBQXFCO0FBQzVEOztBQUVBO0FBQ087QUFDUCxJQUFJLDJEQUFVO0FBQ2Q7QUFDQSxLQUFLO0FBQ0w7O0FBRUE7QUFDTztBQUNQO0FBQ0EsMkJBQTJCLGlFQUFlO0FBQzFDO0FBQ0E7QUFDQTs7Ozs7Ozs7Ozs7OztBQzdNQTtBQUFBO0FBQUE7QUFBQTtBQUNPO0FBQ1A7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMOztBQUVBO0FBQ087QUFDUCw0Q0FBNEM7QUFDNUMiLCJmaWxlIjoicG9wdXAvcG9wdXAuanMiLCJzb3VyY2VzQ29udGVudCI6WyIgXHQvLyBUaGUgbW9kdWxlIGNhY2hlXG4gXHR2YXIgaW5zdGFsbGVkTW9kdWxlcyA9IHt9O1xuXG4gXHQvLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuIFx0ZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXG4gXHRcdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuIFx0XHRpZihpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXSkge1xuIFx0XHRcdHJldHVybiBpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXS5leHBvcnRzO1xuIFx0XHR9XG4gXHRcdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG4gXHRcdHZhciBtb2R1bGUgPSBpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXSA9IHtcbiBcdFx0XHRpOiBtb2R1bGVJZCxcbiBcdFx0XHRsOiBmYWxzZSxcbiBcdFx0XHRleHBvcnRzOiB7fVxuIFx0XHR9O1xuXG4gXHRcdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuIFx0XHRtb2R1bGVzW21vZHVsZUlkXS5jYWxsKG1vZHVsZS5leHBvcnRzLCBtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuIFx0XHQvLyBGbGFnIHRoZSBtb2R1bGUgYXMgbG9hZGVkXG4gXHRcdG1vZHVsZS5sID0gdHJ1ZTtcblxuIFx0XHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuIFx0XHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG4gXHR9XG5cblxuIFx0Ly8gZXhwb3NlIHRoZSBtb2R1bGVzIG9iamVjdCAoX193ZWJwYWNrX21vZHVsZXNfXylcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubSA9IG1vZHVsZXM7XG5cbiBcdC8vIGV4cG9zZSB0aGUgbW9kdWxlIGNhY2hlXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLmMgPSBpbnN0YWxsZWRNb2R1bGVzO1xuXG4gXHQvLyBkZWZpbmUgZ2V0dGVyIGZ1bmN0aW9uIGZvciBoYXJtb255IGV4cG9ydHNcbiBcdF9fd2VicGFja19yZXF1aXJlX18uZCA9IGZ1bmN0aW9uKGV4cG9ydHMsIG5hbWUsIGdldHRlcikge1xuIFx0XHRpZighX193ZWJwYWNrX3JlcXVpcmVfXy5vKGV4cG9ydHMsIG5hbWUpKSB7XG4gXHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIG5hbWUsIHsgZW51bWVyYWJsZTogdHJ1ZSwgZ2V0OiBnZXR0ZXIgfSk7XG4gXHRcdH1cbiBcdH07XG5cbiBcdC8vIGRlZmluZSBfX2VzTW9kdWxlIG9uIGV4cG9ydHNcbiBcdF9fd2VicGFja19yZXF1aXJlX18uciA9IGZ1bmN0aW9uKGV4cG9ydHMpIHtcbiBcdFx0aWYodHlwZW9mIFN5bWJvbCAhPT0gJ3VuZGVmaW5lZCcgJiYgU3ltYm9sLnRvU3RyaW5nVGFnKSB7XG4gXHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFN5bWJvbC50b1N0cmluZ1RhZywgeyB2YWx1ZTogJ01vZHVsZScgfSk7XG4gXHRcdH1cbiBcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywgeyB2YWx1ZTogdHJ1ZSB9KTtcbiBcdH07XG5cbiBcdC8vIGNyZWF0ZSBhIGZha2UgbmFtZXNwYWNlIG9iamVjdFxuIFx0Ly8gbW9kZSAmIDE6IHZhbHVlIGlzIGEgbW9kdWxlIGlkLCByZXF1aXJlIGl0XG4gXHQvLyBtb2RlICYgMjogbWVyZ2UgYWxsIHByb3BlcnRpZXMgb2YgdmFsdWUgaW50byB0aGUgbnNcbiBcdC8vIG1vZGUgJiA0OiByZXR1cm4gdmFsdWUgd2hlbiBhbHJlYWR5IG5zIG9iamVjdFxuIFx0Ly8gbW9kZSAmIDh8MTogYmVoYXZlIGxpa2UgcmVxdWlyZVxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy50ID0gZnVuY3Rpb24odmFsdWUsIG1vZGUpIHtcbiBcdFx0aWYobW9kZSAmIDEpIHZhbHVlID0gX193ZWJwYWNrX3JlcXVpcmVfXyh2YWx1ZSk7XG4gXHRcdGlmKG1vZGUgJiA4KSByZXR1cm4gdmFsdWU7XG4gXHRcdGlmKChtb2RlICYgNCkgJiYgdHlwZW9mIHZhbHVlID09PSAnb2JqZWN0JyAmJiB2YWx1ZSAmJiB2YWx1ZS5fX2VzTW9kdWxlKSByZXR1cm4gdmFsdWU7XG4gXHRcdHZhciBucyA9IE9iamVjdC5jcmVhdGUobnVsbCk7XG4gXHRcdF9fd2VicGFja19yZXF1aXJlX18ucihucyk7XG4gXHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShucywgJ2RlZmF1bHQnLCB7IGVudW1lcmFibGU6IHRydWUsIHZhbHVlOiB2YWx1ZSB9KTtcbiBcdFx0aWYobW9kZSAmIDIgJiYgdHlwZW9mIHZhbHVlICE9ICdzdHJpbmcnKSBmb3IodmFyIGtleSBpbiB2YWx1ZSkgX193ZWJwYWNrX3JlcXVpcmVfXy5kKG5zLCBrZXksIGZ1bmN0aW9uKGtleSkgeyByZXR1cm4gdmFsdWVba2V5XTsgfS5iaW5kKG51bGwsIGtleSkpO1xuIFx0XHRyZXR1cm4gbnM7XG4gXHR9O1xuXG4gXHQvLyBnZXREZWZhdWx0RXhwb3J0IGZ1bmN0aW9uIGZvciBjb21wYXRpYmlsaXR5IHdpdGggbm9uLWhhcm1vbnkgbW9kdWxlc1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5uID0gZnVuY3Rpb24obW9kdWxlKSB7XG4gXHRcdHZhciBnZXR0ZXIgPSBtb2R1bGUgJiYgbW9kdWxlLl9fZXNNb2R1bGUgP1xuIFx0XHRcdGZ1bmN0aW9uIGdldERlZmF1bHQoKSB7IHJldHVybiBtb2R1bGVbJ2RlZmF1bHQnXTsgfSA6XG4gXHRcdFx0ZnVuY3Rpb24gZ2V0TW9kdWxlRXhwb3J0cygpIHsgcmV0dXJuIG1vZHVsZTsgfTtcbiBcdFx0X193ZWJwYWNrX3JlcXVpcmVfXy5kKGdldHRlciwgJ2EnLCBnZXR0ZXIpO1xuIFx0XHRyZXR1cm4gZ2V0dGVyO1xuIFx0fTtcblxuIFx0Ly8gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm8gPSBmdW5jdGlvbihvYmplY3QsIHByb3BlcnR5KSB7IHJldHVybiBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqZWN0LCBwcm9wZXJ0eSk7IH07XG5cbiBcdC8vIF9fd2VicGFja19wdWJsaWNfcGF0aF9fXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLnAgPSBcIlwiO1xuXG5cbiBcdC8vIExvYWQgZW50cnkgbW9kdWxlIGFuZCByZXR1cm4gZXhwb3J0c1xuIFx0cmV0dXJuIF9fd2VicGFja19yZXF1aXJlX18oX193ZWJwYWNrX3JlcXVpcmVfXy5zID0gXCIuL3NyYy9wb3B1cC9wb3B1cC5qc1wiKTtcbiIsIi8vIFRvZ2dsZSBhIGNsYXNzIG9mIGFuIGVsZW1lbnRcbmV4cG9ydCBmdW5jdGlvbiB0b2dnbGVDbGFzcyhlbGVtZW50LCBjKSB7XG4gICAgaWYgKGVsZW1lbnQuY2xhc3NMaXN0LmNvbnRhaW5zKGMpKSB7XG4gICAgICAgIGVsZW1lbnQuY2xhc3NMaXN0LnJlbW92ZShjKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICBlbGVtZW50LmNsYXNzTGlzdC5hZGQoYyk7XG4gICAgfVxufVxuXG4vLyBHZXQgYWN0dWFsIGhlaWdodCBvZiBhbiBlbGVtZW50XG5leHBvcnQgZnVuY3Rpb24gZ2V0QWN0dWFsSGVpZ2h0KGVsZW1lbnQpIHtcbiAgICB2YXIgc3R5bGVzID0gd2luZG93LmdldENvbXB1dGVkU3R5bGUoZWxlbWVudCk7XG4gICAgdmFyIG1hcmdpbiA9IHBhcnNlRmxvYXQoc3R5bGVzWydtYXJnaW5Ub3AnXSkgK1xuICAgICAgICAgICAgICAgcGFyc2VGbG9hdChzdHlsZXNbJ21hcmdpbkJvdHRvbSddKTtcbiAgICByZXR1cm4gZWxlbWVudC5vZmZzZXRIZWlnaHQgKyBtYXJnaW47XG59XG5cbi8vIGdldEVsZW1lbnRCeUNsYXNzTmFtZVxuRWxlbWVudC5wcm90b3R5cGUuZ2V0RWxlbWVudEJ5Q2xhc3NOYW1lID0gZnVuY3Rpb24gKGNsYXNzTmFtZXMpIHtcbiAgICByZXR1cm4gdGhpcy5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKGNsYXNzTmFtZXMpWzBdIHx8IG51bGw7XG59O1xuIiwiaW1wb3J0IEcgZnJvbSBcIi4uL2dsb2JhbHNcIlxuaW1wb3J0IHsgc2VuZFRhYk1lc3NhZ2UgfSBmcm9tIFwiLi4vbWVzc2FnaW5nXCJcbmltcG9ydCB7IGdldFRhYkJ5VGFiRW50cnkgfSBmcm9tIFwiLi4vd3Rkb21cIlxuXG5sZXQgYXJjaGl2ZVRhcmdldDtcblxuZXhwb3J0IGZ1bmN0aW9uIGFyY2hpdmVEcmFnU3RhcnRSZWNlaXZlcihlKSB7XG4gICAgYXJjaGl2ZVRhcmdldCA9IGUudGFyZ2V0O1xuICAgIGUuZGF0YVRyYW5zZmVyLmVmZmVjdEFsbG93ZWQgPSBcIm1vdmVcIjtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGFyY2hpdmVEcmFnT3ZlclJlY2VpdmVyKGUpIHtcbiAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICBlLmRhdGFUcmFuc2Zlci5kcm9wRWZmZWN0ID0gXCJtb3ZlXCI7XG4gICAgRy5hcmNoaXZlLmNsYXNzTGlzdC5hZGQoXCJzYXZpbmctZm9yLWxhdGVyXCIpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gYXJjaGl2ZURyb3BSZWNlaXZlcihlKSB7XG4gICAgaWYgKGFyY2hpdmVUYXJnZXQuY2xhc3NMaXN0LmNvbnRhaW5zKFwidGFiLWVudHJ5XCIpKSB7XG4gICAgICAgIGdldFRhYkJ5VGFiRW50cnkoYXJjaGl2ZVRhcmdldCkudGhlbih0YWIgPT4ge1xuICAgICAgICAgICAgc2VuZFRhYk1lc3NhZ2UocGFyc2VJbnQoYXJjaGl2ZVRhcmdldC5nZXRBdHRyaWJ1dGUoXCJkYXRhLXRhYl9pZFwiKSksIFwicGFja2RcIiwge1xuICAgICAgICAgICAgICAgIGFjdGlvbjogXCJwYWNrXCJcbiAgICAgICAgICAgIH0pLnRoZW4ocmVzcG9uc2UgPT4ge1xuICAgICAgICAgICAgICAgIGJyb3dzZXIuc3RvcmFnZS5zeW5jLmdldChbXCJhcmNoaXZlXCJdLCBkYXRhID0+IHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFkYXRhLmFyY2hpdmUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRhdGEuYXJjaGl2ZSA9IHt9O1xuICAgICAgICAgICAgICAgICAgICAgICAgZGF0YS5hcmNoaXZlLmRlZmF1bHQgPSBbXTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBsZXQgcmVwZWF0O1xuICAgICAgICAgICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGRhdGEuYXJjaGl2ZS5kZWZhdWx0Lmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoZGF0YS5hcmNoaXZlLmRlZmF1bHRbaV0udXJsID09PSB0YWIudXJsKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVwZWF0ID0gaTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBsZXQgc2Nyb2xsID0ge1xuICAgICAgICAgICAgICAgICAgICAgICAgdG9wOiByZXNwb25zZS50b3AsXG4gICAgICAgICAgICAgICAgICAgICAgICBsZWZ0OiByZXNwb25zZS5sZWZ0XG4gICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgICAgIHJlcGVhdCA9PT0gdW5kZWZpbmVkID8gZGF0YS5hcmNoaXZlLmRlZmF1bHQucHVzaCh7IHVybDogdGFiLnVybCwgc2Nyb2xsOiBzY3JvbGwgfSkgOiBkYXRhLmFyY2hpdmUuZGVmYXVsdFtyZXBlYXRdLnNjcm9sbCA9IHNjcm9sbDtcbiAgICAgICAgICAgICAgICAgICAgYnJvd3Nlci5zdG9yYWdlLnN5bmMuc2V0KHsgXCJhcmNoaXZlXCI6IGRhdGEuYXJjaGl2ZSB9KTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICB9XG59XG4iLCJpbXBvcnQgRyBmcm9tIFwiLi4vZ2xvYmFsc1wiXG5pbXBvcnQgeyBjdHJsT3JDbWQgfSBmcm9tIFwiLi4va2V5dXRpbHNcIlxuaW1wb3J0IHsgZ2V0Q3VycmVudFdpbmRvdyB9IGZyb20gXCIuLi93dHV0aWxzXCJcbmltcG9ydCB7IGdldFdpbmRvd0Zyb21UYWIsIG11bHRpU2VsZWN0LCBtdWx0aVNlbGVjdFRvZ2dsZSwgcmVzZXRTbGlkZVNlbGVjdGlvbiwgbXVsdGlTZWxlY3RSZXNldCB9IGZyb20gXCIuLi93dGRvbVwiXG5cbmV4cG9ydCBmdW5jdGlvbiBkb2N1bWVudE1vdXNlT3ZlcihlKSB7XG4gICAgaWYgKGUuYnV0dG9uID09PSAwKSB7XG4gICAgICAgIGlmIChlLnRhcmdldC5jbGFzc0xpc3QuY29udGFpbnMoXCJ0YWItZW50cnlcIikpIHtcbiAgICAgICAgICAgIGlmIChjdHJsT3JDbWQoKSAmJiBHLnNsaWRlU2VsZWN0aW9uLnNsaWRpbmcpIHtcbiAgICAgICAgICAgICAgICBtdWx0aVNlbGVjdChlLnRhcmdldCk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGxldCB0YWJJZCA9IHBhcnNlSW50KGUudGFyZ2V0LmdldEF0dHJpYnV0ZShcImRhdGEtdGFiX2lkXCIpKTtcbiAgICAgICAgICAgICAgICBicm93c2VyLnRhYnMuY2FwdHVyZVRhYih0YWJJZCkudGhlbihkYXRhVXJpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgbGV0IGRldGFpbHNJbWFnZSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiZGV0YWlscy1pbWdcIik7XG4gICAgICAgICAgICAgICAgICAgIGRldGFpbHNJbWFnZS5zcmMgPSBkYXRhVXJpO1xuICAgICAgICAgICAgICAgICAgICBsZXQgZGV0YWlsc1RpdGxlID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJkZXRhaWxzLXRpdGxlXCIpO1xuICAgICAgICAgICAgICAgICAgICBsZXQgZGV0YWlsc1VSTCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiZGV0YWlscy11cmxcIik7XG4gICAgICAgICAgICAgICAgICAgIGJyb3dzZXIudGFicy5nZXQodGFiSWQpLnRoZW4odGFiID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRldGFpbHNUaXRsZS50ZXh0Q29udGVudCA9IHRhYi50aXRsZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRldGFpbHNVUkwudGV4dENvbnRlbnQgPSB0YWIudXJsO1xuICAgICAgICAgICAgICAgICAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJkZXRhaWxzLXBsYWNlaG9sZGVyXCIpLnN0eWxlLmRpc3BsYXkgPSBcIm5vbmVcIjtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwidGFiLWRldGFpbHNcIikuc3R5bGUuZGlzcGxheSA9IFwiaW5saW5lLWJsb2NrXCI7XG4gICAgICAgICAgICAgICAgICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInRhYi1kZXRhaWxzXCIpLnNldEF0dHJpYnV0ZShcImRhdGEtdGFiX2lkXCIsIHRhYklkKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICh0YWIucGlubmVkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJkZXRhaWxzLXBpbm5lZFwiKS5zdHlsZS5kaXNwbGF5ID0gXCJpbmxpbmVcIjtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJkZXRhaWxzLXBpbm5lZFwiKS5zdHlsZS5kaXNwbGF5ID0gXCJub25lXCI7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAodGFiLmhpZGRlbikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiZGV0YWlscy1oaWRkZW5cIikuc3R5bGUuZGlzcGxheSA9IFwiaW5saW5lXCI7XG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiZGV0YWlscy1oaWRkZW5cIikuc3R5bGUuZGlzcGxheSA9IFwibm9uZVwiO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHRhYi5waW5uZWQgJiYgdGFiLmhpZGRlbikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiZGV0YWlscy1jb21tYVwiKS5zdHlsZS5kaXNwbGF5ID0gXCJpbmxpbmVcIjtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJkZXRhaWxzLWNvbW1hXCIpLnN0eWxlLmRpc3BsYXkgPSBcIm5vbmVcIjtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG4gICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZG9jdW1lbnRNb3VzZVVwKGUpIHtcbiAgICBpZiAoRy5zbGlkZVNlbGVjdGlvbi5zbGlkaW5nKSByZXNldFNsaWRlU2VsZWN0aW9uKCk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBkb2N1bWVudENsaWNrZWQoZSkge1xuICAgIGlmIChlLmJ1dHRvbiA9PT0gMCkge1xuICAgICAgICBpZiAoZS50YXJnZXQuY2xhc3NMaXN0LmNvbnRhaW5zKFwidGFiLWVudHJ5XCIpKSB7XG4gICAgICAgICAgICBpZiAoY3RybE9yQ21kKCkpIHtcbiAgICAgICAgICAgICAgICBtdWx0aVNlbGVjdFRvZ2dsZShlLnRhcmdldCk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGxldCB0YWJJZCA9IHBhcnNlSW50KGUudGFyZ2V0LmdldEF0dHJpYnV0ZShcImRhdGEtdGFiX2lkXCIpKTtcbiAgICAgICAgICAgICAgICBsZXQgcGFyZW50V2luZG93SWQgPSBwYXJzZUludChnZXRXaW5kb3dGcm9tVGFiKGUudGFyZ2V0KS5nZXRBdHRyaWJ1dGUoXCJkYXRhLXdpbmRvd19pZFwiKSk7XG4gICAgICAgICAgICAgICAgYnJvd3Nlci50YWJzLnVwZGF0ZSh0YWJJZCwge1xuICAgICAgICAgICAgICAgICAgICBhY3RpdmU6IHRydWVcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICBicm93c2VyLndpbmRvd3MuZ2V0KHBhcmVudFdpbmRvd0lkKS50aGVuKHcgPT4ge1xuICAgICAgICAgICAgICAgICAgICBnZXRDdXJyZW50V2luZG93KCkudGhlbihjdyA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAody5pZCAhPT0gY3cuaWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicm93c2VyLndpbmRvd3MudXBkYXRlKHcuaWQsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZm9jdXNlZDogdHJ1ZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgd2luZG93LmNsb3NlKCk7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2UgaWYgKGUudGFyZ2V0LnBhcmVudEVsZW1lbnQuY2xhc3NMaXN0LmNvbnRhaW5zKFwid2luZG93LWVudHJ5XCIpKSB7XG4gICAgICAgICAgICBsZXQgd2luZG93SWQgPSBwYXJzZUludChlLnRhcmdldC5wYXJlbnRFbGVtZW50LmdldEF0dHJpYnV0ZShcImRhdGEtd2luZG93X2lkXCIpKTtcbiAgICAgICAgICAgIGJyb3dzZXIud2luZG93cy51cGRhdGUod2luZG93SWQsIHtcbiAgICAgICAgICAgICAgICBmb2N1c2VkOiB0cnVlXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSBlbHNlIGlmIChlLnRhcmdldC5pZCA9PT0gXCJkZXRhaWxzLWNsb3NlXCIpIHtcbiAgICAgICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiZGV0YWlscy1wbGFjZWhvbGRlclwiKS5zdHlsZS5kaXNwbGF5ID0gXCJpbmxpbmUtYmxvY2tcIjtcbiAgICAgICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwidGFiLWRldGFpbHNcIikuc3R5bGUuZGlzcGxheSA9IFwibm9uZVwiO1xuICAgICAgICAgICAgYnJvd3Nlci50YWJzLnJlbW92ZShwYXJzZUludChkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInRhYi1kZXRhaWxzXCIpLmdldEF0dHJpYnV0ZShcImRhdGEtdGFiX2lkXCIpKSk7XG4gICAgICAgIH0gZWxzZSBpZiAoZS50YXJnZXQuY2xhc3NMaXN0LmNvbnRhaW5zKFwidGFiLWVudHJ5LXJlbW92ZS1idG5cIikpIHtcbiAgICAgICAgICAgIGxldCB0YWJJZCA9IGUudGFyZ2V0LnBhcmVudEVsZW1lbnQucGFyZW50RWxlbWVudC5nZXRBdHRyaWJ1dGUoXCJkYXRhLXRhYl9pZFwiKTtcbiAgICAgICAgICAgIGxldCB0YWJEZXRhaWxzID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJ0YWItZGV0YWlsc1wiKTtcbiAgICAgICAgICAgIGlmICh0YWJEZXRhaWxzLmdldEF0dHJpYnV0ZShcImRhdGEtdGFiX2lkXCIpID09PSB0YWJJZCkge1xuICAgICAgICAgICAgICAgIHRhYkRldGFpbHMuc3R5bGUuZGlzcGxheSA9IFwibm9uZVwiO1xuICAgICAgICAgICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiZGV0YWlscy1wbGFjZWhvbGRlclwiKS5zdHlsZS5kaXNwbGF5ID0gXCJpbmxpbmUtYmxvY2tcIjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGJyb3dzZXIudGFicy5yZW1vdmUocGFyc2VJbnQodGFiSWQpKTtcbiAgICAgICAgfSBlbHNlIGlmIChlLnRhcmdldC5jbGFzc0xpc3QuY29udGFpbnMoXCJ0YWItZW50cnktcGluLWJ0blwiKSkge1xuICAgICAgICAgICAgbGV0IHRhYklkID0gZS50YXJnZXQucGFyZW50RWxlbWVudC5wYXJlbnRFbGVtZW50LmdldEF0dHJpYnV0ZShcImRhdGEtdGFiX2lkXCIpO1xuICAgICAgICAgICAgYnJvd3Nlci50YWJzLmdldChwYXJzZUludCh0YWJJZCkpLnRoZW4odGFiID0+IHtcbiAgICAgICAgICAgICAgICBpZiAodGFiLnBpbm5lZCkge1xuICAgICAgICAgICAgICAgICAgICBicm93c2VyLnRhYnMudXBkYXRlKHBhcnNlSW50KHRhYklkKSwge1xuICAgICAgICAgICAgICAgICAgICAgICAgcGlubmVkOiBmYWxzZVxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBicm93c2VyLnRhYnMudXBkYXRlKHBhcnNlSW50KHRhYklkKSwge1xuICAgICAgICAgICAgICAgICAgICAgICAgcGlubmVkOiB0cnVlXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9IGVsc2UgaWYgKGUudGFyZ2V0LmNsYXNzTGlzdC5jb250YWlucyhcIndpbmRvdy1lbnRyeS1yZW1vdmUtYnRuXCIpKSB7XG4gICAgICAgICAgICBsZXQgd2luZG93SWQgPSBlLnRhcmdldC5wYXJlbnRFbGVtZW50LnBhcmVudEVsZW1lbnQucGFyZW50RWxlbWVudC5nZXRBdHRyaWJ1dGUoXCJkYXRhLXdpbmRvd19pZFwiKTtcbiAgICAgICAgICAgIGJyb3dzZXIud2luZG93cy5yZW1vdmUocGFyc2VJbnQod2luZG93SWQpKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGlmIChHLmlzU2VsZWN0aW5nKSBtdWx0aVNlbGVjdFJlc2V0KCk7XG4gICAgICAgIH1cbiAgICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBkb2N1bWVudERyYWdPdmVyKGUpIHtcbiAgICBpZiAoRy5hcmNoaXZlLmNsYXNzTGlzdC5jb250YWlucyhcInNhdmluZy1mb3ItbGF0ZXJcIikpIHtcbiAgICAgICAgRy5hcmNoaXZlLmNsYXNzTGlzdC5yZW1vdmUoXCJzYXZpbmctZm9yLWxhdGVyXCIpO1xuICAgIH1cbn1cbiIsImltcG9ydCBcIi4uL2RvbXV0aWxzXCJcbmltcG9ydCB7IGdldEltYWdlIH0gZnJvbSBcIi4uL25ldFwiXG5pbXBvcnQgeyBmaW5kVGFiRW50cnlCeUlkLCBnZXRGYXZJY29uRnJvbVRhYkVudHJ5LCBzZXRBY3RpdmVUYWIsIHJlbW92ZVRhYiwgcmVtb3ZlV2luZG93IH0gZnJvbSBcIi4uL3d0ZG9tXCJcblxuZXhwb3J0IGZ1bmN0aW9uIG9uTWVzc2FnZShyZXF1ZXN0LCBzZW5kZXIpIHtcbiAgICBzd2l0Y2ggKHJlcXVlc3QudHlwZSkge1xuICAgICAgICBjYXNlIFwiQUNUSVZFX1RBQl9DSEFOR0VEXCI6XG4gICAgICAgICAgICBzZXRBY3RpdmVUYWIocmVxdWVzdC5kZXRhaWxzLndpbmRvd0lkLCByZXF1ZXN0LmRldGFpbHMudGFiSWQpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgXCJUQUJfRkFWX0lDT05fQ0hBTkdFRFwiOlxuICAgICAgICAgICAgYnJvd3Nlci50YWJzLmdldChyZXF1ZXN0LmRldGFpbHMudGFiSWQpLnRoZW4odGFiID0+IHtcbiAgICAgICAgICAgICAgICBsZXQgZmF2SWNvblByb21pc2U7XG4gICAgICAgICAgICAgICAgaWYgKHRhYi5pbmNvZ25pdG8pIHtcbiAgICAgICAgICAgICAgICAgICAgZmF2SWNvblByb21pc2UgPSBnZXRJbWFnZShyZXF1ZXN0LmRldGFpbHMuZmF2SWNvblVybCwgdHJ1ZSk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgZmF2SWNvblByb21pc2UgPSBnZXRJbWFnZShyZXF1ZXN0LmRldGFpbHMuZmF2SWNvblVybCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGZhdkljb25Qcm9taXNlLnRoZW4oZnVuY3Rpb24gKGJhc2U2NEltYWdlKXtcbiAgICAgICAgICAgICAgICAgICAgZ2V0RmF2SWNvbkZyb21UYWJFbnRyeShmaW5kVGFiRW50cnlCeUlkKHJlcXVlc3QuZGV0YWlscy50YWJJZCkpLnNyYyA9IGJhc2U2NEltYWdlO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSBcIlRBQl9QSU5ORURfU1RBVFVTX0NIQU5HRURcIjpcbiAgICAgICAgICAgIGxldCB0YWJFbnRyeSA9IGZpbmRUYWJFbnRyeUJ5SWQocmVxdWVzdC5kZXRhaWxzLnRhYklkKTtcbiAgICAgICAgICAgIGxldCBwaW5CdG4gPSB0YWJFbnRyeS5nZXRFbGVtZW50QnlDbGFzc05hbWUoXCJ0YWItZW50cnktcGluLWJ0blwiKTtcbiAgICAgICAgICAgIGxldCB3aW5kb3dFbnRyeUxpc3QgPSB0YWJFbnRyeS5wYXJlbnRFbGVtZW50O1xuICAgICAgICAgICAgbGV0IHBpbm5lZFRhYnM7XG4gICAgICAgICAgICBpZiAocmVxdWVzdC5kZXRhaWxzLnBpbm5lZCkge1xuICAgICAgICAgICAgICAgIHBpbm5lZFRhYnMgPSB3aW5kb3dFbnRyeUxpc3QuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZShcInBpbm5lZC10YWJcIik7XG4gICAgICAgICAgICAgICAgdGFiRW50cnkuY2xhc3NMaXN0LmFkZChcInBpbm5lZC10YWJcIik7XG4gICAgICAgICAgICAgICAgcGluQnRuLnN0eWxlLmJhY2tncm91bmRJbWFnZSA9IFwidXJsKC4uL2ljb25zL3BpbnJlbW92ZS5zdmcpXCI7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHBpbm5lZFRhYnMgPSB3aW5kb3dFbnRyeUxpc3QuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZShcInBpbm5lZC10YWJcIik7XG4gICAgICAgICAgICAgICAgdGFiRW50cnkuY2xhc3NMaXN0LnJlbW92ZShcInBpbm5lZC10YWJcIik7XG4gICAgICAgICAgICAgICAgcGluQnRuLnN0eWxlLmJhY2tncm91bmRJbWFnZSA9IFwidXJsKC4uL2ljb25zL3Bpbi5zdmcpXCI7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBsZXQgbGFzdFBpbm5lZFRhYiA9IHBpbm5lZFRhYnNbcGlubmVkVGFicy5sZW5ndGgtMV07XG4gICAgICAgICAgICBpZiAobGFzdFBpbm5lZFRhYiAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgd2luZG93RW50cnlMaXN0Lmluc2VydEJlZm9yZSh0YWJFbnRyeSwgbGFzdFBpbm5lZFRhYi5uZXh0U2libGluZyk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHdpbmRvd0VudHJ5TGlzdC5pbnNlcnRCZWZvcmUodGFiRW50cnksIHdpbmRvd0VudHJ5TGlzdC5jaGlsZE5vZGVzWzBdKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIFwiVEFCX1RJVExFX0NIQU5HRURcIjpcbiAgICAgICAgICAgIGZpbmRUYWJFbnRyeUJ5SWQocmVxdWVzdC5kZXRhaWxzLnRhYklkKS5nZXRFbGVtZW50QnlDbGFzc05hbWUoXCJ0YWItdGl0bGVcIikudGV4dENvbnRlbnQgPSByZXF1ZXN0LmRldGFpbHMudGl0bGU7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSBcIlRBQl9SRU1PVkVEXCI6XG4gICAgICAgICAgICBpZiAoIXJlcXVlc3QuZGV0YWlscy53aW5kb3dDbG9zaW5nKSB7XG4gICAgICAgICAgICAgICAgcmVtb3ZlVGFiKHJlcXVlc3QuZGV0YWlscy50YWJJZCwgcmVxdWVzdC5kZXRhaWxzLndpbmRvd0lkKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIFwiV0lORE9XX1JFTU9WRURcIjpcbiAgICAgICAgICAgIHJlbW92ZVdpbmRvdyhyZXF1ZXN0LmRldGFpbHMud2luZG93SWQpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgfVxufVxuIiwiZnVuY3Rpb24ga2V5d29yZFNlYXJjaChzLCBrZXkpIHtcbiAgICBsZXQga2V5d29yZHMgPSBrZXkudHJpbSgpLnNwbGl0KFwiIFwiKSwgY291bnQgPSAwO1xuICAgIGZvciAobGV0IHdvcmQgb2Yga2V5d29yZHMpIHtcbiAgICAgICAgaWYgKHdvcmQudHJpbSgpICE9PSBcIlwiICYmIHdvcmQubWF0Y2goL15bYS16QS1aMC05XSskLykpIHtcbiAgICAgICAgICAgIGlmIChzLnRvVXBwZXJDYXNlKCkuaW5jbHVkZXMod29yZC50b1VwcGVyQ2FzZSgpKSkge1xuICAgICAgICAgICAgICAgIGNvdW50Kys7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGNvdW50ID49IDI7XG59XG5cbmZ1bmN0aW9uIHNlYXJjaChzLCBrZXkpIHtcbiAgICByZXR1cm4gcy50b1VwcGVyQ2FzZSgpLmluY2x1ZGVzKGtleS50b1VwcGVyQ2FzZSgpKSB8fCBrZXl3b3JkU2VhcmNoKHMsIGtleSk7XG59XG5cbi8vIFNlYXJjaFxuZXhwb3J0IGZ1bmN0aW9uIHNlYXJjaFRleHRDaGFuZ2VkKGUpIHtcbiAgICBsZXQgaW5wdXQsIGZpbHRlciwgdGFiRW50cmllcztcbiAgICBpbnB1dCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwic2VhcmNoXCIpO1xuICAgIGZpbHRlciA9IGlucHV0LnZhbHVlO1xuICAgIHRhYkVudHJpZXMgPSBkb2N1bWVudC5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKFwidGFiLWVudHJ5XCIpO1xuICAgIGlmIChmaWx0ZXIgIT09IFwiXCIpIHtcbiAgICAgICAgZm9yIChsZXQgdGFiRW50cnkgb2YgdGFiRW50cmllcykge1xuICAgICAgICAgICAgaWYgKCFzZWFyY2godGFiRW50cnkuZ2V0RWxlbWVudEJ5Q2xhc3NOYW1lKFwidGFiLXRpdGxlXCIpLmlubmVyVGV4dCwgZmlsdGVyKSkge1xuICAgICAgICAgICAgICAgIHRhYkVudHJ5LnN0eWxlLmRpc3BsYXkgPSBcIm5vbmVcIjtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGFiRW50cnkuc3R5bGUuZGlzcGxheSA9IFwiZmxleFwiO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgICAgZm9yIChsZXQgdGFiRW50cnkgb2YgdGFiRW50cmllcykge1xuICAgICAgICAgICAgdGFiRW50cnkuc3R5bGUuZGlzcGxheSA9IFwiZmxleFwiO1xuICAgICAgICB9XG4gICAgfVxufVxuIiwiaW1wb3J0IEcgZnJvbSBcIi4uL2dsb2JhbHNcIlxuaW1wb3J0IHsgY3RybE9yQ21kIH0gZnJvbSBcIi4uL2tleXV0aWxzXCJcbmltcG9ydCB7IG1vdmVUYWIsIGF0dGFjaFRhYiwgZ2V0V2luZG93RnJvbVRhYiwgdGFiRHJhZ2dhYmxlLCBtdWx0aVNlbGVjdCwgZmluZFRhYkVudHJ5QnlJZCB9IGZyb20gXCIuLi93dGRvbVwiXG5cbmxldCBzb3VyY2VUYWIsIHRhcmdldFRhYiwgdW5kZXIsIHNvdXJjZVdpbmRvdywgc291cmNlV2luZG93SWQ7XG5cbmV4cG9ydCBmdW5jdGlvbiB3aW5kb3dFbnRyeURyYWdTdGFydGVkKGUpIHtcbiAgICBpZiAoZS50YXJnZXQuY2xhc3NMaXN0LmNvbnRhaW5zKFwidGFiLWVudHJ5XCIpKSB7XG4gICAgICAgIGlmIChjdHJsT3JDbWQoKSkge1xuICAgICAgICAgICAgbXVsdGlTZWxlY3QoZS50YXJnZXQpO1xuICAgICAgICAgICAgRy5zbGlkZVNlbGVjdGlvbi5zbGlkaW5nID0gdHJ1ZTtcbiAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHNvdXJjZVRhYiA9IGUudGFyZ2V0O1xuICAgICAgICAgICAgc291cmNlV2luZG93ID0gZ2V0V2luZG93RnJvbVRhYihzb3VyY2VUYWIpO1xuICAgICAgICAgICAgc291cmNlV2luZG93SWQgPSBwYXJzZUludChzb3VyY2VXaW5kb3cuZ2V0QXR0cmlidXRlKFwiZGF0YS13aW5kb3dfaWRcIikpO1xuICAgICAgICAgICAgZS5kYXRhVHJhbnNmZXIuZWZmZWN0QWxsb3dlZCA9IFwibW92ZVwiO1xuICAgICAgICB9XG4gICAgICAgIGUuZGF0YVRyYW5zZmVyLnNldERhdGEoJ3RleHQvcGxhaW4nLCBudWxsKTtcbiAgICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiB3aW5kb3dFbnRyeURyYWdnaW5nT3ZlcihlKSB7XG4gICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgIGxldCBjdXJzb3JzID0gRy50YWJzTGlzdC5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKFwiaW5zZXJ0LWN1cnNvclwiKTtcbiAgICBmb3IgKGxldCBjIG9mIGN1cnNvcnMpIHtcbiAgICAgICAgYy5wYXJlbnRFbGVtZW50LnJlbW92ZUNoaWxkKGMpO1xuICAgIH1cbiAgICBsZXQgY3Vyc29yV2luZG93ID0gRy50YWJzTGlzdC5nZXRFbGVtZW50QnlDbGFzc05hbWUoXCJpbnNlcnQtY3Vyc29yLXdpbmRvd1wiKTtcbiAgICBpZiAoY3Vyc29yV2luZG93ICE9PSBudWxsKSB7XG4gICAgICAgIGN1cnNvcldpbmRvdy5jbGFzc0xpc3QucmVtb3ZlKFwiaW5zZXJ0LWN1cnNvci13aW5kb3dcIik7XG4gICAgfVxuXG4gICAgbGV0IHdpbmRvd0VudHJ5O1xuICAgIGlmIChlLnRhcmdldC5jbGFzc0xpc3QuY29udGFpbnMoXCJ0YWItZW50cnlcIikpIHtcbiAgICAgICAgbGV0IHRhYkVudHJ5Qm91bmRpbmdDbGllbnRSZWN0ID0gZS50YXJnZXQuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gICAgICAgIHRhcmdldFRhYiA9IGUudGFyZ2V0O1xuICAgICAgICB1bmRlciA9IGZhbHNlO1xuICAgICAgICBpZiAoKGUuY2xpZW50WSAtIHRhYkVudHJ5Qm91bmRpbmdDbGllbnRSZWN0LnRvcCkgPj0gdGFiRW50cnlCb3VuZGluZ0NsaWVudFJlY3QuaGVpZ2h0IC8gMikge1xuICAgICAgICAgICAgdGFyZ2V0VGFiID0gdGFyZ2V0VGFiLm5leHRTaWJsaW5nO1xuICAgICAgICAgICAgaWYgKHRhcmdldFRhYiA9PT0gbnVsbCkge1xuICAgICAgICAgICAgICAgIHVuZGVyID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICB0YXJnZXRUYWIgPSBlLnRhcmdldDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBpZiAodGFiRHJhZ2dhYmxlKHNvdXJjZVRhYiwgdGFyZ2V0VGFiLCB1bmRlciwgc291cmNlV2luZG93KSkge1xuICAgICAgICAgICAgbGV0IGN1cnNvciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XG4gICAgICAgICAgICBjdXJzb3IuY2xhc3NMaXN0LmFkZChcImluc2VydC1jdXJzb3JcIik7XG4gICAgICAgICAgICBpZiAodW5kZXIpIHtcbiAgICAgICAgICAgICAgICB0YXJnZXRUYWIucGFyZW50RWxlbWVudC5hcHBlbmRDaGlsZChjdXJzb3IpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0YXJnZXRUYWIucGFyZW50RWxlbWVudC5pbnNlcnRCZWZvcmUoY3Vyc29yLCB0YXJnZXRUYWIpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSBlbHNlIGlmICgod2luZG93RW50cnkgPSBlLnRhcmdldC5wYXJlbnRFbGVtZW50KSAhPT0gbnVsbCkge1xuICAgICAgICBpZiAod2luZG93RW50cnkuY2xhc3NMaXN0LmNvbnRhaW5zKFwid2luZG93LWVudHJ5XCIpXG4gICAgICAgICAgICAmJiBzb3VyY2VXaW5kb3cgIT09IHdpbmRvd0VudHJ5XG4gICAgICAgICAgICAmJiAhc291cmNlVGFiLmNsYXNzTGlzdC5jb250YWlucyhcInBpbm5lZC10YWJcIilcbiAgICAgICAgICAgICYmICgoIXNvdXJjZVdpbmRvdy5jbGFzc0xpc3QuY29udGFpbnMoXCJpbmNvZ25pdG8td2luZG93XCIpICYmICF3aW5kb3dFbnRyeS5jbGFzc0xpc3QuY29udGFpbnMoXCJpbmNvZ25pdG8td2luZG93XCIpKVxuICAgICAgICAgICAgfHwgKHNvdXJjZVdpbmRvdy5jbGFzc0xpc3QuY29udGFpbnMoXCJpbmNvZ25pdG8td2luZG93XCIpICYmIHdpbmRvd0VudHJ5LmNsYXNzTGlzdC5jb250YWlucyhcImluY29nbml0by13aW5kb3dcIikpKSkge1xuICAgICAgICAgICAgZS50YXJnZXQuY2xhc3NMaXN0LmFkZChcImluc2VydC1jdXJzb3Itd2luZG93XCIpO1xuICAgICAgICB9XG4gICAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gd2luZG93RW50cnlEcm9wcGVkKGUpIHtcbiAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICBsZXQgY3Vyc29ycyA9IEcudGFic0xpc3QuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZShcImluc2VydC1jdXJzb3JcIik7XG4gICAgZm9yIChsZXQgY3Vyc29yIG9mIGN1cnNvcnMpIHtcbiAgICAgICAgY3Vyc29yLnBhcmVudEVsZW1lbnQucmVtb3ZlQ2hpbGQoY3Vyc29yKTtcbiAgICB9XG4gICAgbGV0IGN1cnNvcldpbmRvdyA9IEcudGFic0xpc3QuZ2V0RWxlbWVudEJ5Q2xhc3NOYW1lKFwiaW5zZXJ0LWN1cnNvci13aW5kb3dcIik7XG4gICAgaWYgKGN1cnNvcldpbmRvdyAhPT0gbnVsbCkge1xuICAgICAgICBjdXJzb3JXaW5kb3cuY2xhc3NMaXN0LnJlbW92ZShcImluc2VydC1jdXJzb3Itd2luZG93XCIpO1xuICAgIH1cbiAgICBcbiAgICBsZXQgd2luZG93RW50cnk7XG4gICAgaWYgKGUudGFyZ2V0LmNsYXNzTGlzdC5jb250YWlucyhcInRhYi1lbnRyeVwiKSkge1xuICAgICAgICBpZiAoIWUudGFyZ2V0LmlzU2FtZU5vZGUodGFyZ2V0VGFiKSkge1xuICAgICAgICAgICAgbGV0IHRhYkVudHJ5Qm91bmRpbmdDbGllbnRSZWN0ID0gZS50YXJnZXQuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gICAgICAgICAgICB0YXJnZXRUYWIgPSBlLnRhcmdldDtcbiAgICAgICAgICAgIHVuZGVyID0gZmFsc2U7XG4gICAgICAgICAgICBpZiAoKGUuY2xpZW50WSAtIHRhYkVudHJ5Qm91bmRpbmdDbGllbnRSZWN0LnRvcCkgPj0gdGFiRW50cnlCb3VuZGluZ0NsaWVudFJlY3QuaGVpZ2h0IC8gMikge1xuICAgICAgICAgICAgICAgIHRhcmdldFRhYiA9IHRhcmdldFRhYi5uZXh0U2libGluZztcbiAgICAgICAgICAgICAgICBpZiAodGFyZ2V0VGFiID09PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgICAgIHVuZGVyID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgdGFyZ2V0VGFiID0gZS50YXJnZXQ7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGlmICh0YWJEcmFnZ2FibGUoc291cmNlVGFiLCB0YXJnZXRUYWIsIHVuZGVyLCBzb3VyY2VXaW5kb3cpKSB7XG4gICAgICAgICAgICBsZXQgZGVzdGluYXRpb25XaW5kb3dJZCA9IHBhcnNlSW50KGdldFdpbmRvd0Zyb21UYWIodGFyZ2V0VGFiKS5nZXRBdHRyaWJ1dGUoXCJkYXRhLXdpbmRvd19pZFwiKSk7XG4gICAgICAgICAgICBsZXQgc291cmNlVGFiSW5kZXggPSBBcnJheS5wcm90b3R5cGUuaW5kZXhPZi5jYWxsKHRhcmdldFRhYi5wYXJlbnRFbGVtZW50LmNoaWxkTm9kZXMsIHNvdXJjZVRhYik7XG4gICAgICAgICAgICBsZXQgZGVzdGluYXRpb25JbmRleCA9IEFycmF5LnByb3RvdHlwZS5pbmRleE9mLmNhbGwodGFyZ2V0VGFiLnBhcmVudEVsZW1lbnQuY2hpbGROb2RlcywgdGFyZ2V0VGFiKTtcbiAgICAgICAgICAgIGxldCBtb3ZlSW5kZXggPSB1bmRlciA/IC0xIDogKChzb3VyY2VUYWJJbmRleCAhPT0gLTEgJiYgZGVzdGluYXRpb25JbmRleCA+IHNvdXJjZVRhYkluZGV4ICYmIGRlc3RpbmF0aW9uV2luZG93SWQgPT09IHNvdXJjZVdpbmRvd0lkKSA/IGRlc3RpbmF0aW9uSW5kZXgtMSA6IGRlc3RpbmF0aW9uSW5kZXgpO1xuICAgICAgICAgICAgbGV0IHNvdXJjZVRhYklkID0gcGFyc2VJbnQoc291cmNlVGFiLmdldEF0dHJpYnV0ZShcImRhdGEtdGFiX2lkXCIpKTtcbiAgICAgICAgICAgIGJyb3dzZXIudGFicy5tb3ZlKHNvdXJjZVRhYklkLCB7XG4gICAgICAgICAgICAgICAgd2luZG93SWQ6IGRlc3RpbmF0aW9uV2luZG93SWQsXG4gICAgICAgICAgICAgICAgaW5kZXg6IG1vdmVJbmRleFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBpZiAodW5kZXIpIHtcbiAgICAgICAgICAgICAgICBhdHRhY2hUYWIoc291cmNlVGFiLCBnZXRXaW5kb3dGcm9tVGFiKHRhcmdldFRhYikpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBtb3ZlVGFiKHNvdXJjZVRhYiwgdGFyZ2V0VGFiKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0gZWxzZSBpZiAoKHdpbmRvd0VudHJ5ID0gZS50YXJnZXQucGFyZW50RWxlbWVudCkgIT09IG51bGwpIHtcbiAgICAgICAgaWYgKHdpbmRvd0VudHJ5LmNsYXNzTGlzdC5jb250YWlucyhcIndpbmRvdy1lbnRyeVwiKVxuICAgICAgICAgICAgJiYgc291cmNlV2luZG93ICE9PSB3aW5kb3dFbnRyeVxuICAgICAgICAgICAgJiYgIXNvdXJjZVRhYi5jbGFzc0xpc3QuY29udGFpbnMoXCJwaW5uZWQtdGFiXCIpXG4gICAgICAgICAgICAmJiAoKCFzb3VyY2VXaW5kb3cuY2xhc3NMaXN0LmNvbnRhaW5zKFwiaW5jb2duaXRvLXdpbmRvd1wiKSAmJiAhd2luZG93RW50cnkuY2xhc3NMaXN0LmNvbnRhaW5zKFwiaW5jb2duaXRvLXdpbmRvd1wiKSlcbiAgICAgICAgICAgIHx8IChzb3VyY2VXaW5kb3cuY2xhc3NMaXN0LmNvbnRhaW5zKFwiaW5jb2duaXRvLXdpbmRvd1wiKSAmJiB3aW5kb3dFbnRyeS5jbGFzc0xpc3QuY29udGFpbnMoXCJpbmNvZ25pdG8td2luZG93XCIpKSkpIHtcbiAgICAgICAgICAgIGxldCBzb3VyY2VUYWJJZCA9IHBhcnNlSW50KHNvdXJjZVRhYi5nZXRBdHRyaWJ1dGUoXCJkYXRhLXRhYl9pZFwiKSk7XG4gICAgICAgICAgICBsZXQgZGVzdGluYXRpb25XaW5kb3dJZCA9IHBhcnNlSW50KHdpbmRvd0VudHJ5LmdldEF0dHJpYnV0ZShcImRhdGEtd2luZG93X2lkXCIpKTtcbiAgICAgICAgICAgIGJyb3dzZXIudGFicy5tb3ZlKHNvdXJjZVRhYklkLCB7XG4gICAgICAgICAgICAgICAgd2luZG93SWQ6IGRlc3RpbmF0aW9uV2luZG93SWQsXG4gICAgICAgICAgICAgICAgaW5kZXg6IC0xXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGF0dGFjaFRhYihzb3VyY2VUYWIsIHdpbmRvd0VudHJ5KTtcbiAgICAgICAgfVxuICAgIH1cbn1cbiIsImNvbnN0IGdsb2JhbHMgPSB7XG4gICAgdGFic0xpc3Q6IHVuZGVmaW5lZCxcbiAgICBhcmNoaXZlOiB1bmRlZmluZWQsXG4gICAgaXNTZWxlY3Rpbmc6IGZhbHNlLFxuICAgIHNsaWRlU2VsZWN0aW9uOiB7XG4gICAgICAgIHNsaWRpbmc6IGZhbHNlLFxuICAgICAgICBpbml0aWF0b3I6IHVuZGVmaW5lZCxcbiAgICAgICAgdmVjdG9yOiAwXG4gICAgfVxufTtcbmV4cG9ydCBkZWZhdWx0IGdsb2JhbHM7XG4iLCJsZXQga2V5UHJlc3NlZCA9IHt9O1xub25rZXlkb3duID0gb25rZXl1cCA9IGUgPT4ge1xuICAgIGUgPSBlIHx8IGV2ZW50O1xuICAgIGtleVByZXNzZWRbZS5jb2RlXSA9IGUudHlwZSA9PSBcImtleWRvd25cIjtcbn07XG5cbi8vIENoZWNrcyBpZiBlaXRoZXIgQ3RybChXaW5kb3dzICYgTGludXgpIG9yIENvbW1hbmQoTWFjKSBpcyBwcmVzc2VkXG5leHBvcnQgZnVuY3Rpb24gY3RybE9yQ21kKCkge1xuICAgIGlmICh3aW5kb3cubmF2aWdhdG9yLnBsYXRmb3JtLnRvVXBwZXJDYXNlKCkuaW5kZXhPZihcIk1BQ1wiKSA+PSAwKSB7XG4gICAgICAgIHJldHVybiBrZXlQcmVzc2VkW1wiT1NSaWdodFwiXSB8fCBrZXlQcmVzc2VkW1wiT1NMZWZ0XCJdO1xuICAgIH1cbiAgICByZXR1cm4ga2V5UHJlc3NlZFtcIkNvbnRyb2xMZWZ0XCJdIHx8IGtleVByZXNzZWRbXCJDb250cm9sUmlnaHRcIl07XG59XG4iLCIvLyBGdW5jdGlvbiB0byBzZW5kIGEgbWVzc2FnZSB0byB0aGUgcnVudGltZVxuZXhwb3J0IGZ1bmN0aW9uIHNlbmRSdW50aW1lTWVzc2FnZSh0eXBlLCBkYXRhKSB7XG4gICAgcmV0dXJuIGJyb3dzZXIucnVudGltZS5zZW5kTWVzc2FnZSh7XG4gICAgICAgIHR5cGU6IHR5cGUsXG4gICAgICAgIGRhdGE6IGRhdGFcbiAgICB9KTtcbn1cblxuLy8gRnVuY3Rpb24gdG8gc2VuZCBhIG1lc3NhZ2UgdG8gYSB0YWJcbmV4cG9ydCBmdW5jdGlvbiBzZW5kVGFiTWVzc2FnZSh0YWJJZCwgdGFyZ2V0LCBkYXRhKSB7XG4gICAgcmV0dXJuIGJyb3dzZXIudGFicy5zZW5kTWVzc2FnZSh0YWJJZCwge1xuICAgICAgICB0YXJnZXQ6IHRhcmdldCxcbiAgICAgICAgZGF0YTogZGF0YVxuICAgIH0pO1xufVxuIiwiLy8gRnVuY3Rpb24gdG8gZ2V0IGltYWdlIGZyb20gVVJMXG5leHBvcnQgZnVuY3Rpb24gZ2V0SW1hZ2UodXJsLCBub0NhY2hlPWZhbHNlKSB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGlmICghdXJsLnN0YXJ0c1dpdGgoXCJjaHJvbWU6Ly9cIikpIHtcbiAgICAgICAgICAgICAgICBsZXQgeGhyID0gbmV3IFhNTEh0dHBSZXF1ZXN0KCk7XG4gICAgICAgICAgICAgICAgeGhyLm9ucmVhZHlzdGF0ZWNoYW5nZSA9IGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLnJlYWR5U3RhdGUgPT0gNCAmJiB0aGlzLnN0YXR1cyA9PSAyMDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBjb250ZW50VHlwZSA9IHhoci5nZXRSZXNwb25zZUhlYWRlcihcIkNvbnRlbnQtVHlwZVwiKS50cmltKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoY29udGVudFR5cGUuc3RhcnRzV2l0aChcImltYWdlL1wiKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxldCBmbGFnID0gXCJkYXRhOlwiICsgY29udGVudFR5cGUgKyBcIjtjaGFyc2V0PXV0Zi04O2Jhc2U2NCxcIjtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsZXQgaW1hZ2VTdHIgPSBhcnJheUJ1ZmZlclRvQmFzZTY0KHhoci5yZXNwb25zZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZShmbGFnICsgaW1hZ2VTdHIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZWplY3QoXCJJbWFnZSBSZXF1ZXN0IEZhaWxlZDogQ29udGVudC1UeXBlIGlzIG5vdCBhbiBpbWFnZSEgKENvbnRlbnQtVHlwZTogXFxcIlwiICsgY29udGVudFR5cGUgKyBcIlxcXCIpXCIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICB4aHIucmVzcG9uc2VUeXBlID0gXCJhcnJheWJ1ZmZlclwiO1xuICAgICAgICAgICAgICAgIHhoci5vcGVuKFwiR0VUXCIsIHVybCwgdHJ1ZSk7XG4gICAgICAgICAgICAgICAgaWYgKG5vQ2FjaGUpIHsgeGhyLnNldFJlcXVlc3RIZWFkZXIoXCJDYWNoZS1Db250cm9sXCIsIFwibm8tc3RvcmVcIik7IH1cbiAgICAgICAgICAgICAgICB4aHIuc2VuZCgpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICByZXNvbHZlKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgcmVqZWN0KGVyci5tZXNzYWdlKTtcbiAgICAgICAgfVxuICAgIH0pO1xufVxuXG4vLyBGdW5jdGlvbiB0byB0cmFuc2Zvcm0gQXJyYXlCdWZmZXIgaW50byBhIEJhc2U2NCBTdHJpbmdcbmV4cG9ydCBmdW5jdGlvbiBhcnJheUJ1ZmZlclRvQmFzZTY0KGJ1ZmZlcikge1xuICAgIGxldCBiaW5hcnkgPSBcIlwiO1xuICAgIGxldCBieXRlcyA9IFtdLnNsaWNlLmNhbGwobmV3IFVpbnQ4QXJyYXkoYnVmZmVyKSk7XG4gICAgYnl0ZXMuZm9yRWFjaCgoYikgPT4gYmluYXJ5ICs9IFN0cmluZy5mcm9tQ2hhckNvZGUoYikpO1xuICAgIHJldHVybiB3aW5kb3cuYnRvYShiaW5hcnkpO1xufVxuIiwiaW1wb3J0IEcgZnJvbSBcIi4vZ2xvYmFsc1wiXG5pbXBvcnQgeyBnZXRXcm9uZ1RvUmlnaHQgfSBmcm9tIFwiLi93cm9uZy10by1yaWdodFwiXG5pbXBvcnQgeyBwb3B1bGF0ZVRhYnNMaXN0LCBleHRlbmRUYWJzTGlzdCB9IGZyb20gXCIuL3d0aW5pdFwiXG5pbXBvcnQgeyBkb2N1bWVudE1vdXNlT3ZlciwgZG9jdW1lbnRNb3VzZVVwLCBkb2N1bWVudENsaWNrZWQsIGRvY3VtZW50RHJhZ092ZXIgfSBmcm9tIFwiLi9ldmVudC1saXN0ZW5lcnMvZG9jdW1lbnRcIlxuaW1wb3J0IHsgYXJjaGl2ZURyYWdPdmVyUmVjZWl2ZXIsIGFyY2hpdmVEcm9wUmVjZWl2ZXIgfSBmcm9tIFwiLi9ldmVudC1saXN0ZW5lcnMvYXJjaGl2ZVwiXG5pbXBvcnQgeyBzZWFyY2hUZXh0Q2hhbmdlZCB9IGZyb20gXCIuL2V2ZW50LWxpc3RlbmVycy9zZWFyY2hcIlxuaW1wb3J0IHsgb25NZXNzYWdlIH0gZnJvbSBcIi4vZXZlbnQtbGlzdGVuZXJzL21lc3NhZ2VcIlxuXG5HLnRhYnNMaXN0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJ0YWJzLWxpc3RcIik7XG5cbmFzeW5jIGZ1bmN0aW9uIG1haW4oKSB7XG4gICAgLy8gTWFrZSB0YWJzIGxpc3QgZml0IHRoZSBwYW5lbFxuICAgIGV4dGVuZFRhYnNMaXN0KCk7XG4gICAgLy8gRml4IGZvciBjcm9zcy13aW5kb3cgZHJhZ2dpbmcgaXNzdWVcbiAgICBhd2FpdCBnZXRXcm9uZ1RvUmlnaHQoKTtcbiAgICAvLyBQb3B1bGF0ZSB0YWJzIGxpc3Qgd2l0aCB0YWJzXG4gICAgcG9wdWxhdGVUYWJzTGlzdCgpO1xufVxuXG4vKiBBZGQgZXZlbnQgbGlzdGVuZXJzICovXG5cbi8vIFN0YXJ0aW5nIHBvaW50XG5pZiAoZG9jdW1lbnQucmVhZHlTdGF0ZSA9PT0gXCJsb2FkaW5nXCIpIHtcbiAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKFwiRE9NQ29udGVudExvYWRlZFwiLCBtYWluKTtcbn0gZWxzZSB7XG4gICAgbWFpbigpO1xufVxuXG5kb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKFwibW91c2VvdmVyXCIsIGRvY3VtZW50TW91c2VPdmVyKTtcbmRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZXVwXCIsIGRvY3VtZW50TW91c2VVcCk7XG5kb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgZG9jdW1lbnRDbGlja2VkKTtcbmRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJkcmFnb3ZlclwiLCBkb2N1bWVudERyYWdPdmVyKTtcblxuLy8gQWRkIGtleXVwIGV2ZW50IGxpc3RlbmVyIGFuZCBwdXQgZm9jdXMgb24gc2VhcmNoXG5sZXQgc2VhcmNoID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJzZWFyY2hcIik7XG5zZWFyY2guYWRkRXZlbnRMaXN0ZW5lcihcImtleXVwXCIsIHNlYXJjaFRleHRDaGFuZ2VkKTtcbnNlYXJjaC5mb2N1cygpO1xuXG4vLyBBZGQgZXZlbnQgbGlzdGVuZXJzIHRvIGFsbCBjb3B5IGJ1dHRvbnNcbmZvciAobGV0IGNvcHlCdG4gb2YgZG9jdW1lbnQuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZShcImNvcHktYnV0dG9uXCIpKSB7XG4gICAgY29weUJ0bi5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgZSA9PiB7XG4gICAgICAgIGRvY3VtZW50Lm9uY29weSA9IGNlID0+IHtcbiAgICAgICAgICAgIGNlLmNsaXBib2FyZERhdGEuc2V0RGF0YShcInRleHRcIiwgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoY29weUJ0bi5nZXRBdHRyaWJ1dGUoXCJmb3JcIikpLmlubmVyVGV4dCk7XG4gICAgICAgICAgICBjZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICB9O1xuICAgICAgICBkb2N1bWVudC5leGVjQ29tbWFuZChcImNvcHlcIiwgZmFsc2UsIG51bGwpO1xuICAgICAgICBjb3B5QnRuLmlubmVyVGV4dCA9IFwiQ29waWVkIVwiO1xuICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICAgIGNvcHlCdG4uaW5uZXJUZXh0ID0gXCJDb3B5XCI7XG4gICAgICAgIH0sIDIwMDApO1xuICAgIH0pO1xufVxuXG5HLmFyY2hpdmUgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInNhdmUtZm9yLWxhdGVyXCIpO1xuRy5hcmNoaXZlLmFkZEV2ZW50TGlzdGVuZXIoXCJkcmFnb3ZlclwiLCBhcmNoaXZlRHJhZ092ZXJSZWNlaXZlcik7XG5HLmFyY2hpdmUuYWRkRXZlbnRMaXN0ZW5lcihcImRyb3BcIiwgYXJjaGl2ZURyb3BSZWNlaXZlcik7XG5cbi8vIEFkZCBldmVudCBsaXN0ZW5lciB0byBsaXN0ZW4gZm9yIGFueSBtZXNzYWdlcyBmcm9tIGJhY2tncm91bmQuanNcbmlmICghYnJvd3Nlci5ydW50aW1lLm9uTWVzc2FnZS5oYXNMaXN0ZW5lcihvbk1lc3NhZ2UpKSB7XG4gICAgYnJvd3Nlci5ydW50aW1lLm9uTWVzc2FnZS5hZGRMaXN0ZW5lcihvbk1lc3NhZ2UpO1xufVxuIiwiaW1wb3J0IHsgc2VuZFJ1bnRpbWVNZXNzYWdlIH0gZnJvbSBcIi4vbWVzc2FnaW5nXCJcblxubGV0IHdyb25nVG9SaWdodDtcblxuZXhwb3J0IGZ1bmN0aW9uIGdldFdyb25nVG9SaWdodCgpIHtcbiAgICByZXR1cm4gc2VuZFJ1bnRpbWVNZXNzYWdlKFwiV1JPTkdfVE9fUklHSFRfR0VUXCIsIHt9KS50aGVuKHJlc3BvbnNlID0+IHtcbiAgICAgICAgd3JvbmdUb1JpZ2h0ID0gcmVzcG9uc2Uud3JvbmdUb1JpZ2h0O1xuICAgIH0pO1xufVxuXG4vLyBGdW5jdGlvbiB0byBnZXQgY29ycmVjdCB0YWIgaWRcbmV4cG9ydCBmdW5jdGlvbiBnZXRDb3JyZWN0VGFiSWQodGFiSWQpIHtcbiAgICByZXR1cm4gd3JvbmdUb1JpZ2h0W3RhYklkXSB8fCB0YWJJZDtcbn1cbiIsImltcG9ydCBHIGZyb20gXCIuL2dsb2JhbHNcIlxuaW1wb3J0IHsgZ2V0Q29ycmVjdFRhYklkIH0gZnJvbSBcIi4vd3JvbmctdG8tcmlnaHRcIlxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0VGFiQnlUYWJFbnRyeShlbnRyeSkge1xuICAgIHJldHVybiBicm93c2VyLnRhYnMuZ2V0KHBhcnNlSW50KGVudHJ5LmdldEF0dHJpYnV0ZShcImRhdGEtdGFiX2lkXCIpKSk7XG59XG5cbi8vIEZpbmQgdGFiIGVudHJ5IGJ5IHRhYiBpZFxuZXhwb3J0IGZ1bmN0aW9uIGZpbmRUYWJFbnRyeUJ5SWQodGFiSWQpIHtcbiAgICByZXR1cm4gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIi50YWItZW50cnlbZGF0YS10YWJfaWQ9XFxcIlwiICsgdGFiSWQgKyBcIlxcXCJdXCIpO1xufVxuXG4vLyBGaW5kIGNvcnJlY3QgdGFiIGVudHJ5IGJ5IHRhYiBpZFxuZXhwb3J0IGZ1bmN0aW9uIGZpbmRDb3JyZWN0VGFiRW50cnlCeUlkKHRhYklkKSB7XG4gICAgcmV0dXJuIGZpbmRUYWJFbnRyeUJ5SWQoZ2V0Q29ycmVjdFRhYklkKHRhYklkKSk7XG59XG5cbi8vIEdldCBmYXZpY29uIGZyb20gYSB0YWIgZW50cnlcbmV4cG9ydCBmdW5jdGlvbiBnZXRGYXZJY29uRnJvbVRhYkVudHJ5KGVudHJ5KSB7XG4gICAgcmV0dXJuIGVudHJ5LmdldEVsZW1lbnRCeUNsYXNzTmFtZShcInRhYi1lbnRyeS1mYXZpY29uXCIpO1xufVxuXG4vLyBGaW5kIHdpbmRvdyBlbnRyeSBieSB0YWIgaWRcbmV4cG9ydCBmdW5jdGlvbiBmaW5kV2luZG93RW50cnlCeUlkKHdpbmRvd0lkKSB7XG4gICAgcmV0dXJuIEcudGFic0xpc3QucXVlcnlTZWxlY3RvcihcImxpW2RhdGEtd2luZG93X2lkPVxcXCJcIiArIHdpbmRvd0lkICsgXCJcXFwiXVwiKTtcbn1cblxuLy8gRmluZCB0YWIgZW50cnkgaW5zaWRlIGEgd2luZG93IGVudHJ5XG5leHBvcnQgZnVuY3Rpb24gZmluZFRhYkVudHJ5SW5XaW5kb3cod2luZG93RW50cnksIHRhYklkKSB7XG4gICAgcmV0dXJuIHdpbmRvd0VudHJ5LnF1ZXJ5U2VsZWN0b3IoXCJsaVtkYXRhLXRhYl9pZD1cXFwiXCIgKyB0YWJJZCArIFwiXFxcIl1cIik7XG59XG5cbi8vIEdldCBhY3RpdmUgdGFiIGluIHRoZSBzcGVjaWZpZWQgd2luZG93XG5leHBvcnQgZnVuY3Rpb24gZ2V0QWN0aXZlVGFiKHdpbmRvd0lkKSB7XG4gICAgbGV0IHdpbmRvdyA9IGZpbmRXaW5kb3dFbnRyeUJ5SWQod2luZG93SWQpO1xuICAgIHJldHVybiB3aW5kb3cuZ2V0RWxlbWVudEJ5Q2xhc3NOYW1lKFwiY3VycmVudC10YWJcIik7XG59XG5cbi8vIFNldCBhY3RpdmUgdGFiIGluIHRoZSBzcGVjaWZpZWQgd2luZG93XG5leHBvcnQgZnVuY3Rpb24gc2V0QWN0aXZlVGFiKHdpbmRvd0lkLCB0YWJJZCkge1xuICAgIGxldCB3aW5kb3cgPSBmaW5kV2luZG93RW50cnlCeUlkKHdpbmRvd0lkKSwgbGFzdEFjdGl2ZVRhYjtcbiAgICBpZiAoKGxhc3RBY3RpdmVUYWIgPSBnZXRBY3RpdmVUYWIod2luZG93SWQpKSAhPT0gbnVsbCkge1xuICAgICAgICBsYXN0QWN0aXZlVGFiLmNsYXNzTGlzdC5yZW1vdmUoXCJjdXJyZW50LXRhYlwiKTtcbiAgICB9XG4gICAgZmluZFRhYkVudHJ5SW5XaW5kb3cod2luZG93LCB0YWJJZCkuY2xhc3NMaXN0LmFkZChcImN1cnJlbnQtdGFiXCIpO1xufVxuXG4vLyBSZW1vdmUgdGFiXG5leHBvcnQgZnVuY3Rpb24gcmVtb3ZlVGFiKHRhYklkLCB3aW5kb3dJZCkge1xuICAgIGxldCB0YWJFbnRyeSA9IGZpbmRUYWJFbnRyeUJ5SWQodGFiSWQpO1xuICAgIHRhYkVudHJ5LnBhcmVudEVsZW1lbnQucmVtb3ZlQ2hpbGQodGFiRW50cnkpO1xuICAgIGJyb3dzZXIudGFicy5xdWVyeSh7XG4gICAgICAgIGFjdGl2ZTogdHJ1ZSxcbiAgICAgICAgd2luZG93SWQ6IHdpbmRvd0lkXG4gICAgfSkudGhlbih0YWJzID0+IHtcbiAgICAgICAgZmluZENvcnJlY3RUYWJFbnRyeUJ5SWQodGFic1swXS5pZCkuY2xhc3NMaXN0LmFkZChcImN1cnJlbnQtdGFiXCIpO1xuICAgIH0pO1xufVxuXG4vKlxuLy8gTW92ZSB0YWJcbmV4cG9ydCBmdW5jdGlvbiBtb3ZlVGFiKHRhYklkLCB3aW5kb3dJZCwgdG9JbmRleCkge1xuICAgIGxldCB0YWIgPSBmaW5kVGFiRW50cnlCeUlkKHRhYklkKTtcbiAgICBsZXQgdGFic0xpc3RET00gPSBmaW5kV2luZG93RW50cnlCeUlkKHdpbmRvd0lkKS5nZXRFbGVtZW50QnlDbGFzc05hbWUoXCJ3aW5kb3ctZW50cnktdGFic1wiKTtcbiAgICB0YWJzTGlzdERPTS5yZW1vdmVDaGlsZCh0YWIpO1xuICAgIGlmICh0b0luZGV4ID09PSAtMSkge1xuICAgICAgICB0YWJzTGlzdERPTS5hcHBlbmRDaGlsZCh0YWIpO1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIHRhYnNMaXN0RE9NLmluc2VydEJlZm9yZSh0YWIsIHRhYnNMaXN0RE9NLmNoaWxkTm9kZXNbdG9JbmRleF0pO1xufVxuKi9cblxuLy8gTW92ZSB0YWJcbmV4cG9ydCBmdW5jdGlvbiBtb3ZlVGFiKHRhcmdldCwgZGVzdCkge1xuICAgIGdldFdpbmRvd0Zyb21UYWIoZGVzdCkuZ2V0RWxlbWVudEJ5Q2xhc3NOYW1lKFwid2luZG93LWVudHJ5LXRhYnNcIikuaW5zZXJ0QmVmb3JlKHRhcmdldCwgZGVzdCk7XG59XG5cbi8vIE1vdmUgdGFic1xuZXhwb3J0IGZ1bmN0aW9uIG1vdmVUYWJzKHRhcmdldHMsIGRlc3QpIHtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRhcmdldHMubGVuZ3RoOyBpKyspIG1vdmVUYWIodGFyZ2V0c1tpXSwgZGVzdCk7XG59XG5cbi8vIEF0dGFjaCB0YWJcbmV4cG9ydCBmdW5jdGlvbiBhdHRhY2hUYWIodGFyZ2V0LCBkZXN0KSB7XG4gICAgZGVzdC5nZXRFbGVtZW50QnlDbGFzc05hbWUoXCJ3aW5kb3ctZW50cnktdGFic1wiKS5hcHBlbmRDaGlsZCh0YXJnZXQpO1xufVxuXG4vLyBBdHRhY2ggdGFic1xuZXhwb3J0IGZ1bmN0aW9uIGF0dGFjaFRhYnModGFyZ2V0cywgZGVzdCkge1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGFyZ2V0cy5sZW5ndGg7IGkrKykgYXR0YWNoVGFiKHRhcmdldHNbaV0sIGRlc3QpO1xufVxuXG4vKlxuLy8gQXR0YWNoIHRhYlxuZXhwb3J0IGZ1bmN0aW9uIGF0dGFjaFRhYih0YWJJZCwgZnJvbSwgdG8sIHRvSW5kZXgpIHtcbiAgICBsZXQgdGFiID0gZmluZFRhYkVudHJ5QnlJZCh0YWJJZCk7XG4gICAgbGV0IG9sZFRhYnNMaXN0RE9NID0gZmluZFdpbmRvd0VudHJ5QnlJZChmcm9tKS5nZXRFbGVtZW50QnlDbGFzc05hbWUoXCJ3aW5kb3ctZW50cnktdGFic1wiKTtcbiAgICBsZXQgbmV3VGFic0xpc3RET00gPSBmaW5kV2luZG93RW50cnlCeUlkKHRvKS5nZXRFbGVtZW50QnlDbGFzc05hbWUoXCJ3aW5kb3ctZW50cnktdGFic1wiKTtcbiAgICBvbGRUYWJzTGlzdERPTS5yZW1vdmVDaGlsZCh0YWIpO1xuICAgIGlmICh0b0luZGV4ID09PSAtMSkge1xuICAgICAgICBuZXdUYWJzTGlzdERPTS5hcHBlbmRDaGlsZCh0YWIpO1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIG5ld1RhYnNMaXN0RE9NLmluc2VydEJlZm9yZSh0YWIsIG5ld1RhYnNMaXN0RE9NLmNoaWxkTm9kZXNbdG9JbmRleF0pO1xufVxuKi9cblxuLy8gUmVtb3ZlIHdpbmRvd1xuZXhwb3J0IGZ1bmN0aW9uIHJlbW92ZVdpbmRvdyh3aW5kb3dJZCkge1xuICAgIGxldCB3aW5kb3dFbnRyeSA9IGZpbmRXaW5kb3dFbnRyeUJ5SWQod2luZG93SWQpO1xuICAgIHdpbmRvd0VudHJ5LnBhcmVudEVsZW1lbnQucmVtb3ZlQ2hpbGQod2luZG93RW50cnkpO1xuICAgIGJyb3dzZXIud2luZG93cy5nZXRDdXJyZW50KHt9KS50aGVuKHdpbmRvdyA9PiB7XG4gICAgICAgIGZpbmRXaW5kb3dFbnRyeUJ5SWQod2luZG93LmlkKS5jbGFzc0xpc3QuYWRkKFwiY3VycmVudC13aW5kb3dcIik7XG4gICAgfSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRXaW5kb3dGcm9tVGFiKHRhYikge1xuICAgIHJldHVybiB0YWIucGFyZW50RWxlbWVudC5wYXJlbnRFbGVtZW50O1xufVxuXG4vLyBUZXN0IGlmIHRhYiBpcyBkcmFnZ2FibGVcbmV4cG9ydCBmdW5jdGlvbiB0YWJEcmFnZ2FibGUoc291cmNlVGFiLCB0YXJnZXRUYWIsIHVuZGVyLCBzb3VyY2VXaW5kb3cpIHtcbiAgICByZXR1cm4gc291cmNlVGFiICE9PSB0YXJnZXRUYWJcbiAgICAgICAgICAgICYmICgoIXNvdXJjZVRhYi5jbGFzc0xpc3QuY29udGFpbnMoXCJwaW5uZWQtdGFiXCIpICYmICF0YXJnZXRUYWIuY2xhc3NMaXN0LmNvbnRhaW5zKFwicGlubmVkLXRhYlwiKSlcbiAgICAgICAgICAgIHx8IChzb3VyY2VUYWIuY2xhc3NMaXN0LmNvbnRhaW5zKFwicGlubmVkLXRhYlwiKSAmJiB0YXJnZXRUYWIuY2xhc3NMaXN0LmNvbnRhaW5zKFwicGlubmVkLXRhYlwiKSlcbiAgICAgICAgICAgIHx8ICh1bmRlciAmJiAhc291cmNlVGFiLmNsYXNzTGlzdC5jb250YWlucyhcInBpbm5lZC10YWJcIikpKVxuICAgICAgICAgICAgJiYgKCghc291cmNlV2luZG93LmNsYXNzTGlzdC5jb250YWlucyhcImluY29nbml0by13aW5kb3dcIikgJiYgIWdldFdpbmRvd0Zyb21UYWIodGFyZ2V0VGFiKS5jbGFzc0xpc3QuY29udGFpbnMoXCJpbmNvZ25pdG8td2luZG93XCIpKVxuICAgICAgICAgICAgfHwgKHNvdXJjZVdpbmRvdy5jbGFzc0xpc3QuY29udGFpbnMoXCJpbmNvZ25pdG8td2luZG93XCIpICYmIGdldFdpbmRvd0Zyb21UYWIodGFyZ2V0VGFiKS5jbGFzc0xpc3QuY29udGFpbnMoXCJpbmNvZ25pdG8td2luZG93XCIpKSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiB0YWJFbnRyeUluZGV4KHRhYkVudHJ5KSB7XG4gICAgbGV0IHRhYnMgPSBkb2N1bWVudC5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKFwidGFiLWVudHJ5XCIpO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGFicy5sZW5ndGg7IGkrKykge1xuICAgICAgICBpZiAodGFic1tpXSA9PT0gdGFiRW50cnkpIHtcbiAgICAgICAgICAgIHJldHVybiBpO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiAtMTtcbn1cblxuLyogTXVsdGlzZWxlY3QgKi9cbmxldCBzZWxlY3RlZFRhYnMgPSAwO1xuLy8gU2VsZWN0XG5leHBvcnQgZnVuY3Rpb24gbXVsdGlTZWxlY3QoZWxlbWVudCkge1xuICAgIGlmICghZWxlbWVudC5jbGFzc0xpc3QuY29udGFpbnMoXCJtdWx0aXNlbGVjdFwiKSkge1xuICAgICAgICBzZWxlY3RlZFRhYnMrKztcbiAgICAgICAgRy5pc1NlbGVjdGluZyA9IHRydWU7XG4gICAgICAgIGVsZW1lbnQuY2xhc3NMaXN0LmFkZChcIm11bHRpc2VsZWN0XCIpO1xuICAgIH1cbn1cbi8vIENhbmNlbCBTZWxlY3Rpb25cbmV4cG9ydCBmdW5jdGlvbiBtdWx0aVNlbGVjdENhbmNlbChlbGVtZW50KSB7XG4gICAgaWYgKGVsZW1lbnQuY2xhc3NMaXN0LmNvbnRhaW5zKFwibXVsdGlzZWxlY3RcIikpIHtcbiAgICAgICAgaWYgKC0tc2VsZWN0ZWRUYWJzID09IDApIHtcbiAgICAgICAgICAgIEcuaXNTZWxlY3RpbmcgPSBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICBlbGVtZW50LmNsYXNzTGlzdC5yZW1vdmUoXCJtdWx0aXNlbGVjdFwiKTtcbiAgICB9XG59XG4vLyBSZXNldCBtdWx0aXNlbGVjdFxuZXhwb3J0IGZ1bmN0aW9uIG11bHRpU2VsZWN0UmVzZXQoKSB7XG4gICAgZm9yIChsZXQgZWxlbWVudCBvZiBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChkb2N1bWVudC5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKFwibXVsdGlzZWxlY3RcIikpKSB7XG4gICAgICAgIGVsZW1lbnQuY2xhc3NMaXN0LnJlbW92ZShcIm11bHRpc2VsZWN0XCIpO1xuICAgIH1cbiAgICBHLmlzU2VsZWN0aW5nID0gZmFsc2U7XG59XG4vLyBUb2dnbGUgU2VsZWN0aW9uXG5leHBvcnQgZnVuY3Rpb24gbXVsdGlTZWxlY3RUb2dnbGUoZWxlbWVudCkge1xuICAgIGlmIChlbGVtZW50LmNsYXNzTGlzdC5jb250YWlucyhcIm11bHRpc2VsZWN0XCIpKSB7XG4gICAgICAgIG11bHRpU2VsZWN0Q2FuY2VsKGVsZW1lbnQpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIG11bHRpU2VsZWN0KGVsZW1lbnQpO1xuICAgIH1cbn1cbi8vIFJlc2V0IHNsaWRlIHNlbGVjdGlvblxuZXhwb3J0IGZ1bmN0aW9uIHJlc2V0U2xpZGVTZWxlY3Rpb24oKSB7XG4gICAgRy5zbGlkZVNlbGVjdGlvbi5zbGlkaW5nID0gZmFsc2U7XG4gICAgRy5zbGlkZVNlbGVjdGlvbi5pbml0aWF0b3IgPSB1bmRlZmluZWQ7XG59XG4iLCJpbXBvcnQgRyBmcm9tIFwiLi9nbG9iYWxzXCJcbmltcG9ydCB7IGdldEltYWdlIH0gZnJvbSBcIi4vbmV0XCJcbmltcG9ydCB7IGdldENvcnJlY3RUYWJJZCB9IGZyb20gXCIuL3dyb25nLXRvLXJpZ2h0XCJcbmltcG9ydCB7IGdldFdpbmRvd3MgfSBmcm9tIFwiLi93dHV0aWxzXCJcbmltcG9ydCB7IGdldEFjdHVhbEhlaWdodCB9IGZyb20gXCIuL2RvbXV0aWxzXCJcbmltcG9ydCB7IGFyY2hpdmVEcmFnU3RhcnRSZWNlaXZlciB9IGZyb20gXCIuL2V2ZW50LWxpc3RlbmVycy9hcmNoaXZlXCJcbmltcG9ydCB7IHdpbmRvd0VudHJ5RHJhZ1N0YXJ0ZWQsIHdpbmRvd0VudHJ5RHJhZ2dpbmdPdmVyLCB3aW5kb3dFbnRyeURyb3BwZWQgfSBmcm9tIFwiLi9ldmVudC1saXN0ZW5lcnMvd2luZG93RW50cnlEcmFnXCJcblxuLy8gVXBkYXRlIHRhYnNcbmV4cG9ydCBmdW5jdGlvbiB1cGRhdGVUYWJzKHdpbmRvd3MpIHtcbiAgICBHLnRhYnNMaXN0LmlubmVySFRNTCA9IFwiXCI7XG4gICAgbGV0IHRhYnNMaXN0RnJhZ21lbnQgPSBkb2N1bWVudC5jcmVhdGVEb2N1bWVudEZyYWdtZW50KCk7XG4gICAgbGV0IGN1cnJlbnRXaW5kb3dFbnRyeTtcbiAgICAvKiBQcmVkZWZpbmVkIGVsZW1lbnRzIGZvciBmYXN0ZXIgcGVyZm9ybWFuY2UgKi9cbiAgICAvLyBXaW5kb3cgY2xvc2UgYnV0dG9uXG4gICAgbGV0IFdJTkRPV19DTE9TRV9CVE4gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwic3BhblwiKTtcbiAgICBXSU5ET1dfQ0xPU0VfQlROLmNsYXNzTGlzdC5hZGQoXCJpbmxpbmUtYnV0dG9uXCIpO1xuICAgIFdJTkRPV19DTE9TRV9CVE4uY2xhc3NMaXN0LmFkZChcImltZy1idXR0b25cIik7XG4gICAgV0lORE9XX0NMT1NFX0JUTi5jbGFzc0xpc3QuYWRkKFwib3BhY2l0eS1jaGFuZ2luZy1idXR0b25cIik7XG4gICAgV0lORE9XX0NMT1NFX0JUTi5jbGFzc0xpc3QuYWRkKFwid2luZG93LWVudHJ5LXJlbW92ZS1idG5cIik7XG4gICAgV0lORE9XX0NMT1NFX0JUTi5zdHlsZS5iYWNrZ3JvdW5kSW1hZ2UgPSBcInVybCguLi9pY29ucy9jbG9zZS5zdmcpXCI7XG4gICAgbGV0IERJViA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XG4gICAgRElWLnN0eWxlLmRpc3BsYXkgPSBcImlubGluZS1ibG9ja1wiO1xuICAgIFdJTkRPV19DTE9TRV9CVE4uYXBwZW5kQ2hpbGQoRElWKTtcbiAgICAvLyBUYWIgY2xvc2UgYnV0dG9uXG4gICAgbGV0IFRBQl9DTE9TRV9CVE4gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwic3BhblwiKTtcbiAgICBUQUJfQ0xPU0VfQlROLmNsYXNzTGlzdC5hZGQoXCJpbmxpbmUtYnV0dG9uXCIpO1xuICAgIFRBQl9DTE9TRV9CVE4uY2xhc3NMaXN0LmFkZChcInJlZC1idXR0b25cIik7XG4gICAgVEFCX0NMT1NFX0JUTi5jbGFzc0xpc3QuYWRkKFwiaW1nLWJ1dHRvblwiKTtcbiAgICBUQUJfQ0xPU0VfQlROLmNsYXNzTGlzdC5hZGQoXCJ0YWItZW50cnktcmVtb3ZlLWJ0blwiKTtcbiAgICBUQUJfQ0xPU0VfQlROLnN0eWxlLmJhY2tncm91bmRJbWFnZSA9IFwidXJsKC4uL2ljb25zL2Nsb3NlLnN2ZylcIjtcbiAgICAvLyBUYWIgcGluIGJ1dHRvblxuICAgIGxldCBUQUJfUElOX0JUTiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJzcGFuXCIpO1xuICAgIFRBQl9QSU5fQlROLmNsYXNzTGlzdC5hZGQoXCJpbmxpbmUtYnV0dG9uXCIpO1xuICAgIFRBQl9QSU5fQlROLmNsYXNzTGlzdC5hZGQoXCJpbWctYnV0dG9uXCIpO1xuICAgIFRBQl9QSU5fQlROLmNsYXNzTGlzdC5hZGQoXCJvcGFjaXR5LWNoYW5naW5nLWJ1dHRvblwiKTtcbiAgICBUQUJfUElOX0JUTi5jbGFzc0xpc3QuYWRkKFwidGFiLWVudHJ5LXBpbi1idG5cIik7XG4gICAgVEFCX1BJTl9CVE4uc3R5bGUuYmFja2dyb3VuZEltYWdlID0gXCJ1cmwoLi4vaWNvbnMvcGluLnN2ZylcIjtcbiAgICAvLyBMb29wIHRocm91Z2ggd2luZG93c1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgd2luZG93cy5sZW5ndGg7IGkrKykge1xuICAgICAgICAvLyBTZXQgdyB0byB3aW5kb3dcbiAgICAgICAgbGV0IHcgPSB3aW5kb3dzW2ldO1xuXG4gICAgICAgIC8vIENyZWF0ZSB3aW5kb3cgZW50cnlcbiAgICAgICAgbGV0IHdpbmRvd0VudHJ5ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImxpXCIpO1xuICAgICAgICB3aW5kb3dFbnRyeS5jbGFzc0xpc3QuYWRkKFwid2luZG93LWVudHJ5XCIpO1xuICAgICAgICB3aW5kb3dFbnRyeS5jbGFzc0xpc3QuYWRkKFwiY2F0ZWdvcnlcIik7XG5cbiAgICAgICAgLy8gQ3JlYXRlIHdpbmRvdyBlbnRyeSBmcmFnbWVudFxuICAgICAgICBsZXQgd2luZG93RW50cnlGcmFnbWVudCA9IGRvY3VtZW50LmNyZWF0ZURvY3VtZW50RnJhZ21lbnQoKTtcblxuICAgICAgICAvLyBTZXQgd2luZG93IGlkIHRvIHdpbmRvdyBlbnRyeVxuICAgICAgICB3aW5kb3dFbnRyeS5zZXRBdHRyaWJ1dGUoXCJkYXRhLXdpbmRvd19pZFwiLCB3LmlkKTtcbiAgICAgICAgbGV0IHNwYW4gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwic3BhblwiKTtcblxuICAgICAgICAvLyBDcmVhdGUgY2xvc2UgYnV0dG9uXG4gICAgICAgIGxldCBjbG9zZUJ0biA9IFdJTkRPV19DTE9TRV9CVE4uY2xvbmVOb2RlKHRydWUpO1xuXG4gICAgICAgIC8vIEJ1dHRvbnMgd3JhcHBlclxuICAgICAgICBsZXQgYnV0dG9ucyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJzcGFuXCIpO1xuICAgICAgICBidXR0b25zLmNsYXNzTGlzdC5hZGQoXCJ3aW5kb3ctZW50cnktYnV0dG9uc1wiKTtcbiAgICAgICAgYnV0dG9ucy5hcHBlbmRDaGlsZChjbG9zZUJ0bik7XG4gICAgICAgIFxuICAgICAgICAvLyBDcmVhdGUgd2luZG93IG5hbWUgc3BhblxuICAgICAgICBsZXQgd2luZG93TmFtZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJzcGFuXCIpO1xuICAgICAgICB3aW5kb3dOYW1lLmNsYXNzTGlzdC5hZGQoXCJ3aW5kb3ctdGl0bGVcIik7XG4gICAgICAgIHdpbmRvd05hbWUudGV4dENvbnRlbnQgKz0gXCJXaW5kb3cgXCIgKyAoaSsxKTtcblxuICAgICAgICAvLyBDaGVjayBpZiB3aW5kb3cgaXMgZm9jdXNlZFxuICAgICAgICBpZiAody5mb2N1c2VkKSB7XG4gICAgICAgICAgICBjdXJyZW50V2luZG93RW50cnkgPSB3aW5kb3dFbnRyeTtcbiAgICAgICAgICAgIHdpbmRvd0VudHJ5LmNsYXNzTGlzdC5hZGQoXCJjdXJyZW50LXdpbmRvd1wiKTtcbiAgICAgICAgICAgIHdpbmRvd05hbWUudGV4dENvbnRlbnQgKz0gXCIgLSBDdXJyZW50XCI7XG4gICAgICAgIH1cbiAgICAgICAgLy8gQ2hlY2sgaWYgd2luZG93IGlzIGluY29nbml0b1xuICAgICAgICBpZiAody5pbmNvZ25pdG8pIHtcbiAgICAgICAgICAgIHdpbmRvd0VudHJ5LmNsYXNzTGlzdC5hZGQoXCJpbmNvZ25pdG8td2luZG93XCIpO1xuICAgICAgICAgICAgd2luZG93TmFtZS50ZXh0Q29udGVudCArPSBcIiAoSW5jb2duaXRvKVwiO1xuICAgICAgICB9XG5cbiAgICAgICAgc3Bhbi5hcHBlbmRDaGlsZCh3aW5kb3dOYW1lKTtcbiAgICAgICAgc3Bhbi5hcHBlbmRDaGlsZChidXR0b25zKTtcblxuICAgICAgICBzcGFuLmNsYXNzTGlzdC5hZGQoXCJkYXJrZXItYnV0dG9uXCIpO1xuXG4gICAgICAgIHdpbmRvd0VudHJ5RnJhZ21lbnQuYXBwZW5kQ2hpbGQoc3Bhbik7XG5cbiAgICAgICAgLy8gQWRkIHdpbmRvdyBlbnRyeSBkcmFnc3RhcnQsIGRyYWdvdmVyLCBhbmQgZHJvcCBldmVudCBsaXN0ZW5lcnNcbiAgICAgICAgd2luZG93RW50cnkuYWRkRXZlbnRMaXN0ZW5lcihcImRyYWdzdGFydFwiLCB3aW5kb3dFbnRyeURyYWdTdGFydGVkKTtcbiAgICAgICAgd2luZG93RW50cnkuYWRkRXZlbnRMaXN0ZW5lcihcImRyYWdvdmVyXCIsIHdpbmRvd0VudHJ5RHJhZ2dpbmdPdmVyKTtcbiAgICAgICAgd2luZG93RW50cnkuYWRkRXZlbnRMaXN0ZW5lcihcImRyb3BcIiwgd2luZG93RW50cnlEcm9wcGVkKTtcbiAgICAgICAgd2luZG93RW50cnkuc2V0QXR0cmlidXRlKFwiZHJhZ2dhYmxlXCIsIFwidHJ1ZVwiKTtcblxuICAgICAgICAvLyBBZGQgd2luZG93IGJ1dHRvbiBkcmFnc3RhcnQsIGRyYWdvdmVyLCBhbmQgZHJvcCBldmVudCBsaXN0ZW5lcnNcbiAgICAgICAgd2luZG93RW50cnkuYWRkRXZlbnRMaXN0ZW5lcihcImRyYWdzdGFydFwiLCBhcmNoaXZlRHJhZ1N0YXJ0UmVjZWl2ZXIpO1xuXG4gICAgICAgIGxldCB3aW5kb3dUYWJzTGlzdCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJ1bFwiKTtcbiAgICAgICAgd2luZG93VGFic0xpc3QuY2xhc3NMaXN0LmFkZChcImNhdGVnb3J5LWxpc3RcIik7XG4gICAgICAgIHdpbmRvd1RhYnNMaXN0LmNsYXNzTGlzdC5hZGQoXCJ3aW5kb3ctZW50cnktdGFic1wiKTtcblxuICAgICAgICBsZXQgd2luZG93VGFic0xpc3RGcmFnbWVudCA9IGRvY3VtZW50LmNyZWF0ZURvY3VtZW50RnJhZ21lbnQoKTtcbiAgICAgICAgLy8gTG9vcCB0aHJvdWdoIHRhYnNcbiAgICAgICAgZm9yIChsZXQgdGFiIG9mIHcudGFicykge1xuICAgICAgICAgICAgLy8gQ2hlY2sgdGFiIGlkXG4gICAgICAgICAgICBpZiAodGFiLmlkICE9PSBicm93c2VyLnRhYnMuVEFCX0lEX05PTkUpIHtcbiAgICAgICAgICAgICAgICAvLyBDcmVhdGUgdGFiIGVudHJ5XG4gICAgICAgICAgICAgICAgbGV0IHRhYkVudHJ5ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImxpXCIpO1xuICAgICAgICAgICAgICAgIHRhYkVudHJ5LmNsYXNzTGlzdC5hZGQoXCJ0YWItZW50cnlcIik7XG4gICAgICAgICAgICAgICAgdGFiRW50cnkuY2xhc3NMaXN0LmFkZChcImJ1dHRvblwiKTtcbiAgICAgICAgICAgICAgICAvLyBTZXQgdGFiIGVudHJ5IGFzIGRyYWdnYWJsZS4gUmVxdWlyZWQgdG8gZW5hYmxlIG1vdmUgdGFiIGZlYXR1cmVcbiAgICAgICAgICAgICAgICB0YWJFbnRyeS5zZXRBdHRyaWJ1dGUoXCJkcmFnZ2FibGVcIiwgXCJ0cnVlXCIpO1xuXG4gICAgICAgICAgICAgICAgLy8gQ3JlYXRlIHRhYiBlbnRyeSBmcmFnbWVudFxuICAgICAgICAgICAgICAgIGxldCB0YWJFbnRyeUZyYWdtZW50ID0gZG9jdW1lbnQuY3JlYXRlRG9jdW1lbnRGcmFnbWVudCgpO1xuXG4gICAgICAgICAgICAgICAgbGV0IGZhdmljb247XG4gICAgICAgICAgICAgICAgbGV0IHRpdGxlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcInNwYW5cIik7XG4gICAgICAgICAgICAgICAgdGl0bGUuY2xhc3NMaXN0LmFkZChcInRhYi10aXRsZVwiKTtcbiAgICAgICAgICAgICAgICB0aXRsZS50ZXh0Q29udGVudCArPSB0YWIudGl0bGU7XG4gICAgICAgICAgICAgICAgbGV0IHRpdGxlV3JhcHBlciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XG4gICAgICAgICAgICAgICAgdGl0bGVXcmFwcGVyLmNsYXNzTGlzdC5hZGQoXCJ0YWItdGl0bGUtd3JhcHBlclwiKTtcbiAgICAgICAgICAgICAgICB0aXRsZVdyYXBwZXIuYXBwZW5kQ2hpbGQodGl0bGUpO1xuXG4gICAgICAgICAgICAgICAgaWYgKHRhYi5hY3RpdmUpIHtcbiAgICAgICAgICAgICAgICAgICAgdGFiRW50cnkuY2xhc3NMaXN0LmFkZChcImN1cnJlbnQtdGFiXCIpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAodGFiLmZhdkljb25VcmwpIHtcbiAgICAgICAgICAgICAgICAgICAgZmF2aWNvbiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJpbWdcIik7XG4gICAgICAgICAgICAgICAgICAgIGZhdmljb24uY2xhc3NMaXN0LmFkZChcInRhYi1lbnRyeS1mYXZpY29uXCIpO1xuICAgICAgICAgICAgICAgICAgICBsZXQgZmF2SWNvblByb21pc2U7XG4gICAgICAgICAgICAgICAgICAgIGlmICh3LmluY29nbml0bykge1xuICAgICAgICAgICAgICAgICAgICAgICAgZmF2SWNvblByb21pc2UgPSBnZXRJbWFnZSh0YWIuZmF2SWNvblVybCwgdHJ1ZSk7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBmYXZJY29uUHJvbWlzZSA9IGdldEltYWdlKHRhYi5mYXZJY29uVXJsKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBmYXZJY29uUHJvbWlzZS50aGVuKGJhc2U2NEltYWdlID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGZhdmljb24uc3JjID0gYmFzZTY0SW1hZ2U7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIC8vIENyZWF0ZSBjbG9zZSBidXR0b25cbiAgICAgICAgICAgICAgICBsZXQgY2xvc2VCdG4gPSBUQUJfQ0xPU0VfQlROLmNsb25lTm9kZShmYWxzZSk7XG5cbiAgICAgICAgICAgICAgICAvLyBDcmVhdGUgcGluIGJ1dHRvblxuICAgICAgICAgICAgICAgIGxldCBwaW5CdG4gPSBUQUJfUElOX0JUTi5jbG9uZU5vZGUoZmFsc2UpO1xuXG4gICAgICAgICAgICAgICAgLy8gQnV0dG9ucyB3cmFwcGVyXG4gICAgICAgICAgICAgICAgbGV0IGJ1dHRvbnMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwic3BhblwiKTtcbiAgICAgICAgICAgICAgICBidXR0b25zLmNsYXNzTGlzdC5hZGQoXCJ0YWItZW50cnktYnV0dG9uc1wiKTtcbiAgICAgICAgICAgICAgICBidXR0b25zLmFwcGVuZENoaWxkKHBpbkJ0bik7XG4gICAgICAgICAgICAgICAgYnV0dG9ucy5hcHBlbmRDaGlsZChjbG9zZUJ0bik7XG5cbiAgICAgICAgICAgICAgICAvLyBTZXQgdGFiIGVudHJ5IHRhYiBpZFxuICAgICAgICAgICAgICAgIHRhYkVudHJ5LnNldEF0dHJpYnV0ZShcImRhdGEtdGFiX2lkXCIsIGdldENvcnJlY3RUYWJJZCh0YWIuaWQpKTtcbiAgICAgICAgICAgICAgICBpZiAoZmF2aWNvbiAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgICAgIHRhYkVudHJ5RnJhZ21lbnQuYXBwZW5kQ2hpbGQoZmF2aWNvbik7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgdGFiRW50cnkuY2xhc3NMaXN0LmFkZChcIm5vaWNvblwiKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgdGFiRW50cnlGcmFnbWVudC5hcHBlbmRDaGlsZCh0aXRsZVdyYXBwZXIpO1xuICAgICAgICAgICAgICAgIHRhYkVudHJ5RnJhZ21lbnQuYXBwZW5kQ2hpbGQoYnV0dG9ucyk7XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgdGFiRW50cnkuYXBwZW5kQ2hpbGQodGFiRW50cnlGcmFnbWVudCk7XG5cbiAgICAgICAgICAgICAgICBpZiAodGFiLnBpbm5lZCkge1xuICAgICAgICAgICAgICAgICAgICBwaW5CdG4uc3R5bGUuYmFja2dyb3VuZEltYWdlID0gXCJ1cmwoLi4vaWNvbnMvcGlucmVtb3ZlLnN2ZylcIjtcbiAgICAgICAgICAgICAgICAgICAgdGFiRW50cnkuY2xhc3NMaXN0LmFkZChcInBpbm5lZC10YWJcIik7XG4gICAgICAgICAgICAgICAgICAgIGxldCBwaW5uZWRUYWJzID0gd2luZG93VGFic0xpc3QuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZShcInBpbm5lZC10YWJcIik7XG4gICAgICAgICAgICAgICAgICAgIGxldCBsYXN0UGlubmVkVGFiID0gcGlubmVkVGFic1twaW5uZWRUYWJzLmxlbmd0aC0xXTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGxhc3RQaW5uZWRUYWIgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgd2luZG93VGFic0xpc3RGcmFnbWVudC5pbnNlcnRCZWZvcmUodGFiRW50cnksIGxhc3RQaW5uZWRUYWIubmV4dFNpYmxpbmcpO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgd2luZG93VGFic0xpc3RGcmFnbWVudC5pbnNlcnRCZWZvcmUodGFiRW50cnksIHdpbmRvd1RhYnNMaXN0LmNoaWxkTm9kZXNbMF0pO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgd2luZG93VGFic0xpc3RGcmFnbWVudC5hcHBlbmRDaGlsZCh0YWJFbnRyeSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgLy8gQXBwZW5kIGZyYWdtZW50IHRvIGFjdHVhbCB3aW5kb3dUYWJzTGlzdFxuICAgICAgICB3aW5kb3dUYWJzTGlzdC5hcHBlbmRDaGlsZCh3aW5kb3dUYWJzTGlzdEZyYWdtZW50KTtcblxuICAgICAgICB3aW5kb3dFbnRyeUZyYWdtZW50LmFwcGVuZENoaWxkKHdpbmRvd1RhYnNMaXN0KTtcbiAgICAgICAgd2luZG93RW50cnkuYXBwZW5kQ2hpbGQod2luZG93RW50cnlGcmFnbWVudCk7XG4gICAgICAgIHRhYnNMaXN0RnJhZ21lbnQuYXBwZW5kQ2hpbGQod2luZG93RW50cnkpO1xuICAgIH1cbiAgICBHLnRhYnNMaXN0LmFwcGVuZENoaWxkKHRhYnNMaXN0RnJhZ21lbnQpO1xuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwidGFic1wiKS5zdHlsZS5kaXNwbGF5ID0gXCJibG9ja1wiO1xuICAgIGN1cnJlbnRXaW5kb3dFbnRyeS5zY3JvbGxJbnRvVmlldyh7IGJlaGF2aW9yOiAnc21vb3RoJyB9KTtcbn1cblxuLy8gQWRkIHRhYnMgdG8gbGlzdFxuZXhwb3J0IGZ1bmN0aW9uIHBvcHVsYXRlVGFic0xpc3QoKSB7XG4gICAgZ2V0V2luZG93cygpLnRoZW4od2luZG93cyA9PiB7XG4gICAgICAgIHVwZGF0ZVRhYnMod2luZG93cyk7XG4gICAgfSk7XG59XG5cbi8vIFNldCB0YWJzIGxpc3QgaGVpZ2h0IHRvIGFueSBhdmFpbGFibGUgaGVpZ2h0XG5leHBvcnQgZnVuY3Rpb24gZXh0ZW5kVGFic0xpc3QoKSB7XG4gICAgbGV0IHNlYXJjaEFyZWEgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInNlYXJjaC1hcmVhXCIpO1xuICAgIGxldCBzZWFyY2hBcmVhSGVpZ2h0ID0gZ2V0QWN0dWFsSGVpZ2h0KHNlYXJjaEFyZWEpO1xuICAgIGxldCB0YWJzID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJ0YWJzXCIpO1xuICAgIHRhYnMuc3R5bGUuaGVpZ2h0ID0gXCJjYWxjKDEwMCUgLSBcIiArIHNlYXJjaEFyZWFIZWlnaHQgKyBcInB4KVwiO1xufVxuIiwiLy8gR2V0IGFsbCB3aW5kb3dzXG5leHBvcnQgZnVuY3Rpb24gZ2V0V2luZG93cygpIHtcbiAgICByZXR1cm4gYnJvd3Nlci53aW5kb3dzLmdldEFsbCh7XG4gICAgICAgIHBvcHVsYXRlOiB0cnVlLFxuICAgICAgICB3aW5kb3dUeXBlczogW1wibm9ybWFsXCIsIFwicG9wdXBcIiwgXCJkZXZ0b29sc1wiXVxuICAgIH0pO1xufVxuXG4vLyBHZXQgY3VycmVudCB3aW5kb3dcbmV4cG9ydCBmdW5jdGlvbiBnZXRDdXJyZW50V2luZG93KCkge1xuICAgIHJldHVybiBicm93c2VyLndpbmRvd3MuZ2V0TGFzdEZvY3VzZWQoe30pO1xufVxuIl0sInNvdXJjZVJvb3QiOiIifQ==
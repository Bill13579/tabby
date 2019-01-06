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
/******/ 	return __webpack_require__(__webpack_require__.s = "./src/background/background.js");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./src/background/background.js":
/*!**************************************!*\
  !*** ./src/background/background.js ***!
  \**************************************/
/*! no exports provided */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _globals__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./globals */ "./src/background/globals.js");
/* harmony import */ var _event_listeners_message__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./event-listeners/message */ "./src/background/event-listeners/message.js");
/* harmony import */ var _event_listeners_tab__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./event-listeners/tab */ "./src/background/event-listeners/tab.js");
/* harmony import */ var _event_listeners_window__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./event-listeners/window */ "./src/background/event-listeners/window.js");
/* harmony import */ var _event_listeners_command__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./event-listeners/command */ "./src/background/event-listeners/command.js");






// Set initial tab id
browser.tabs.query({
    active: true,
    currentWindow: true
}).then(tabs => {
    _globals__WEBPACK_IMPORTED_MODULE_0__["default"].currentTabId = tabs[0].id;
    _globals__WEBPACK_IMPORTED_MODULE_0__["default"].dropCurrentTabId = true;
});

// Set initial window id
browser.windows.getLastFocused({}).then(w => {
    _globals__WEBPACK_IMPORTED_MODULE_0__["default"].currentWindowId = w.id;
    _globals__WEBPACK_IMPORTED_MODULE_0__["default"].dropCurrentWindowId = true;
});

// Watch out for any changes in tabs & windows
browser.tabs.onUpdated.addListener(_event_listeners_tab__WEBPACK_IMPORTED_MODULE_2__["tabUpdated"]);
browser.tabs.onActivated.addListener(_event_listeners_tab__WEBPACK_IMPORTED_MODULE_2__["tabActivated"]);
browser.tabs.onRemoved.addListener(_event_listeners_tab__WEBPACK_IMPORTED_MODULE_2__["tabRemoved"]);
browser.windows.onRemoved.addListener(_event_listeners_window__WEBPACK_IMPORTED_MODULE_3__["windowRemoved"]);
browser.windows.onFocusChanged.addListener(_event_listeners_window__WEBPACK_IMPORTED_MODULE_3__["windowFocusChanged"]);

// Watch out for any commands
browser.commands.onCommand.addListener(_event_listeners_command__WEBPACK_IMPORTED_MODULE_4__["onCommand"]);

// Watch out for any messages
browser.runtime.onMessage.addListener(_event_listeners_message__WEBPACK_IMPORTED_MODULE_1__["onMessage"]);


/***/ }),

/***/ "./src/background/event-listeners/command.js":
/*!***************************************************!*\
  !*** ./src/background/event-listeners/command.js ***!
  \***************************************************/
/*! exports provided: onCommand */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "onCommand", function() { return onCommand; });
/* harmony import */ var _globals__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../globals */ "./src/background/globals.js");


function onCommand(name) {
    switch (name) {
        case "last-used-tab":
            if (_globals__WEBPACK_IMPORTED_MODULE_0__["default"].lastTabId !== undefined) {
                browser.tabs.update(_globals__WEBPACK_IMPORTED_MODULE_0__["default"].lastTabId, {
                    active: true
                });
                browser.windows.getLastFocused({}).then(w => {
                    browser.tabs.get(_globals__WEBPACK_IMPORTED_MODULE_0__["default"].lastTabId).then(tab => {
                        if (w.id !== tab.windowId) {
                            browser.windows.update(tab.windowId, {
                                focused: true
                            });
                            _globals__WEBPACK_IMPORTED_MODULE_0__["default"].lastTabId = _globals__WEBPACK_IMPORTED_MODULE_0__["default"].currentTabId;
                        }
                    });
                });
            }
            break;
        case "last-used-window":
            if (_globals__WEBPACK_IMPORTED_MODULE_0__["default"].lastWindowId !== undefined) {
                browser.windows.update(_globals__WEBPACK_IMPORTED_MODULE_0__["default"].lastWindowId, {
                    focused: true
                });
            }
            break;
    }
}


/***/ }),

/***/ "./src/background/event-listeners/message.js":
/*!***************************************************!*\
  !*** ./src/background/event-listeners/message.js ***!
  \***************************************************/
/*! exports provided: onMessage */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "onMessage", function() { return onMessage; });
/* harmony import */ var _globals__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../globals */ "./src/background/globals.js");


function onMessage(request, sender, sendResponse) {
    switch (request.type) {
        case "WRONG_TO_RIGHT_GET":
            sendResponse({
                wrongToRight: _globals__WEBPACK_IMPORTED_MODULE_0__["default"].wrongToRight
            });
            break;
    }
}


/***/ }),

/***/ "./src/background/event-listeners/tab.js":
/*!***********************************************!*\
  !*** ./src/background/event-listeners/tab.js ***!
  \***********************************************/
/*! exports provided: tabActivated, tabUpdated, tabRemoved */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "tabActivated", function() { return tabActivated; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "tabUpdated", function() { return tabUpdated; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "tabRemoved", function() { return tabRemoved; });
/* harmony import */ var _globals__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../globals */ "./src/background/globals.js");
/* harmony import */ var _messaging__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../messaging */ "./src/background/messaging.js");
/* harmony import */ var _wrong_to_right__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../wrong-to-right */ "./src/background/wrong-to-right.js");




function tabActivated(activeInfo) {
    Object(_messaging__WEBPACK_IMPORTED_MODULE_1__["sendTabMessage"])({
        windowId: activeInfo.windowId,
        tabId: activeInfo.tabId
    }, "ACTIVE_TAB_CHANGED");
    if (_globals__WEBPACK_IMPORTED_MODULE_0__["default"].dropCurrentTabId) {
        _globals__WEBPACK_IMPORTED_MODULE_0__["default"].lastTabId = _globals__WEBPACK_IMPORTED_MODULE_0__["default"].currentTabId;
    } else {
        _globals__WEBPACK_IMPORTED_MODULE_0__["default"].dropCurrentTabId = true;
    }
    _globals__WEBPACK_IMPORTED_MODULE_0__["default"].currentTabId = activeInfo.tabId;
}

function tabUpdated(tabId, changeInfo, tab) {
    if (changeInfo.favIconUrl !== undefined) {
        Object(_messaging__WEBPACK_IMPORTED_MODULE_1__["sendTabMessage"])({
            tabId: Object(_wrong_to_right__WEBPACK_IMPORTED_MODULE_2__["getCorrectTabId"])(tabId),
            favIconUrl: changeInfo.favIconUrl
        }, "TAB_FAV_ICON_CHANGED");
    }
    if (changeInfo.pinned !== undefined) {
        Object(_messaging__WEBPACK_IMPORTED_MODULE_1__["sendTabMessage"])({
            tabId: Object(_wrong_to_right__WEBPACK_IMPORTED_MODULE_2__["getCorrectTabId"])(tabId),
            pinned: changeInfo.pinned
        }, "TAB_PINNED_STATUS_CHANGED");
    }
    if (changeInfo.title !== undefined) {
        Object(_messaging__WEBPACK_IMPORTED_MODULE_1__["sendTabMessage"])({
            tabId: Object(_wrong_to_right__WEBPACK_IMPORTED_MODULE_2__["getCorrectTabId"])(tabId),
            title: changeInfo.title
        }, "TAB_TITLE_CHANGED");
    }
}

function tabRemoved(tabId, removeInfo) {
    Object(_messaging__WEBPACK_IMPORTED_MODULE_1__["sendTabMessage"])({
        tabId: tabId,
        windowId: removeInfo.windowId,
        windowClosing: removeInfo.isWindowClosing
    }, "TAB_REMOVED");
    if (_globals__WEBPACK_IMPORTED_MODULE_0__["default"].lastTabId === tabId) {
        _globals__WEBPACK_IMPORTED_MODULE_0__["default"].lastTabId = undefined;
    }
    if (_globals__WEBPACK_IMPORTED_MODULE_0__["default"].currentTabId === tabId) {
        _globals__WEBPACK_IMPORTED_MODULE_0__["default"].currentTabId = undefined;
        _globals__WEBPACK_IMPORTED_MODULE_0__["default"].dropCurrentTabId = false;
    }
}


/***/ }),

/***/ "./src/background/event-listeners/window.js":
/*!**************************************************!*\
  !*** ./src/background/event-listeners/window.js ***!
  \**************************************************/
/*! exports provided: windowFocusChanged, windowRemoved */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "windowFocusChanged", function() { return windowFocusChanged; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "windowRemoved", function() { return windowRemoved; });
/* harmony import */ var _globals__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../globals */ "./src/background/globals.js");
/* harmony import */ var _messaging__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../messaging */ "./src/background/messaging.js");



function windowFocusChanged(windowId) {
    if (windowId !== browser.windows.WINDOW_ID_NONE) {
        if (_globals__WEBPACK_IMPORTED_MODULE_0__["default"].dropCurrentWindowId) {
            _globals__WEBPACK_IMPORTED_MODULE_0__["default"].lastWindowId = _globals__WEBPACK_IMPORTED_MODULE_0__["default"].currentWindowId;
        } else {
            _globals__WEBPACK_IMPORTED_MODULE_0__["default"].dropCurrentWindowId = true;
        }
        _globals__WEBPACK_IMPORTED_MODULE_0__["default"].currentWindowId = windowId;
        browser.tabs.query({
            active: true,
            windowId: windowId
        }).then(tabs => {
            if (tabs[0].id !== _globals__WEBPACK_IMPORTED_MODULE_0__["default"].currentTabId) {
                if (_globals__WEBPACK_IMPORTED_MODULE_0__["default"].dropCurrentTabId) {
                    _globals__WEBPACK_IMPORTED_MODULE_0__["default"].lastTabId = _globals__WEBPACK_IMPORTED_MODULE_0__["default"].currentTabId;
                } else {
                    _globals__WEBPACK_IMPORTED_MODULE_0__["default"].dropCurrentTabId = true;
                }
                _globals__WEBPACK_IMPORTED_MODULE_0__["default"].currentTabId = tabs[0].id;
            }
        });
    }
}

function windowRemoved(windowId) {
    Object(_messaging__WEBPACK_IMPORTED_MODULE_1__["sendTabMessage"])({
        windowId: windowId
    }, "WINDOW_REMOVED");
    if (_globals__WEBPACK_IMPORTED_MODULE_0__["default"].lastWindowId === windowId) {
        _globals__WEBPACK_IMPORTED_MODULE_0__["default"].lastWindowId = undefined;
    }
    if (_globals__WEBPACK_IMPORTED_MODULE_0__["default"].currentWindowId === windowId) {
        _globals__WEBPACK_IMPORTED_MODULE_0__["default"].currentWindowId = undefined;
        _globals__WEBPACK_IMPORTED_MODULE_0__["default"].dropCurrentWindowId = false;
    }
}


/***/ }),

/***/ "./src/background/globals.js":
/*!***********************************!*\
  !*** ./src/background/globals.js ***!
  \***********************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
const globals = {
    wrongToRight: undefined,
    lastTabId: undefined,
    currentTabId: undefined,
    lastWindowId: undefined,
    currentWindowId: undefined,
    dropCurrentTabId: false,
    dropCurrentWindowId: false
};
/* harmony default export */ __webpack_exports__["default"] = (globals);


/***/ }),

/***/ "./src/background/messaging.js":
/*!*************************************!*\
  !*** ./src/background/messaging.js ***!
  \*************************************/
/*! exports provided: sendTabMessage */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "sendTabMessage", function() { return sendTabMessage; });
// Function to send a message
function sendTabMessage(details, type=undefined) {
    browser.runtime.sendMessage({
        type: type,
        details: details
    });
}


/***/ }),

/***/ "./src/background/wrong-to-right.js":
/*!******************************************!*\
  !*** ./src/background/wrong-to-right.js ***!
  \******************************************/
/*! exports provided: getCorrectTabId */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "getCorrectTabId", function() { return getCorrectTabId; });
/* harmony import */ var _globals__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./globals */ "./src/background/globals.js");


_globals__WEBPACK_IMPORTED_MODULE_0__["default"].wrongToRight = {};
var rightToWrong = {};

browser.tabs.onAttached.addListener(fixOnAttached);
browser.tabs.onRemoved.addListener(fixOnRemoved);

function fixOnAttached(tabId, attachInfo) {
    browser.tabs.get(tabId).then(function (tab){
        if (tabId !== tab.id) {
            let lastWrongId = rightToWrong[tabId];
            if (lastWrongId) {
                delete _globals__WEBPACK_IMPORTED_MODULE_0__["default"].wrongToRight[lastWrongId];
            }
            _globals__WEBPACK_IMPORTED_MODULE_0__["default"].wrongToRight[tab.id] = tabId;
            rightToWrong[tabId] = tab.id;
        }
    });
}

function fixOnRemoved(tabId, removeInfo) {
    let wrongId = rightToWrong[tabId];
    if (wrongId) {
        delete _globals__WEBPACK_IMPORTED_MODULE_0__["default"].wrongToRight[wrongId];
    }
    delete rightToWrong[tabId];
}

function getCorrectTabId(tabId) {
    return _globals__WEBPACK_IMPORTED_MODULE_0__["default"].wrongToRight[tabId] || tabId;
}

/***/ })

/******/ });
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vLy4vc3JjL2JhY2tncm91bmQvYmFja2dyb3VuZC5qcyIsIndlYnBhY2s6Ly8vLi9zcmMvYmFja2dyb3VuZC9ldmVudC1saXN0ZW5lcnMvY29tbWFuZC5qcyIsIndlYnBhY2s6Ly8vLi9zcmMvYmFja2dyb3VuZC9ldmVudC1saXN0ZW5lcnMvbWVzc2FnZS5qcyIsIndlYnBhY2s6Ly8vLi9zcmMvYmFja2dyb3VuZC9ldmVudC1saXN0ZW5lcnMvdGFiLmpzIiwid2VicGFjazovLy8uL3NyYy9iYWNrZ3JvdW5kL2V2ZW50LWxpc3RlbmVycy93aW5kb3cuanMiLCJ3ZWJwYWNrOi8vLy4vc3JjL2JhY2tncm91bmQvZ2xvYmFscy5qcyIsIndlYnBhY2s6Ly8vLi9zcmMvYmFja2dyb3VuZC9tZXNzYWdpbmcuanMiLCJ3ZWJwYWNrOi8vLy4vc3JjL2JhY2tncm91bmQvd3JvbmctdG8tcmlnaHQuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOzs7QUFHQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0Esa0RBQTBDLGdDQUFnQztBQUMxRTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLGdFQUF3RCxrQkFBa0I7QUFDMUU7QUFDQSx5REFBaUQsY0FBYztBQUMvRDs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsaURBQXlDLGlDQUFpQztBQUMxRSx3SEFBZ0gsbUJBQW1CLEVBQUU7QUFDckk7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxtQ0FBMkIsMEJBQTBCLEVBQUU7QUFDdkQseUNBQWlDLGVBQWU7QUFDaEQ7QUFDQTtBQUNBOztBQUVBO0FBQ0EsOERBQXNELCtEQUErRDs7QUFFckg7QUFDQTs7O0FBR0E7QUFDQTs7Ozs7Ozs7Ozs7OztBQ2xGQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBeUI7QUFDNEI7QUFDdUI7QUFDQTtBQUN2Qjs7QUFFckQ7QUFDQTtBQUNBO0FBQ0E7QUFDQSxDQUFDO0FBQ0QsSUFBSSxnREFBQztBQUNMLElBQUksZ0RBQUM7QUFDTCxDQUFDOztBQUVEO0FBQ0EsaUNBQWlDO0FBQ2pDLElBQUksZ0RBQUM7QUFDTCxJQUFJLGdEQUFDO0FBQ0wsQ0FBQzs7QUFFRDtBQUNBLG1DQUFtQywrREFBVTtBQUM3QyxxQ0FBcUMsaUVBQVk7QUFDakQsbUNBQW1DLCtEQUFVO0FBQzdDLHNDQUFzQyxxRUFBYTtBQUNuRCwyQ0FBMkMsMEVBQWtCOztBQUU3RDtBQUNBLHVDQUF1QyxrRUFBUzs7QUFFaEQ7QUFDQSxzQ0FBc0Msa0VBQVM7Ozs7Ozs7Ozs7Ozs7QUNoQy9DO0FBQUE7QUFBQTtBQUEwQjs7QUFFbkI7QUFDUDtBQUNBO0FBQ0EsZ0JBQWdCLGdEQUFDO0FBQ2pCLG9DQUFvQyxnREFBQztBQUNyQztBQUNBLGlCQUFpQjtBQUNqQixpREFBaUQ7QUFDakQscUNBQXFDLGdEQUFDO0FBQ3RDO0FBQ0E7QUFDQTtBQUNBLDZCQUE2QjtBQUM3Qiw0QkFBNEIsZ0RBQUMsYUFBYSxnREFBQztBQUMzQztBQUNBLHFCQUFxQjtBQUNyQixpQkFBaUI7QUFDakI7QUFDQTtBQUNBO0FBQ0EsZ0JBQWdCLGdEQUFDO0FBQ2pCLHVDQUF1QyxnREFBQztBQUN4QztBQUNBLGlCQUFpQjtBQUNqQjtBQUNBO0FBQ0E7QUFDQTs7Ozs7Ozs7Ozs7OztBQzdCQTtBQUFBO0FBQUE7QUFBMEI7O0FBRW5CO0FBQ1A7QUFDQTtBQUNBO0FBQ0EsOEJBQThCLGdEQUFDO0FBQy9CLGFBQWE7QUFDYjtBQUNBO0FBQ0E7Ozs7Ozs7Ozs7Ozs7QUNWQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUEwQjtBQUNtQjtBQUNNOztBQUU1QztBQUNQLElBQUksaUVBQWM7QUFDbEI7QUFDQTtBQUNBLEtBQUs7QUFDTCxRQUFRLGdEQUFDO0FBQ1QsUUFBUSxnREFBQyxhQUFhLGdEQUFDO0FBQ3ZCLEtBQUs7QUFDTCxRQUFRLGdEQUFDO0FBQ1Q7QUFDQSxJQUFJLGdEQUFDO0FBQ0w7O0FBRU87QUFDUDtBQUNBLFFBQVEsaUVBQWM7QUFDdEIsbUJBQW1CLHVFQUFlO0FBQ2xDO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQSxRQUFRLGlFQUFjO0FBQ3RCLG1CQUFtQix1RUFBZTtBQUNsQztBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0EsUUFBUSxpRUFBYztBQUN0QixtQkFBbUIsdUVBQWU7QUFDbEM7QUFDQSxTQUFTO0FBQ1Q7QUFDQTs7QUFFTztBQUNQLElBQUksaUVBQWM7QUFDbEI7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMLFFBQVEsZ0RBQUM7QUFDVCxRQUFRLGdEQUFDO0FBQ1Q7QUFDQSxRQUFRLGdEQUFDO0FBQ1QsUUFBUSxnREFBQztBQUNULFFBQVEsZ0RBQUM7QUFDVDtBQUNBOzs7Ozs7Ozs7Ozs7O0FDbkRBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBMEI7QUFDbUI7O0FBRXRDO0FBQ1A7QUFDQSxZQUFZLGdEQUFDO0FBQ2IsWUFBWSxnREFBQyxnQkFBZ0IsZ0RBQUM7QUFDOUIsU0FBUztBQUNULFlBQVksZ0RBQUM7QUFDYjtBQUNBLFFBQVEsZ0RBQUM7QUFDVDtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1QsK0JBQStCLGdEQUFDO0FBQ2hDLG9CQUFvQixnREFBQztBQUNyQixvQkFBb0IsZ0RBQUMsYUFBYSxnREFBQztBQUNuQyxpQkFBaUI7QUFDakIsb0JBQW9CLGdEQUFDO0FBQ3JCO0FBQ0EsZ0JBQWdCLGdEQUFDO0FBQ2pCO0FBQ0EsU0FBUztBQUNUO0FBQ0E7O0FBRU87QUFDUCxJQUFJLGlFQUFjO0FBQ2xCO0FBQ0EsS0FBSztBQUNMLFFBQVEsZ0RBQUM7QUFDVCxRQUFRLGdEQUFDO0FBQ1Q7QUFDQSxRQUFRLGdEQUFDO0FBQ1QsUUFBUSxnREFBQztBQUNULFFBQVEsZ0RBQUM7QUFDVDtBQUNBOzs7Ozs7Ozs7Ozs7O0FDdENBO0FBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ2Usc0VBQU8sRUFBQzs7Ozs7Ozs7Ozs7OztBQ1R2QjtBQUFBO0FBQUE7QUFDTztBQUNQO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDs7Ozs7Ozs7Ozs7OztBQ05BO0FBQUE7QUFBQTtBQUF5Qjs7QUFFekIsZ0RBQUM7QUFDRDs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSx1QkFBdUIsZ0RBQUM7QUFDeEI7QUFDQSxZQUFZLGdEQUFDO0FBQ2I7QUFDQTtBQUNBLEtBQUs7QUFDTDs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxlQUFlLGdEQUFDO0FBQ2hCO0FBQ0E7QUFDQTs7QUFFTztBQUNQLFdBQVcsZ0RBQUM7QUFDWixDIiwiZmlsZSI6ImJhY2tncm91bmQvYmFja2dyb3VuZC5qcyIsInNvdXJjZXNDb250ZW50IjpbIiBcdC8vIFRoZSBtb2R1bGUgY2FjaGVcbiBcdHZhciBpbnN0YWxsZWRNb2R1bGVzID0ge307XG5cbiBcdC8vIFRoZSByZXF1aXJlIGZ1bmN0aW9uXG4gXHRmdW5jdGlvbiBfX3dlYnBhY2tfcmVxdWlyZV9fKG1vZHVsZUlkKSB7XG5cbiBcdFx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGlzIGluIGNhY2hlXG4gXHRcdGlmKGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdKSB7XG4gXHRcdFx0cmV0dXJuIGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdLmV4cG9ydHM7XG4gXHRcdH1cbiBcdFx0Ly8gQ3JlYXRlIGEgbmV3IG1vZHVsZSAoYW5kIHB1dCBpdCBpbnRvIHRoZSBjYWNoZSlcbiBcdFx0dmFyIG1vZHVsZSA9IGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdID0ge1xuIFx0XHRcdGk6IG1vZHVsZUlkLFxuIFx0XHRcdGw6IGZhbHNlLFxuIFx0XHRcdGV4cG9ydHM6IHt9XG4gXHRcdH07XG5cbiBcdFx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG4gXHRcdG1vZHVsZXNbbW9kdWxlSWRdLmNhbGwobW9kdWxlLmV4cG9ydHMsIG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuXG4gXHRcdC8vIEZsYWcgdGhlIG1vZHVsZSBhcyBsb2FkZWRcbiBcdFx0bW9kdWxlLmwgPSB0cnVlO1xuXG4gXHRcdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG4gXHRcdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbiBcdH1cblxuXG4gXHQvLyBleHBvc2UgdGhlIG1vZHVsZXMgb2JqZWN0IChfX3dlYnBhY2tfbW9kdWxlc19fKVxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5tID0gbW9kdWxlcztcblxuIFx0Ly8gZXhwb3NlIHRoZSBtb2R1bGUgY2FjaGVcbiBcdF9fd2VicGFja19yZXF1aXJlX18uYyA9IGluc3RhbGxlZE1vZHVsZXM7XG5cbiBcdC8vIGRlZmluZSBnZXR0ZXIgZnVuY3Rpb24gZm9yIGhhcm1vbnkgZXhwb3J0c1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5kID0gZnVuY3Rpb24oZXhwb3J0cywgbmFtZSwgZ2V0dGVyKSB7XG4gXHRcdGlmKCFfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZXhwb3J0cywgbmFtZSkpIHtcbiBcdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgbmFtZSwgeyBlbnVtZXJhYmxlOiB0cnVlLCBnZXQ6IGdldHRlciB9KTtcbiBcdFx0fVxuIFx0fTtcblxuIFx0Ly8gZGVmaW5lIF9fZXNNb2R1bGUgb24gZXhwb3J0c1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5yID0gZnVuY3Rpb24oZXhwb3J0cykge1xuIFx0XHRpZih0eXBlb2YgU3ltYm9sICE9PSAndW5kZWZpbmVkJyAmJiBTeW1ib2wudG9TdHJpbmdUYWcpIHtcbiBcdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgU3ltYm9sLnRvU3RyaW5nVGFnLCB7IHZhbHVlOiAnTW9kdWxlJyB9KTtcbiBcdFx0fVxuIFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ19fZXNNb2R1bGUnLCB7IHZhbHVlOiB0cnVlIH0pO1xuIFx0fTtcblxuIFx0Ly8gY3JlYXRlIGEgZmFrZSBuYW1lc3BhY2Ugb2JqZWN0XG4gXHQvLyBtb2RlICYgMTogdmFsdWUgaXMgYSBtb2R1bGUgaWQsIHJlcXVpcmUgaXRcbiBcdC8vIG1vZGUgJiAyOiBtZXJnZSBhbGwgcHJvcGVydGllcyBvZiB2YWx1ZSBpbnRvIHRoZSBuc1xuIFx0Ly8gbW9kZSAmIDQ6IHJldHVybiB2YWx1ZSB3aGVuIGFscmVhZHkgbnMgb2JqZWN0XG4gXHQvLyBtb2RlICYgOHwxOiBiZWhhdmUgbGlrZSByZXF1aXJlXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLnQgPSBmdW5jdGlvbih2YWx1ZSwgbW9kZSkge1xuIFx0XHRpZihtb2RlICYgMSkgdmFsdWUgPSBfX3dlYnBhY2tfcmVxdWlyZV9fKHZhbHVlKTtcbiBcdFx0aWYobW9kZSAmIDgpIHJldHVybiB2YWx1ZTtcbiBcdFx0aWYoKG1vZGUgJiA0KSAmJiB0eXBlb2YgdmFsdWUgPT09ICdvYmplY3QnICYmIHZhbHVlICYmIHZhbHVlLl9fZXNNb2R1bGUpIHJldHVybiB2YWx1ZTtcbiBcdFx0dmFyIG5zID0gT2JqZWN0LmNyZWF0ZShudWxsKTtcbiBcdFx0X193ZWJwYWNrX3JlcXVpcmVfXy5yKG5zKTtcbiBcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KG5zLCAnZGVmYXVsdCcsIHsgZW51bWVyYWJsZTogdHJ1ZSwgdmFsdWU6IHZhbHVlIH0pO1xuIFx0XHRpZihtb2RlICYgMiAmJiB0eXBlb2YgdmFsdWUgIT0gJ3N0cmluZycpIGZvcih2YXIga2V5IGluIHZhbHVlKSBfX3dlYnBhY2tfcmVxdWlyZV9fLmQobnMsIGtleSwgZnVuY3Rpb24oa2V5KSB7IHJldHVybiB2YWx1ZVtrZXldOyB9LmJpbmQobnVsbCwga2V5KSk7XG4gXHRcdHJldHVybiBucztcbiBcdH07XG5cbiBcdC8vIGdldERlZmF1bHRFeHBvcnQgZnVuY3Rpb24gZm9yIGNvbXBhdGliaWxpdHkgd2l0aCBub24taGFybW9ueSBtb2R1bGVzXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm4gPSBmdW5jdGlvbihtb2R1bGUpIHtcbiBcdFx0dmFyIGdldHRlciA9IG1vZHVsZSAmJiBtb2R1bGUuX19lc01vZHVsZSA/XG4gXHRcdFx0ZnVuY3Rpb24gZ2V0RGVmYXVsdCgpIHsgcmV0dXJuIG1vZHVsZVsnZGVmYXVsdCddOyB9IDpcbiBcdFx0XHRmdW5jdGlvbiBnZXRNb2R1bGVFeHBvcnRzKCkgeyByZXR1cm4gbW9kdWxlOyB9O1xuIFx0XHRfX3dlYnBhY2tfcmVxdWlyZV9fLmQoZ2V0dGVyLCAnYScsIGdldHRlcik7XG4gXHRcdHJldHVybiBnZXR0ZXI7XG4gXHR9O1xuXG4gXHQvLyBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGxcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubyA9IGZ1bmN0aW9uKG9iamVjdCwgcHJvcGVydHkpIHsgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmplY3QsIHByb3BlcnR5KTsgfTtcblxuIFx0Ly8gX193ZWJwYWNrX3B1YmxpY19wYXRoX19cbiBcdF9fd2VicGFja19yZXF1aXJlX18ucCA9IFwiXCI7XG5cblxuIFx0Ly8gTG9hZCBlbnRyeSBtb2R1bGUgYW5kIHJldHVybiBleHBvcnRzXG4gXHRyZXR1cm4gX193ZWJwYWNrX3JlcXVpcmVfXyhfX3dlYnBhY2tfcmVxdWlyZV9fLnMgPSBcIi4vc3JjL2JhY2tncm91bmQvYmFja2dyb3VuZC5qc1wiKTtcbiIsImltcG9ydCBHIGZyb20gXCIuL2dsb2JhbHNcIlxuaW1wb3J0IHsgb25NZXNzYWdlIH0gZnJvbSBcIi4vZXZlbnQtbGlzdGVuZXJzL21lc3NhZ2VcIlxuaW1wb3J0IHsgdGFiQWN0aXZhdGVkLCB0YWJVcGRhdGVkLCB0YWJSZW1vdmVkIH0gZnJvbSBcIi4vZXZlbnQtbGlzdGVuZXJzL3RhYlwiXG5pbXBvcnQgeyB3aW5kb3dGb2N1c0NoYW5nZWQsIHdpbmRvd1JlbW92ZWQgfSBmcm9tIFwiLi9ldmVudC1saXN0ZW5lcnMvd2luZG93XCJcbmltcG9ydCB7IG9uQ29tbWFuZCB9IGZyb20gXCIuL2V2ZW50LWxpc3RlbmVycy9jb21tYW5kXCJcblxuLy8gU2V0IGluaXRpYWwgdGFiIGlkXG5icm93c2VyLnRhYnMucXVlcnkoe1xuICAgIGFjdGl2ZTogdHJ1ZSxcbiAgICBjdXJyZW50V2luZG93OiB0cnVlXG59KS50aGVuKHRhYnMgPT4ge1xuICAgIEcuY3VycmVudFRhYklkID0gdGFic1swXS5pZDtcbiAgICBHLmRyb3BDdXJyZW50VGFiSWQgPSB0cnVlO1xufSk7XG5cbi8vIFNldCBpbml0aWFsIHdpbmRvdyBpZFxuYnJvd3Nlci53aW5kb3dzLmdldExhc3RGb2N1c2VkKHt9KS50aGVuKHcgPT4ge1xuICAgIEcuY3VycmVudFdpbmRvd0lkID0gdy5pZDtcbiAgICBHLmRyb3BDdXJyZW50V2luZG93SWQgPSB0cnVlO1xufSk7XG5cbi8vIFdhdGNoIG91dCBmb3IgYW55IGNoYW5nZXMgaW4gdGFicyAmIHdpbmRvd3NcbmJyb3dzZXIudGFicy5vblVwZGF0ZWQuYWRkTGlzdGVuZXIodGFiVXBkYXRlZCk7XG5icm93c2VyLnRhYnMub25BY3RpdmF0ZWQuYWRkTGlzdGVuZXIodGFiQWN0aXZhdGVkKTtcbmJyb3dzZXIudGFicy5vblJlbW92ZWQuYWRkTGlzdGVuZXIodGFiUmVtb3ZlZCk7XG5icm93c2VyLndpbmRvd3Mub25SZW1vdmVkLmFkZExpc3RlbmVyKHdpbmRvd1JlbW92ZWQpO1xuYnJvd3Nlci53aW5kb3dzLm9uRm9jdXNDaGFuZ2VkLmFkZExpc3RlbmVyKHdpbmRvd0ZvY3VzQ2hhbmdlZCk7XG5cbi8vIFdhdGNoIG91dCBmb3IgYW55IGNvbW1hbmRzXG5icm93c2VyLmNvbW1hbmRzLm9uQ29tbWFuZC5hZGRMaXN0ZW5lcihvbkNvbW1hbmQpO1xuXG4vLyBXYXRjaCBvdXQgZm9yIGFueSBtZXNzYWdlc1xuYnJvd3Nlci5ydW50aW1lLm9uTWVzc2FnZS5hZGRMaXN0ZW5lcihvbk1lc3NhZ2UpO1xuIiwiaW1wb3J0IEcgZnJvbSBcIi4uL2dsb2JhbHNcIlxuXG5leHBvcnQgZnVuY3Rpb24gb25Db21tYW5kKG5hbWUpIHtcbiAgICBzd2l0Y2ggKG5hbWUpIHtcbiAgICAgICAgY2FzZSBcImxhc3QtdXNlZC10YWJcIjpcbiAgICAgICAgICAgIGlmIChHLmxhc3RUYWJJZCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgYnJvd3Nlci50YWJzLnVwZGF0ZShHLmxhc3RUYWJJZCwge1xuICAgICAgICAgICAgICAgICAgICBhY3RpdmU6IHRydWVcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICBicm93c2VyLndpbmRvd3MuZ2V0TGFzdEZvY3VzZWQoe30pLnRoZW4odyA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGJyb3dzZXIudGFicy5nZXQoRy5sYXN0VGFiSWQpLnRoZW4odGFiID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICh3LmlkICE9PSB0YWIud2luZG93SWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicm93c2VyLndpbmRvd3MudXBkYXRlKHRhYi53aW5kb3dJZCwge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmb2N1c2VkOiB0cnVlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgRy5sYXN0VGFiSWQgPSBHLmN1cnJlbnRUYWJJZDtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSBcImxhc3QtdXNlZC13aW5kb3dcIjpcbiAgICAgICAgICAgIGlmIChHLmxhc3RXaW5kb3dJZCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgYnJvd3Nlci53aW5kb3dzLnVwZGF0ZShHLmxhc3RXaW5kb3dJZCwge1xuICAgICAgICAgICAgICAgICAgICBmb2N1c2VkOiB0cnVlXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBicmVhaztcbiAgICB9XG59XG4iLCJpbXBvcnQgRyBmcm9tIFwiLi4vZ2xvYmFsc1wiXG5cbmV4cG9ydCBmdW5jdGlvbiBvbk1lc3NhZ2UocmVxdWVzdCwgc2VuZGVyLCBzZW5kUmVzcG9uc2UpIHtcbiAgICBzd2l0Y2ggKHJlcXVlc3QudHlwZSkge1xuICAgICAgICBjYXNlIFwiV1JPTkdfVE9fUklHSFRfR0VUXCI6XG4gICAgICAgICAgICBzZW5kUmVzcG9uc2Uoe1xuICAgICAgICAgICAgICAgIHdyb25nVG9SaWdodDogRy53cm9uZ1RvUmlnaHRcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgfVxufVxuIiwiaW1wb3J0IEcgZnJvbSBcIi4uL2dsb2JhbHNcIlxuaW1wb3J0IHsgc2VuZFRhYk1lc3NhZ2UgfSBmcm9tIFwiLi4vbWVzc2FnaW5nXCJcbmltcG9ydCB7IGdldENvcnJlY3RUYWJJZCB9IGZyb20gXCIuLi93cm9uZy10by1yaWdodFwiXG5cbmV4cG9ydCBmdW5jdGlvbiB0YWJBY3RpdmF0ZWQoYWN0aXZlSW5mbykge1xuICAgIHNlbmRUYWJNZXNzYWdlKHtcbiAgICAgICAgd2luZG93SWQ6IGFjdGl2ZUluZm8ud2luZG93SWQsXG4gICAgICAgIHRhYklkOiBhY3RpdmVJbmZvLnRhYklkXG4gICAgfSwgXCJBQ1RJVkVfVEFCX0NIQU5HRURcIik7XG4gICAgaWYgKEcuZHJvcEN1cnJlbnRUYWJJZCkge1xuICAgICAgICBHLmxhc3RUYWJJZCA9IEcuY3VycmVudFRhYklkO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIEcuZHJvcEN1cnJlbnRUYWJJZCA9IHRydWU7XG4gICAgfVxuICAgIEcuY3VycmVudFRhYklkID0gYWN0aXZlSW5mby50YWJJZDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHRhYlVwZGF0ZWQodGFiSWQsIGNoYW5nZUluZm8sIHRhYikge1xuICAgIGlmIChjaGFuZ2VJbmZvLmZhdkljb25VcmwgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICBzZW5kVGFiTWVzc2FnZSh7XG4gICAgICAgICAgICB0YWJJZDogZ2V0Q29ycmVjdFRhYklkKHRhYklkKSxcbiAgICAgICAgICAgIGZhdkljb25Vcmw6IGNoYW5nZUluZm8uZmF2SWNvblVybFxuICAgICAgICB9LCBcIlRBQl9GQVZfSUNPTl9DSEFOR0VEXCIpO1xuICAgIH1cbiAgICBpZiAoY2hhbmdlSW5mby5waW5uZWQgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICBzZW5kVGFiTWVzc2FnZSh7XG4gICAgICAgICAgICB0YWJJZDogZ2V0Q29ycmVjdFRhYklkKHRhYklkKSxcbiAgICAgICAgICAgIHBpbm5lZDogY2hhbmdlSW5mby5waW5uZWRcbiAgICAgICAgfSwgXCJUQUJfUElOTkVEX1NUQVRVU19DSEFOR0VEXCIpO1xuICAgIH1cbiAgICBpZiAoY2hhbmdlSW5mby50aXRsZSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIHNlbmRUYWJNZXNzYWdlKHtcbiAgICAgICAgICAgIHRhYklkOiBnZXRDb3JyZWN0VGFiSWQodGFiSWQpLFxuICAgICAgICAgICAgdGl0bGU6IGNoYW5nZUluZm8udGl0bGVcbiAgICAgICAgfSwgXCJUQUJfVElUTEVfQ0hBTkdFRFwiKTtcbiAgICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiB0YWJSZW1vdmVkKHRhYklkLCByZW1vdmVJbmZvKSB7XG4gICAgc2VuZFRhYk1lc3NhZ2Uoe1xuICAgICAgICB0YWJJZDogdGFiSWQsXG4gICAgICAgIHdpbmRvd0lkOiByZW1vdmVJbmZvLndpbmRvd0lkLFxuICAgICAgICB3aW5kb3dDbG9zaW5nOiByZW1vdmVJbmZvLmlzV2luZG93Q2xvc2luZ1xuICAgIH0sIFwiVEFCX1JFTU9WRURcIik7XG4gICAgaWYgKEcubGFzdFRhYklkID09PSB0YWJJZCkge1xuICAgICAgICBHLmxhc3RUYWJJZCA9IHVuZGVmaW5lZDtcbiAgICB9XG4gICAgaWYgKEcuY3VycmVudFRhYklkID09PSB0YWJJZCkge1xuICAgICAgICBHLmN1cnJlbnRUYWJJZCA9IHVuZGVmaW5lZDtcbiAgICAgICAgRy5kcm9wQ3VycmVudFRhYklkID0gZmFsc2U7XG4gICAgfVxufVxuIiwiaW1wb3J0IEcgZnJvbSBcIi4uL2dsb2JhbHNcIlxuaW1wb3J0IHsgc2VuZFRhYk1lc3NhZ2UgfSBmcm9tIFwiLi4vbWVzc2FnaW5nXCJcblxuZXhwb3J0IGZ1bmN0aW9uIHdpbmRvd0ZvY3VzQ2hhbmdlZCh3aW5kb3dJZCkge1xuICAgIGlmICh3aW5kb3dJZCAhPT0gYnJvd3Nlci53aW5kb3dzLldJTkRPV19JRF9OT05FKSB7XG4gICAgICAgIGlmIChHLmRyb3BDdXJyZW50V2luZG93SWQpIHtcbiAgICAgICAgICAgIEcubGFzdFdpbmRvd0lkID0gRy5jdXJyZW50V2luZG93SWQ7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBHLmRyb3BDdXJyZW50V2luZG93SWQgPSB0cnVlO1xuICAgICAgICB9XG4gICAgICAgIEcuY3VycmVudFdpbmRvd0lkID0gd2luZG93SWQ7XG4gICAgICAgIGJyb3dzZXIudGFicy5xdWVyeSh7XG4gICAgICAgICAgICBhY3RpdmU6IHRydWUsXG4gICAgICAgICAgICB3aW5kb3dJZDogd2luZG93SWRcbiAgICAgICAgfSkudGhlbih0YWJzID0+IHtcbiAgICAgICAgICAgIGlmICh0YWJzWzBdLmlkICE9PSBHLmN1cnJlbnRUYWJJZCkge1xuICAgICAgICAgICAgICAgIGlmIChHLmRyb3BDdXJyZW50VGFiSWQpIHtcbiAgICAgICAgICAgICAgICAgICAgRy5sYXN0VGFiSWQgPSBHLmN1cnJlbnRUYWJJZDtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBHLmRyb3BDdXJyZW50VGFiSWQgPSB0cnVlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBHLmN1cnJlbnRUYWJJZCA9IHRhYnNbMF0uaWQ7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHdpbmRvd1JlbW92ZWQod2luZG93SWQpIHtcbiAgICBzZW5kVGFiTWVzc2FnZSh7XG4gICAgICAgIHdpbmRvd0lkOiB3aW5kb3dJZFxuICAgIH0sIFwiV0lORE9XX1JFTU9WRURcIik7XG4gICAgaWYgKEcubGFzdFdpbmRvd0lkID09PSB3aW5kb3dJZCkge1xuICAgICAgICBHLmxhc3RXaW5kb3dJZCA9IHVuZGVmaW5lZDtcbiAgICB9XG4gICAgaWYgKEcuY3VycmVudFdpbmRvd0lkID09PSB3aW5kb3dJZCkge1xuICAgICAgICBHLmN1cnJlbnRXaW5kb3dJZCA9IHVuZGVmaW5lZDtcbiAgICAgICAgRy5kcm9wQ3VycmVudFdpbmRvd0lkID0gZmFsc2U7XG4gICAgfVxufVxuIiwiY29uc3QgZ2xvYmFscyA9IHtcbiAgICB3cm9uZ1RvUmlnaHQ6IHVuZGVmaW5lZCxcbiAgICBsYXN0VGFiSWQ6IHVuZGVmaW5lZCxcbiAgICBjdXJyZW50VGFiSWQ6IHVuZGVmaW5lZCxcbiAgICBsYXN0V2luZG93SWQ6IHVuZGVmaW5lZCxcbiAgICBjdXJyZW50V2luZG93SWQ6IHVuZGVmaW5lZCxcbiAgICBkcm9wQ3VycmVudFRhYklkOiBmYWxzZSxcbiAgICBkcm9wQ3VycmVudFdpbmRvd0lkOiBmYWxzZVxufTtcbmV4cG9ydCBkZWZhdWx0IGdsb2JhbHM7XG4iLCIvLyBGdW5jdGlvbiB0byBzZW5kIGEgbWVzc2FnZVxuZXhwb3J0IGZ1bmN0aW9uIHNlbmRUYWJNZXNzYWdlKGRldGFpbHMsIHR5cGU9dW5kZWZpbmVkKSB7XG4gICAgYnJvd3Nlci5ydW50aW1lLnNlbmRNZXNzYWdlKHtcbiAgICAgICAgdHlwZTogdHlwZSxcbiAgICAgICAgZGV0YWlsczogZGV0YWlsc1xuICAgIH0pO1xufVxuIiwiaW1wb3J0IEcgZnJvbSBcIi4vZ2xvYmFsc1wiXG5cbkcud3JvbmdUb1JpZ2h0ID0ge307XG52YXIgcmlnaHRUb1dyb25nID0ge307XG5cbmJyb3dzZXIudGFicy5vbkF0dGFjaGVkLmFkZExpc3RlbmVyKGZpeE9uQXR0YWNoZWQpO1xuYnJvd3Nlci50YWJzLm9uUmVtb3ZlZC5hZGRMaXN0ZW5lcihmaXhPblJlbW92ZWQpO1xuXG5mdW5jdGlvbiBmaXhPbkF0dGFjaGVkKHRhYklkLCBhdHRhY2hJbmZvKSB7XG4gICAgYnJvd3Nlci50YWJzLmdldCh0YWJJZCkudGhlbihmdW5jdGlvbiAodGFiKXtcbiAgICAgICAgaWYgKHRhYklkICE9PSB0YWIuaWQpIHtcbiAgICAgICAgICAgIGxldCBsYXN0V3JvbmdJZCA9IHJpZ2h0VG9Xcm9uZ1t0YWJJZF07XG4gICAgICAgICAgICBpZiAobGFzdFdyb25nSWQpIHtcbiAgICAgICAgICAgICAgICBkZWxldGUgRy53cm9uZ1RvUmlnaHRbbGFzdFdyb25nSWRdO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgRy53cm9uZ1RvUmlnaHRbdGFiLmlkXSA9IHRhYklkO1xuICAgICAgICAgICAgcmlnaHRUb1dyb25nW3RhYklkXSA9IHRhYi5pZDtcbiAgICAgICAgfVxuICAgIH0pO1xufVxuXG5mdW5jdGlvbiBmaXhPblJlbW92ZWQodGFiSWQsIHJlbW92ZUluZm8pIHtcbiAgICBsZXQgd3JvbmdJZCA9IHJpZ2h0VG9Xcm9uZ1t0YWJJZF07XG4gICAgaWYgKHdyb25nSWQpIHtcbiAgICAgICAgZGVsZXRlIEcud3JvbmdUb1JpZ2h0W3dyb25nSWRdO1xuICAgIH1cbiAgICBkZWxldGUgcmlnaHRUb1dyb25nW3RhYklkXTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldENvcnJlY3RUYWJJZCh0YWJJZCkge1xuICAgIHJldHVybiBHLndyb25nVG9SaWdodFt0YWJJZF0gfHwgdGFiSWQ7XG59Il0sInNvdXJjZVJvb3QiOiIifQ==
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
/******/ 	return __webpack_require__(__webpack_require__.s = "./src/background.js");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./src/background.js":
/*!***************************!*\
  !*** ./src/background.js ***!
  \***************************/
/*! no static exports found */
/***/ (function(module, exports) {

var lastTabId;
var currentTabId;
var lastWindowId;
var currentWindowId;
var dropCurrentTabId = false;
var dropCurrentWindowId = false;

// Function to send a message
function sendTabMessage(details, type=undefined) {
    browser.runtime.sendMessage({
        type: type,
        details: details
    });
}

// Set initial tab id
browser.tabs.query({
    active: true,
    currentWindow: true
}).then(tabs => {
    currentTabId = tabs[0].id;
    dropCurrentTabId = true;
});

// Set initial window id
browser.windows.getLastFocused({}).then(w => {
    currentWindowId = w.id;
    dropCurrentWindowId = true;
});

/********** Fix for cross-window dragging issue **********/
var wrongToRight = {};
var rightToWrong = {};

browser.tabs.onAttached.addListener(fixOnAttached);
browser.tabs.onRemoved.addListener(fixOnRemoved);
browser.runtime.onMessage.addListener(onMessage);

function fixOnAttached(tabId, attachInfo) {
    browser.tabs.get(tabId).then(function (tab){
        if (tabId !== tab.id) {
            let lastWrongId = rightToWrong[tabId];
            if (lastWrongId) {
                delete wrongToRight[lastWrongId];
            }
            wrongToRight[tab.id] = tabId;
            rightToWrong[tabId] = tab.id;
        }
    });
}

function fixOnRemoved(tabId, removeInfo) {
    let wrongId = rightToWrong[tabId];
    if (wrongId) {
        delete wrongToRight[wrongId];
    }
    delete rightToWrong[tabId];
}

function getCorrectTabId(tabId) {
    return wrongToRight[tabId] || tabId;
}

function onMessage(request, sender, sendResponse) {
    switch (request.type) {
        case "WRONG_TO_RIGHT_GET":
            sendResponse({
                wrongToRight: wrongToRight
            });
            break;
    }
}
/********** Fix for cross-window dragging issue end **********/

// Watch out for any changes in tabs
browser.tabs.onUpdated.addListener(tabUpdated);
browser.tabs.onActivated.addListener(tabActivated);
browser.tabs.onRemoved.addListener(tabRemoved);
browser.commands.onCommand.addListener(onCommand);
browser.windows.onRemoved.addListener(windowRemoved);
browser.windows.onFocusChanged.addListener(windowFocusChanged);

function tabActivated(activeInfo) {
    sendTabMessage({
        windowId: activeInfo.windowId,
        tabId: activeInfo.tabId
    }, "ACTIVE_TAB_CHANGED");
    if (dropCurrentTabId) {
        lastTabId = currentTabId;
    } else {
        dropCurrentTabId = true;
    }
    currentTabId = activeInfo.tabId;
}

function tabUpdated(tabId, changeInfo, tab) {
    if (changeInfo.favIconUrl !== undefined) {
        sendTabMessage({
            tabId: getCorrectTabId(tabId),
            favIconUrl: changeInfo.favIconUrl
        }, "TAB_FAV_ICON_CHANGED");
    }
    if (changeInfo.pinned !== undefined) {
        sendTabMessage({
            tabId: getCorrectTabId(tabId),
            pinned: changeInfo.pinned
        }, "TAB_PINNED_STATUS_CHANGED");
    }
    if (changeInfo.title !== undefined) {
        sendTabMessage({
            tabId: getCorrectTabId(tabId),
            title: changeInfo.title
        }, "TAB_TITLE_CHANGED");
    }
}

function tabRemoved(tabId, removeInfo) {
    sendTabMessage({
        tabId: tabId,
        windowId: removeInfo.windowId,
        windowClosing: removeInfo.isWindowClosing
    }, "TAB_REMOVED");
    if (lastTabId === tabId) {
        lastTabId = undefined;
    }
    if (currentTabId === tabId) {
        currentTabId = undefined;
        dropCurrentTabId = false;
    }
}

function windowFocusChanged(windowId) {
    if (windowId !== browser.windows.WINDOW_ID_NONE) {
        if (dropCurrentWindowId) {
            lastWindowId = currentWindowId;
        } else {
            dropCurrentWindowId = true;
        }
        currentWindowId = windowId;
        browser.tabs.query({
            active: true,
            windowId: windowId
        }).then(tabs => {
            if (tabs[0].id !== currentTabId) {
                if (dropCurrentTabId) {
                    lastTabId = currentTabId;
                } else {
                    dropCurrentTabId = true;
                }
                currentTabId = tabs[0].id;
            }
        });
    }
}

function windowRemoved(windowId) {
    sendTabMessage({
        windowId: windowId
    }, "WINDOW_REMOVED");
    if (lastWindowId === windowId) {
        lastWindowId = undefined;
    }
    if (currentWindowId === windowId) {
        currentWindowId = undefined;
        dropCurrentWindowId = false;
    }
}

function onCommand(name) {
    switch (name) {
        case "last-used-tab":
            if (lastTabId !== undefined) {
                browser.tabs.update(lastTabId, {
                    active: true
                });
                browser.windows.getLastFocused({}).then(w => {
                    browser.tabs.get(lastTabId).then(tab => {
                        if (w.id !== tab.windowId) {
                            browser.windows.update(tab.windowId, {
                                focused: true
                            });
                            lastTabId = currentTabId;
                        }
                    });
                });
            }
            break;
        case "last-used-window":
            if (lastWindowId !== undefined) {
                browser.windows.update(lastWindowId, {
                    focused: true
                });
            }
            break;
    }
}


/***/ })

/******/ });
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vLy4vc3JjL2JhY2tncm91bmQuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOzs7QUFHQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0Esa0RBQTBDLGdDQUFnQztBQUMxRTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLGdFQUF3RCxrQkFBa0I7QUFDMUU7QUFDQSx5REFBaUQsY0FBYztBQUMvRDs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsaURBQXlDLGlDQUFpQztBQUMxRSx3SEFBZ0gsbUJBQW1CLEVBQUU7QUFDckk7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxtQ0FBMkIsMEJBQTBCLEVBQUU7QUFDdkQseUNBQWlDLGVBQWU7QUFDaEQ7QUFDQTtBQUNBOztBQUVBO0FBQ0EsOERBQXNELCtEQUErRDs7QUFFckg7QUFDQTs7O0FBR0E7QUFDQTs7Ozs7Ozs7Ozs7O0FDbEZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsQ0FBQztBQUNEO0FBQ0E7QUFDQSxDQUFDOztBQUVEO0FBQ0EsaUNBQWlDO0FBQ2pDO0FBQ0E7QUFDQSxDQUFDOztBQUVEO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxhQUFhO0FBQ2I7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0EsaUJBQWlCO0FBQ2pCO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsaUJBQWlCO0FBQ2pCLGlEQUFpRDtBQUNqRDtBQUNBO0FBQ0E7QUFDQTtBQUNBLDZCQUE2QjtBQUM3QjtBQUNBO0FBQ0EscUJBQXFCO0FBQ3JCLGlCQUFpQjtBQUNqQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxpQkFBaUI7QUFDakI7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiYmFja2dyb3VuZC5qcyIsInNvdXJjZXNDb250ZW50IjpbIiBcdC8vIFRoZSBtb2R1bGUgY2FjaGVcbiBcdHZhciBpbnN0YWxsZWRNb2R1bGVzID0ge307XG5cbiBcdC8vIFRoZSByZXF1aXJlIGZ1bmN0aW9uXG4gXHRmdW5jdGlvbiBfX3dlYnBhY2tfcmVxdWlyZV9fKG1vZHVsZUlkKSB7XG5cbiBcdFx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGlzIGluIGNhY2hlXG4gXHRcdGlmKGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdKSB7XG4gXHRcdFx0cmV0dXJuIGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdLmV4cG9ydHM7XG4gXHRcdH1cbiBcdFx0Ly8gQ3JlYXRlIGEgbmV3IG1vZHVsZSAoYW5kIHB1dCBpdCBpbnRvIHRoZSBjYWNoZSlcbiBcdFx0dmFyIG1vZHVsZSA9IGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdID0ge1xuIFx0XHRcdGk6IG1vZHVsZUlkLFxuIFx0XHRcdGw6IGZhbHNlLFxuIFx0XHRcdGV4cG9ydHM6IHt9XG4gXHRcdH07XG5cbiBcdFx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG4gXHRcdG1vZHVsZXNbbW9kdWxlSWRdLmNhbGwobW9kdWxlLmV4cG9ydHMsIG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuXG4gXHRcdC8vIEZsYWcgdGhlIG1vZHVsZSBhcyBsb2FkZWRcbiBcdFx0bW9kdWxlLmwgPSB0cnVlO1xuXG4gXHRcdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG4gXHRcdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbiBcdH1cblxuXG4gXHQvLyBleHBvc2UgdGhlIG1vZHVsZXMgb2JqZWN0IChfX3dlYnBhY2tfbW9kdWxlc19fKVxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5tID0gbW9kdWxlcztcblxuIFx0Ly8gZXhwb3NlIHRoZSBtb2R1bGUgY2FjaGVcbiBcdF9fd2VicGFja19yZXF1aXJlX18uYyA9IGluc3RhbGxlZE1vZHVsZXM7XG5cbiBcdC8vIGRlZmluZSBnZXR0ZXIgZnVuY3Rpb24gZm9yIGhhcm1vbnkgZXhwb3J0c1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5kID0gZnVuY3Rpb24oZXhwb3J0cywgbmFtZSwgZ2V0dGVyKSB7XG4gXHRcdGlmKCFfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZXhwb3J0cywgbmFtZSkpIHtcbiBcdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgbmFtZSwgeyBlbnVtZXJhYmxlOiB0cnVlLCBnZXQ6IGdldHRlciB9KTtcbiBcdFx0fVxuIFx0fTtcblxuIFx0Ly8gZGVmaW5lIF9fZXNNb2R1bGUgb24gZXhwb3J0c1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5yID0gZnVuY3Rpb24oZXhwb3J0cykge1xuIFx0XHRpZih0eXBlb2YgU3ltYm9sICE9PSAndW5kZWZpbmVkJyAmJiBTeW1ib2wudG9TdHJpbmdUYWcpIHtcbiBcdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgU3ltYm9sLnRvU3RyaW5nVGFnLCB7IHZhbHVlOiAnTW9kdWxlJyB9KTtcbiBcdFx0fVxuIFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ19fZXNNb2R1bGUnLCB7IHZhbHVlOiB0cnVlIH0pO1xuIFx0fTtcblxuIFx0Ly8gY3JlYXRlIGEgZmFrZSBuYW1lc3BhY2Ugb2JqZWN0XG4gXHQvLyBtb2RlICYgMTogdmFsdWUgaXMgYSBtb2R1bGUgaWQsIHJlcXVpcmUgaXRcbiBcdC8vIG1vZGUgJiAyOiBtZXJnZSBhbGwgcHJvcGVydGllcyBvZiB2YWx1ZSBpbnRvIHRoZSBuc1xuIFx0Ly8gbW9kZSAmIDQ6IHJldHVybiB2YWx1ZSB3aGVuIGFscmVhZHkgbnMgb2JqZWN0XG4gXHQvLyBtb2RlICYgOHwxOiBiZWhhdmUgbGlrZSByZXF1aXJlXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLnQgPSBmdW5jdGlvbih2YWx1ZSwgbW9kZSkge1xuIFx0XHRpZihtb2RlICYgMSkgdmFsdWUgPSBfX3dlYnBhY2tfcmVxdWlyZV9fKHZhbHVlKTtcbiBcdFx0aWYobW9kZSAmIDgpIHJldHVybiB2YWx1ZTtcbiBcdFx0aWYoKG1vZGUgJiA0KSAmJiB0eXBlb2YgdmFsdWUgPT09ICdvYmplY3QnICYmIHZhbHVlICYmIHZhbHVlLl9fZXNNb2R1bGUpIHJldHVybiB2YWx1ZTtcbiBcdFx0dmFyIG5zID0gT2JqZWN0LmNyZWF0ZShudWxsKTtcbiBcdFx0X193ZWJwYWNrX3JlcXVpcmVfXy5yKG5zKTtcbiBcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KG5zLCAnZGVmYXVsdCcsIHsgZW51bWVyYWJsZTogdHJ1ZSwgdmFsdWU6IHZhbHVlIH0pO1xuIFx0XHRpZihtb2RlICYgMiAmJiB0eXBlb2YgdmFsdWUgIT0gJ3N0cmluZycpIGZvcih2YXIga2V5IGluIHZhbHVlKSBfX3dlYnBhY2tfcmVxdWlyZV9fLmQobnMsIGtleSwgZnVuY3Rpb24oa2V5KSB7IHJldHVybiB2YWx1ZVtrZXldOyB9LmJpbmQobnVsbCwga2V5KSk7XG4gXHRcdHJldHVybiBucztcbiBcdH07XG5cbiBcdC8vIGdldERlZmF1bHRFeHBvcnQgZnVuY3Rpb24gZm9yIGNvbXBhdGliaWxpdHkgd2l0aCBub24taGFybW9ueSBtb2R1bGVzXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm4gPSBmdW5jdGlvbihtb2R1bGUpIHtcbiBcdFx0dmFyIGdldHRlciA9IG1vZHVsZSAmJiBtb2R1bGUuX19lc01vZHVsZSA/XG4gXHRcdFx0ZnVuY3Rpb24gZ2V0RGVmYXVsdCgpIHsgcmV0dXJuIG1vZHVsZVsnZGVmYXVsdCddOyB9IDpcbiBcdFx0XHRmdW5jdGlvbiBnZXRNb2R1bGVFeHBvcnRzKCkgeyByZXR1cm4gbW9kdWxlOyB9O1xuIFx0XHRfX3dlYnBhY2tfcmVxdWlyZV9fLmQoZ2V0dGVyLCAnYScsIGdldHRlcik7XG4gXHRcdHJldHVybiBnZXR0ZXI7XG4gXHR9O1xuXG4gXHQvLyBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGxcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubyA9IGZ1bmN0aW9uKG9iamVjdCwgcHJvcGVydHkpIHsgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmplY3QsIHByb3BlcnR5KTsgfTtcblxuIFx0Ly8gX193ZWJwYWNrX3B1YmxpY19wYXRoX19cbiBcdF9fd2VicGFja19yZXF1aXJlX18ucCA9IFwiXCI7XG5cblxuIFx0Ly8gTG9hZCBlbnRyeSBtb2R1bGUgYW5kIHJldHVybiBleHBvcnRzXG4gXHRyZXR1cm4gX193ZWJwYWNrX3JlcXVpcmVfXyhfX3dlYnBhY2tfcmVxdWlyZV9fLnMgPSBcIi4vc3JjL2JhY2tncm91bmQuanNcIik7XG4iLCJ2YXIgbGFzdFRhYklkO1xudmFyIGN1cnJlbnRUYWJJZDtcbnZhciBsYXN0V2luZG93SWQ7XG52YXIgY3VycmVudFdpbmRvd0lkO1xudmFyIGRyb3BDdXJyZW50VGFiSWQgPSBmYWxzZTtcbnZhciBkcm9wQ3VycmVudFdpbmRvd0lkID0gZmFsc2U7XG5cbi8vIEZ1bmN0aW9uIHRvIHNlbmQgYSBtZXNzYWdlXG5mdW5jdGlvbiBzZW5kVGFiTWVzc2FnZShkZXRhaWxzLCB0eXBlPXVuZGVmaW5lZCkge1xuICAgIGJyb3dzZXIucnVudGltZS5zZW5kTWVzc2FnZSh7XG4gICAgICAgIHR5cGU6IHR5cGUsXG4gICAgICAgIGRldGFpbHM6IGRldGFpbHNcbiAgICB9KTtcbn1cblxuLy8gU2V0IGluaXRpYWwgdGFiIGlkXG5icm93c2VyLnRhYnMucXVlcnkoe1xuICAgIGFjdGl2ZTogdHJ1ZSxcbiAgICBjdXJyZW50V2luZG93OiB0cnVlXG59KS50aGVuKHRhYnMgPT4ge1xuICAgIGN1cnJlbnRUYWJJZCA9IHRhYnNbMF0uaWQ7XG4gICAgZHJvcEN1cnJlbnRUYWJJZCA9IHRydWU7XG59KTtcblxuLy8gU2V0IGluaXRpYWwgd2luZG93IGlkXG5icm93c2VyLndpbmRvd3MuZ2V0TGFzdEZvY3VzZWQoe30pLnRoZW4odyA9PiB7XG4gICAgY3VycmVudFdpbmRvd0lkID0gdy5pZDtcbiAgICBkcm9wQ3VycmVudFdpbmRvd0lkID0gdHJ1ZTtcbn0pO1xuXG4vKioqKioqKioqKiBGaXggZm9yIGNyb3NzLXdpbmRvdyBkcmFnZ2luZyBpc3N1ZSAqKioqKioqKioqL1xudmFyIHdyb25nVG9SaWdodCA9IHt9O1xudmFyIHJpZ2h0VG9Xcm9uZyA9IHt9O1xuXG5icm93c2VyLnRhYnMub25BdHRhY2hlZC5hZGRMaXN0ZW5lcihmaXhPbkF0dGFjaGVkKTtcbmJyb3dzZXIudGFicy5vblJlbW92ZWQuYWRkTGlzdGVuZXIoZml4T25SZW1vdmVkKTtcbmJyb3dzZXIucnVudGltZS5vbk1lc3NhZ2UuYWRkTGlzdGVuZXIob25NZXNzYWdlKTtcblxuZnVuY3Rpb24gZml4T25BdHRhY2hlZCh0YWJJZCwgYXR0YWNoSW5mbykge1xuICAgIGJyb3dzZXIudGFicy5nZXQodGFiSWQpLnRoZW4oZnVuY3Rpb24gKHRhYil7XG4gICAgICAgIGlmICh0YWJJZCAhPT0gdGFiLmlkKSB7XG4gICAgICAgICAgICBsZXQgbGFzdFdyb25nSWQgPSByaWdodFRvV3JvbmdbdGFiSWRdO1xuICAgICAgICAgICAgaWYgKGxhc3RXcm9uZ0lkKSB7XG4gICAgICAgICAgICAgICAgZGVsZXRlIHdyb25nVG9SaWdodFtsYXN0V3JvbmdJZF07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB3cm9uZ1RvUmlnaHRbdGFiLmlkXSA9IHRhYklkO1xuICAgICAgICAgICAgcmlnaHRUb1dyb25nW3RhYklkXSA9IHRhYi5pZDtcbiAgICAgICAgfVxuICAgIH0pO1xufVxuXG5mdW5jdGlvbiBmaXhPblJlbW92ZWQodGFiSWQsIHJlbW92ZUluZm8pIHtcbiAgICBsZXQgd3JvbmdJZCA9IHJpZ2h0VG9Xcm9uZ1t0YWJJZF07XG4gICAgaWYgKHdyb25nSWQpIHtcbiAgICAgICAgZGVsZXRlIHdyb25nVG9SaWdodFt3cm9uZ0lkXTtcbiAgICB9XG4gICAgZGVsZXRlIHJpZ2h0VG9Xcm9uZ1t0YWJJZF07XG59XG5cbmZ1bmN0aW9uIGdldENvcnJlY3RUYWJJZCh0YWJJZCkge1xuICAgIHJldHVybiB3cm9uZ1RvUmlnaHRbdGFiSWRdIHx8IHRhYklkO1xufVxuXG5mdW5jdGlvbiBvbk1lc3NhZ2UocmVxdWVzdCwgc2VuZGVyLCBzZW5kUmVzcG9uc2UpIHtcbiAgICBzd2l0Y2ggKHJlcXVlc3QudHlwZSkge1xuICAgICAgICBjYXNlIFwiV1JPTkdfVE9fUklHSFRfR0VUXCI6XG4gICAgICAgICAgICBzZW5kUmVzcG9uc2Uoe1xuICAgICAgICAgICAgICAgIHdyb25nVG9SaWdodDogd3JvbmdUb1JpZ2h0XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgIH1cbn1cbi8qKioqKioqKioqIEZpeCBmb3IgY3Jvc3Mtd2luZG93IGRyYWdnaW5nIGlzc3VlIGVuZCAqKioqKioqKioqL1xuXG4vLyBXYXRjaCBvdXQgZm9yIGFueSBjaGFuZ2VzIGluIHRhYnNcbmJyb3dzZXIudGFicy5vblVwZGF0ZWQuYWRkTGlzdGVuZXIodGFiVXBkYXRlZCk7XG5icm93c2VyLnRhYnMub25BY3RpdmF0ZWQuYWRkTGlzdGVuZXIodGFiQWN0aXZhdGVkKTtcbmJyb3dzZXIudGFicy5vblJlbW92ZWQuYWRkTGlzdGVuZXIodGFiUmVtb3ZlZCk7XG5icm93c2VyLmNvbW1hbmRzLm9uQ29tbWFuZC5hZGRMaXN0ZW5lcihvbkNvbW1hbmQpO1xuYnJvd3Nlci53aW5kb3dzLm9uUmVtb3ZlZC5hZGRMaXN0ZW5lcih3aW5kb3dSZW1vdmVkKTtcbmJyb3dzZXIud2luZG93cy5vbkZvY3VzQ2hhbmdlZC5hZGRMaXN0ZW5lcih3aW5kb3dGb2N1c0NoYW5nZWQpO1xuXG5mdW5jdGlvbiB0YWJBY3RpdmF0ZWQoYWN0aXZlSW5mbykge1xuICAgIHNlbmRUYWJNZXNzYWdlKHtcbiAgICAgICAgd2luZG93SWQ6IGFjdGl2ZUluZm8ud2luZG93SWQsXG4gICAgICAgIHRhYklkOiBhY3RpdmVJbmZvLnRhYklkXG4gICAgfSwgXCJBQ1RJVkVfVEFCX0NIQU5HRURcIik7XG4gICAgaWYgKGRyb3BDdXJyZW50VGFiSWQpIHtcbiAgICAgICAgbGFzdFRhYklkID0gY3VycmVudFRhYklkO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIGRyb3BDdXJyZW50VGFiSWQgPSB0cnVlO1xuICAgIH1cbiAgICBjdXJyZW50VGFiSWQgPSBhY3RpdmVJbmZvLnRhYklkO1xufVxuXG5mdW5jdGlvbiB0YWJVcGRhdGVkKHRhYklkLCBjaGFuZ2VJbmZvLCB0YWIpIHtcbiAgICBpZiAoY2hhbmdlSW5mby5mYXZJY29uVXJsICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgc2VuZFRhYk1lc3NhZ2Uoe1xuICAgICAgICAgICAgdGFiSWQ6IGdldENvcnJlY3RUYWJJZCh0YWJJZCksXG4gICAgICAgICAgICBmYXZJY29uVXJsOiBjaGFuZ2VJbmZvLmZhdkljb25VcmxcbiAgICAgICAgfSwgXCJUQUJfRkFWX0lDT05fQ0hBTkdFRFwiKTtcbiAgICB9XG4gICAgaWYgKGNoYW5nZUluZm8ucGlubmVkICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgc2VuZFRhYk1lc3NhZ2Uoe1xuICAgICAgICAgICAgdGFiSWQ6IGdldENvcnJlY3RUYWJJZCh0YWJJZCksXG4gICAgICAgICAgICBwaW5uZWQ6IGNoYW5nZUluZm8ucGlubmVkXG4gICAgICAgIH0sIFwiVEFCX1BJTk5FRF9TVEFUVVNfQ0hBTkdFRFwiKTtcbiAgICB9XG4gICAgaWYgKGNoYW5nZUluZm8udGl0bGUgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICBzZW5kVGFiTWVzc2FnZSh7XG4gICAgICAgICAgICB0YWJJZDogZ2V0Q29ycmVjdFRhYklkKHRhYklkKSxcbiAgICAgICAgICAgIHRpdGxlOiBjaGFuZ2VJbmZvLnRpdGxlXG4gICAgICAgIH0sIFwiVEFCX1RJVExFX0NIQU5HRURcIik7XG4gICAgfVxufVxuXG5mdW5jdGlvbiB0YWJSZW1vdmVkKHRhYklkLCByZW1vdmVJbmZvKSB7XG4gICAgc2VuZFRhYk1lc3NhZ2Uoe1xuICAgICAgICB0YWJJZDogdGFiSWQsXG4gICAgICAgIHdpbmRvd0lkOiByZW1vdmVJbmZvLndpbmRvd0lkLFxuICAgICAgICB3aW5kb3dDbG9zaW5nOiByZW1vdmVJbmZvLmlzV2luZG93Q2xvc2luZ1xuICAgIH0sIFwiVEFCX1JFTU9WRURcIik7XG4gICAgaWYgKGxhc3RUYWJJZCA9PT0gdGFiSWQpIHtcbiAgICAgICAgbGFzdFRhYklkID0gdW5kZWZpbmVkO1xuICAgIH1cbiAgICBpZiAoY3VycmVudFRhYklkID09PSB0YWJJZCkge1xuICAgICAgICBjdXJyZW50VGFiSWQgPSB1bmRlZmluZWQ7XG4gICAgICAgIGRyb3BDdXJyZW50VGFiSWQgPSBmYWxzZTtcbiAgICB9XG59XG5cbmZ1bmN0aW9uIHdpbmRvd0ZvY3VzQ2hhbmdlZCh3aW5kb3dJZCkge1xuICAgIGlmICh3aW5kb3dJZCAhPT0gYnJvd3Nlci53aW5kb3dzLldJTkRPV19JRF9OT05FKSB7XG4gICAgICAgIGlmIChkcm9wQ3VycmVudFdpbmRvd0lkKSB7XG4gICAgICAgICAgICBsYXN0V2luZG93SWQgPSBjdXJyZW50V2luZG93SWQ7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBkcm9wQ3VycmVudFdpbmRvd0lkID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgICBjdXJyZW50V2luZG93SWQgPSB3aW5kb3dJZDtcbiAgICAgICAgYnJvd3Nlci50YWJzLnF1ZXJ5KHtcbiAgICAgICAgICAgIGFjdGl2ZTogdHJ1ZSxcbiAgICAgICAgICAgIHdpbmRvd0lkOiB3aW5kb3dJZFxuICAgICAgICB9KS50aGVuKHRhYnMgPT4ge1xuICAgICAgICAgICAgaWYgKHRhYnNbMF0uaWQgIT09IGN1cnJlbnRUYWJJZCkge1xuICAgICAgICAgICAgICAgIGlmIChkcm9wQ3VycmVudFRhYklkKSB7XG4gICAgICAgICAgICAgICAgICAgIGxhc3RUYWJJZCA9IGN1cnJlbnRUYWJJZDtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBkcm9wQ3VycmVudFRhYklkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgY3VycmVudFRhYklkID0gdGFic1swXS5pZDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxufVxuXG5mdW5jdGlvbiB3aW5kb3dSZW1vdmVkKHdpbmRvd0lkKSB7XG4gICAgc2VuZFRhYk1lc3NhZ2Uoe1xuICAgICAgICB3aW5kb3dJZDogd2luZG93SWRcbiAgICB9LCBcIldJTkRPV19SRU1PVkVEXCIpO1xuICAgIGlmIChsYXN0V2luZG93SWQgPT09IHdpbmRvd0lkKSB7XG4gICAgICAgIGxhc3RXaW5kb3dJZCA9IHVuZGVmaW5lZDtcbiAgICB9XG4gICAgaWYgKGN1cnJlbnRXaW5kb3dJZCA9PT0gd2luZG93SWQpIHtcbiAgICAgICAgY3VycmVudFdpbmRvd0lkID0gdW5kZWZpbmVkO1xuICAgICAgICBkcm9wQ3VycmVudFdpbmRvd0lkID0gZmFsc2U7XG4gICAgfVxufVxuXG5mdW5jdGlvbiBvbkNvbW1hbmQobmFtZSkge1xuICAgIHN3aXRjaCAobmFtZSkge1xuICAgICAgICBjYXNlIFwibGFzdC11c2VkLXRhYlwiOlxuICAgICAgICAgICAgaWYgKGxhc3RUYWJJZCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgYnJvd3Nlci50YWJzLnVwZGF0ZShsYXN0VGFiSWQsIHtcbiAgICAgICAgICAgICAgICAgICAgYWN0aXZlOiB0cnVlXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgYnJvd3Nlci53aW5kb3dzLmdldExhc3RGb2N1c2VkKHt9KS50aGVuKHcgPT4ge1xuICAgICAgICAgICAgICAgICAgICBicm93c2VyLnRhYnMuZ2V0KGxhc3RUYWJJZCkudGhlbih0YWIgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHcuaWQgIT09IHRhYi53aW5kb3dJZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyb3dzZXIud2luZG93cy51cGRhdGUodGFiLndpbmRvd0lkLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvY3VzZWQ6IHRydWVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsYXN0VGFiSWQgPSBjdXJyZW50VGFiSWQ7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgXCJsYXN0LXVzZWQtd2luZG93XCI6XG4gICAgICAgICAgICBpZiAobGFzdFdpbmRvd0lkICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICBicm93c2VyLndpbmRvd3MudXBkYXRlKGxhc3RXaW5kb3dJZCwge1xuICAgICAgICAgICAgICAgICAgICBmb2N1c2VkOiB0cnVlXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBicmVhaztcbiAgICB9XG59XG4iXSwic291cmNlUm9vdCI6IiJ9
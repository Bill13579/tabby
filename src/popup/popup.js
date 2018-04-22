var tabs_list = document.querySelector("#tabs-list");

// Function for stripping HTML
function stripHTML(str) {
    var chars = {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "\"": "&quot;",
        "'": "&#39;"
    };
    return str.replace(/[&<>"']/g, function(i) { return chars[i]; });
}

// Add event listeners
document.addEventListener("DOMContentLoaded", addTabs);
document.addEventListener("DOMContentLoaded", extendTabsList);
document.addEventListener("mouseover", documentMouseOver);
document.addEventListener("click", documentClicked);
document.querySelector("#search").addEventListener("keyup", searchTextChanged);
// Add event listener to listen for any messages from background.js
if (!browser.runtime.onMessage.hasListener(onMessage)) {
    browser.runtime.onMessage.addListener(onMessage);
}

function onMessage(request, sender, sendResponse) {
    switch (request.msg) {
        case "ACTIVE_TAB_CHANGED":
            setActiveTab(request.details.windowId, request.details.tabId);
            break;
        case "TAB_FAV_ICON_CHANGED":
            getFavIconFromTabEntry(findTabEntryById(request.details.tabId)).src = request.details.favIconUrl;
            break;
        case "TAB_PINNED_STATUS_CHANGED":
            let tabEntry = findTabEntryById(request.details.tabId);
            let pinBtnImage = tabEntry.querySelector(".tab-entry-pin-btn img");
            let windowEntryList = tabEntry.parentElement;
            let pinnedTabs;
            if (request.details.pinned) {
                pinnedTabs = windowEntryList.querySelectorAll(".pinned-tab");
                tabEntry.classList.add("pinned-tab");
                pinBtnImage.src = "../icons/pinremove.svg";
            } else {
                pinnedTabs = windowEntryList.querySelectorAll(".pinned-tab");
                tabEntry.classList.remove("pinned-tab");
                pinBtnImage.src = "../icons/pin.svg";
            }
            let lastPinnedTab = pinnedTabs[pinnedTabs.length-1];
            if (lastPinnedTab !== undefined) {
                windowEntryList.insertBefore(tabEntry, lastPinnedTab.nextSibling);
            } else {
                windowEntryList.insertBefore(tabEntry, windowEntryList.childNodes[0]);
            }
            break;
        case "TAB_TITLE_CHANGED":
            findTabEntryById(request.details.tabId).querySelector(".tab-title")[0].innerHTML = request.details.title;
            break;
        case "TAB_REMOVED":
            if (!request.details.windowClosing) {
                removeTab(request.details.tabId, request.details.windowId);
            }
            break;
        case "TAB_MOVED":
            moveTab(request.details.tabId, request.details.windowId, request.details.toIndex);
            break;
        case "WINDOW_REMOVED":
            removeWindow(request.details.windowId);
            break;
    }
}

// Set tabs list height to any available height
function extendTabsList() {
    let searchArea = document.querySelector("#search-area");
    let searchAreaHeight = getActualHeight(searchArea);
    let tabs = document.querySelector("#tabs");
    tabs.style.height = "calc(100% - " + searchAreaHeight + "px)";
}

// Get actual height of an element
function getActualHeight(element) {
    var styles = window.getComputedStyle(element);
    var margin = parseFloat(styles['marginTop']) +
               parseFloat(styles['marginBottom']);
    return element.offsetHeight + margin;
}

// Get favicon from a tab entry
function getFavIconFromTabEntry(entry) {
    return entry.querySelector(".tab-entry-favicon")[0];
}

// Find tab entry by tab id
function findTabEntryById(tabId) {
    return document.querySelector(".tab-entry[data-tab_id=\"" + tabId + "\"]");
}

// Find window entry by tab id
function findWindowEntryById(windowId) {
    return tabs_list.querySelector("li[data-window_id=\"" + windowId + "\"]");
}

// Get all windows
function getWindows() {
    return browser.windows.getAll({
        populate: true,
        windowTypes: ["normal", "popup", "devtools"]
    });
}

// Get current window
function getCurrentWindow() {
    return browser.tabs.query({currentWindow: true});
}

// Find tab entry inside a window entry
function findTabEntryInWindow(windowEntry, tabId) {
    return windowEntry.querySelector("li[data-tab_id=\"" + tabId + "\"]");
}

// Get active tab in the specified window
function getActiveTab(windowId) {
    let window = findWindowEntryById(windowId);
    return window.querySelector(".current-tab");
}

// Set active tab in the specified window
function setActiveTab(windowId, tabId) {
    let window = findWindowEntryById(windowId);
    let tab = findTabEntryInWindow(window, tabId);
    getActiveTab(windowId).classList.remove("current-tab");
    tab.classList.add("current-tab");
}

// Remove tab
function removeTab(tabId, windowId) {
    let tabEntry = findTabEntryById(tabId);
    tabEntry.outerHTML = "";
    browser.windows.get(windowId, {
        populate: true
    }).then(function (window){
        for (let tab of window.tabs) {
            if (tab.active) {
                findTabEntryById(tab.id).classList.add("current-tab");
                break;
            }
        }
    });
}

// Move tab
function moveTab(tabId, windowId, toIndex) {
    let tab = findTabEntryById(tabId);
    let tabs_list_html = findWindowEntryById(windowId).querySelector(".window-entry-tabs");
    tabs_list_html.removeChild(tab);
    tabs_list_html.insertBefore(tab, tabs_list_html.childNodes[toIndex]);
}

// Attach tab
function attachTab(tabId, newWindowId, newPosition) {
    let tab = findTabEntryById(tabId);
    let tabs_list_html = findWindowEntryById(newWindowId).querySelector(".window-entry-tabs");
    if (newPosition === -1) {
        tabs_list_html.insertBefore(tab, null);
        return;
    }
    tabs_list_html.insertBefore(tab, tabs_list_html.childNodes[newPosition]);
}

// Remove window
function removeWindow(windowId) {
    let windowEntry = findWindowEntryById(windowId);
    windowEntry.outerHTML = "";
    browser.windows.getCurrent({}).then(function (window) {
        findWindowEntryById(window.id).classList.add("current-window");
    });
}

// Update tabs
function updateTabs(windows) {
    tabs_list.innerHTML = "";
    let windowEntry;
    let currentWindowEntry;
    // Loop through windows
    for (let i = 0; i < windows.length; i++) {
        // Set w to window
        let w = windows[i];

        // Create window entry
        windowEntry = document.createElement("li");
        windowEntry.classList.add("window-entry");
        windowEntry.classList.add("category");

        // Set window id to window entry
        windowEntry.setAttribute("data-window_id", w.id);
        let span = document.createElement("span");

        // Create close button
        let closeBtn = document.createElement("span");
        closeBtn.classList.add("inline-button");
        closeBtn.classList.add("img-button");
        closeBtn.classList.add("window-entry-remove-btn");
        let closeBtnImage = document.createElement("img");
        closeBtnImage.src = "../icons/close.svg";
        closeBtnImage.style.height = "100%";
        closeBtn.appendChild(closeBtnImage);

        // Buttons wrapper
        let buttons = document.createElement("span");
        buttons.classList.add("window-entry-buttons");
        buttons.appendChild(closeBtn);

        span.appendChild(buttons);

        // Append window number
        span.innerHTML += "Window " + (i+1);

        // Check if window is focused
        if (w.focused) {
            currentWindowEntry = windowEntry;
            windowEntry.classList.add("current-window");
            span.innerHTML += " - Current";
        }
        // Check if window is incognito
        if (w.incognito) {
            windowEntry.classList.add("incognito-window")
            span.innerHTML += " (Incognito)";
        }

        span.classList.add("darker-button");

        windowEntry.appendChild(span);

        // Add window entry dragstart, dragover, and drop event listeners
        windowEntry.addEventListener("dragstart", windowEntryDragStarted);
        windowEntry.addEventListener("dragover", windowEntryDraggingOver);
        windowEntry.addEventListener("drop", windowEntryDropped);

        let tabs_list_html = document.createElement("ul");
        tabs_list_html.classList.add("category-list");
        tabs_list_html.classList.add("window-entry-tabs");

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

                let favicon = null;
                span = document.createElement("span");
                span.classList.add("tab-title");
                span.innerHTML += stripHTML(tab.title);

                let details = document.createElement("span");
                details.classList.add("tab-details");
                if (tab.active) {
                    tabEntry.classList.add("current-tab");
                }
                if (tab.favIconUrl !== undefined) {
                    favicon = document.createElement("img");
                    favicon.classList.add("tab-entry-favicon");
                    favicon.src = tab.favIconUrl;
                }

                // Create close button
                let closeBtn = document.createElement("span");
                closeBtn.classList.add("inline-button");
                closeBtn.classList.add("red-button");
                closeBtn.classList.add("tab-entry-remove-btn");
                let closeBtnImage = document.createElement("img");
                closeBtnImage.src = "../icons/close.svg";
                closeBtnImage.style.height = "100%";
                closeBtn.appendChild(closeBtnImage);

                // Create pin button
                let pinBtn = document.createElement("span");
                pinBtn.classList.add("inline-button");
                pinBtn.classList.add("img-button");
                pinBtn.classList.add("tab-entry-pin-btn");
                let pinBtnImage = document.createElement("img");
                pinBtnImage.src = "../icons/pin.svg";
                pinBtnImage.style.height = "100%";
                pinBtn.appendChild(pinBtnImage);

                // Buttons wrapper
                let buttons = document.createElement("span");
                buttons.classList.add("tab-entry-buttons");
                buttons.appendChild(pinBtn);
                buttons.appendChild(closeBtn);

                // Set tab entry tab id
                tabEntry.setAttribute("data-tab_id", tab.id);
                tabEntry.appendChild(buttons);
                if (favicon !== null) {
                    tabEntry.appendChild(favicon);
                }
                tabEntry.appendChild(span);

                if (tab.pinned) {
                    pinBtnImage.src = "../icons/pinremove.svg";
                    tabEntry.classList.add("pinned-tab");
                    let pinnedTabs = tabs_list_html.querySelectorAll(".pinned-tab");
                    let lastPinnedTab = pinnedTabs[pinnedTabs.length-1];
                    if (lastPinnedTab !== undefined) {
                        tabs_list_html.insertBefore(tabEntry, lastPinnedTab.nextSibling);
                    } else {
                        tabs_list_html.insertBefore(tabEntry, tabs_list_html.childNodes[0]);
                    }
                } else {
                    tabs_list_html.appendChild(tabEntry);
                }
            }
        }

        windowEntry.appendChild(tabs_list_html);
        tabs_list.appendChild(windowEntry);
    }
    document.querySelector("#tabs").style.display = "block";
    currentWindowEntry.scrollIntoView({ behavior: 'smooth' });
}

// Add tabs to list
function addTabs() {
    getWindows().then(function (windows) {
        updateTabs(windows);
    });
}

// Search
function searchTextChanged(e) {
    let input, filter, tabEntries;
    input = document.querySelector("#search");
    filter = input.value.toUpperCase();
    tabEntries = document.querySelectorAll(".tab-entry");
    if (filter !== "") {
        for (let tabEntry of tabEntries) {
            if (!tabEntry.querySelector(".tab-title").innerText.toUpperCase().includes(filter)) {
                tabEntry.style.display = "none";
            } else {
                tabEntry.style.display = "block";
            }
        }
    } else {
        for (let tabEntry of tabEntries) {
            tabEntry.style.display = "block";
        }
    }
}

function documentMouseOver(e) {
    if (e.button === 0) {
        if (e.target.classList.contains("tab-entry")) {
            let tabId = parseInt(e.target.getAttribute("data-tab_id"));
            browser.tabs.captureTab(tabId).then(function (imageUri){
                let detailsImage = document.querySelector("#details-img");
                detailsImage.src = imageUri;
                let detailsTitle = document.querySelector("#details-title");
                let detailsURL = document.querySelector("#details-url");
                browser.tabs.get(tabId).then(function (tab) {
                    detailsTitle.innerHTML = stripHTML(tab.title);
                    detailsURL.innerHTML = stripHTML(tab.url);
                    document.querySelector("#details-placeholder").style.display = "none";
                    document.querySelector("#tab-details").style.display = "inline-block";
                    document.querySelector("#tab-details").setAttribute("data-tab_id", tabId);
                    if (tab.pinned) {
                        document.querySelector("#details-pinned").style.display = "inline";
                    } else {
                        document.querySelector("#details-pinned").style.display = "none";
                    }
                    if (tab.hidden) {
                        document.querySelector("#details-hidden").style.display = "inline";
                    } else {
                        document.querySelector("#details-hidden").style.display = "none";
                    }
                    if (tab.pinned && tab.hidden) {
                        document.querySelector("#details-comma").style.display = "inline";
                    } else {
                        document.querySelector("#details-comma").style.display = "none";
                    }
                });
            });
        }
    }
    e.preventDefault();
}

function documentClicked(e) {
    if (e.button === 0) {
        if (e.target.classList.contains("tab-entry")) {
            let tabId = parseInt(e.target.getAttribute("data-tab_id"));
            let parentWindowId = parseInt(e.target.parentElement.parentElement.getAttribute("data-window_id"));
            browser.tabs.update(tabId, {
                active: true
            });
            browser.windows.get(parentWindowId).then(function (w){
                getCurrentWindow().then(function (cw) {
                    if (w.id !== cw.id) {
                        browser.windows.update(w.id, {
                            focused: true
                        }).then(function (){ window.close(); });
                    }
                });
            });
        } else if (e.target.parentElement.classList.contains("window-entry")) {
            let windowId = parseInt(e.target.parentElement.getAttribute("data-window_id"));
            browser.windows.update(windowId, {
                focused: true
            }).then(function (){ window.close(); });
        } else if (e.target.id === "details-close") {
            document.querySelector("#details-placeholder").style.display = "inline-block";
            document.querySelector("#tab-details").style.display = "none";
            browser.tabs.remove(parseInt(document.querySelector("#tab-details").getAttribute("data-tab_id")));
        } else if (e.target.classList.contains("tab-entry-remove-btn")) {
            let tabId = e.target.parentElement.parentElement.getAttribute("data-tab_id");
            let tabDetails = document.querySelector("#tab-details");
            if (tabDetails.getAttribute("data-tab_id") === tabId) {
                tabDetails.style.display = "none";
                document.querySelector("#details-placeholder").style.display = "inline-block";
            }
            browser.tabs.remove(parseInt(tabId));
        } else if (e.target.classList.contains("tab-entry-pin-btn")) {
            let tabId = e.target.parentElement.parentElement.getAttribute("data-tab_id");
            browser.tabs.get(parseInt(tabId)).then(function (tab){
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
        }
    }
}

var sourceTab;
var sourceWindow;

function windowEntryDragStarted(e) {
    if (e.target.classList.contains("tab-entry")) {
        sourceTab = e.target;
        sourceWindow = sourceTab.parentElement.parentElement;
        e.dataTransfer.setData("text/plain", sourceTab.outerHTML);
        e.dataTransfer.effectAllowed = "move";
    }
}

function windowEntryDraggingOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";

    let cursors = tabs_list.querySelectorAll(".insert-cursor");
    for (let c of cursors) {
        c.outerHTML = "";
    }
    let cursor_window = tabs_list.querySelector(".insert-cursor-window");
    if (cursor_window !== null) {
        cursor_window.classList.remove("insert-cursor-window");
    }

    let windowEntry;
    if (e.target.classList.contains("tab-entry")) {
        if (sourceTab !== e.target
            && ((!sourceTab.classList.contains("pinned-tab") && !e.target.classList.contains("pinned-tab"))
            || (sourceTab.classList.contains("pinned-tab") && e.target.classList.contains("pinned-tab")))) {
            let cursor = document.createElement("div");
            cursor.classList.add("insert-cursor");
            e.target.parentElement.insertBefore(cursor, e.target);
        }
    } else if ((windowEntry = e.target.parentElement) !== null) {
        if (windowEntry.classList.contains("window-entry")) {
            if (sourceWindow !== windowEntry) {
                e.target.classList.add("insert-cursor-window");
            }
        }
    }
}

function windowEntryDropped(e) {
    e.preventDefault();
    e.stopPropagation();

    let cursors = tabs_list.querySelectorAll(".insert-cursor");
    for (let cursor of cursors) {
        cursor.outerHTML = "";
    }
    let cursor_window = tabs_list.querySelector(".insert-cursor-window");
    if (cursor_window !== null) {
        cursor_window.classList.remove("insert-cursor-window");
    }
    
    if (e.target.classList.contains("tab-entry")) {
        if (sourceTab !== e.target
            && ((!sourceTab.classList.contains("pinned-tab") && !e.target.classList.contains("pinned-tab"))
            || (sourceTab.classList.contains("pinned-tab") && e.target.classList.contains("pinned-tab")))) {
            let destinationWindowId = e.target.parentElement.parentElement.getAttribute("data-window_id");
            let sourceTabIndex = Array.prototype.indexOf.call(e.target.parentElement.childNodes, sourceTab);
            let destinationIndex = Array.prototype.indexOf.call(e.target.parentElement.childNodes, e.target);
            let moveIndex = (sourceTabIndex !== -1 && destinationIndex > sourceTabIndex) ? destinationIndex-1 : destinationIndex;
            if (destinationWindowId !== null) {
                let sourceTabId = parseInt(sourceTab.getAttribute("data-tab_id"));
                browser.tabs.move(sourceTabId, {
                    windowId: parseInt(destinationWindowId),
                    index: moveIndex
                });
                if (destinationWindowId !== sourceWindow.getAttribute("data-window_id")) {
                    attachTab(sourceTabId, parseInt(destinationWindowId), moveIndex);
                }
            } else {
                browser.tabs.move(parseInt(sourceTab.getAttribute("data-tab_id")), {
                    index: moveIndex
                });
            }
        }
    } else if ((windowEntry = e.target.parentElement) !== null) {
        if (windowEntry.classList.contains("window-entry")) {
            if (sourceWindow !== e.target) {
                let sourceTabId = parseInt(sourceTab.getAttribute("data-tab_id"));
                let destinationWindowId = windowEntry.getAttribute("data-window_id");
                browser.tabs.move(sourceTabId, {
                    windowId: parseInt(destinationWindowId),
                    index: -1
                });
                if (destinationWindowId !== sourceWindow.getAttribute("data-window_id")) {
                    attachTab(sourceTabId, parseInt(destinationWindowId), -1);
                }
            }
        }
    }
}

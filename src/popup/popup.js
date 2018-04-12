var tabs_list = document.querySelector("#tabs-list");

function stripHTML(str) {
    var map = {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "\"": "&quot;"
    };
    return str.replace(/[&<>"']/g, function(m) { return map[m]; });
}

document.addEventListener("DOMContentLoaded", addTabs);
document.addEventListener("DOMContentLoaded", extendTabsList);
document.addEventListener("dblclick", documentDblClicked);
document.addEventListener("click", documentClicked);
browser.runtime.onMessage.addListener(
    function (request, sender, sendResponse){
        switch (request.msg) {
            case "ACTIVE_TAB_CHANGED":
                setActiveTab(request.details.windowId, request.details.tabId);
                break;
            case "TAB_FAV_ICON_CHANGED":
                getFavIconFromTabEntry(findTabEntryById(request.details.tabId)).src = request.details.favIconUrl;
                break;
            case "TAB_PINNED_STATUS_CHANGED":
                let tabDetails = findTabEntryById(request.details.tabId).querySelector(".tab-details");
                if (request.details.pinned) {
                    if (tabDetails.textContent !== "") {
                        tabDetails.textContent += ", Pinned";
                    } else {
                        tabDetails.textContent = "Pinned";
                    }
                } else {
                    tabDetails.textContent = tabDetails.textContent.replace(/(, Pinned|Pinned)/, "Pinned");
                }
                break;
            case "TAB_TITLE_CHANGED":
                findTabEntryById(request.details.tabId).querySelector("span:not(.tab-details)").textContent = request.details.title;
                break;
            case "TAB_REMOVED":
                let deletedTabEntry = findTabEntryById(request.details.tabId);
                deletedTabEntry.parentElement.remove(deletedTabEntry);
                delete deletedTabEntry;
                break;
        }
    }
);

function extendTabsList() {
    let searchArea = document.querySelector("#search-area");
    let searchAreaHeight = getActualHeight(searchArea);
    let tabs = document.querySelector("#tabs");
    tabs.style.height = "calc(100% - " + searchAreaHeight + "px)";
}

function getActualHeight(element) {
    var styles = window.getComputedStyle(element);
    var margin = parseFloat(styles['marginTop']) +
               parseFloat(styles['marginBottom']);
    return element.offsetHeight + margin;
}

function getFavIconFromTabEntry(entry) {
    return entry.querySelector("img");
}

function findTabEntryById(tabId) {
    return document.querySelector(".tab-entry[data-tab_id=\"" + tabId + "\"]");
}

function getWindows() {
    return browser.windows.getAll({
        populate: true,
        windowTypes: ["normal", "popup", "devtools"]
    });
}

function getWindowEntry(windowId) {
    return tabs_list.querySelector("li[data-window_id=\"" + windowId + "\"]");
}

function getTabEntry(window, tabId) {
    return window.querySelector("li[data-tab_id=\"" + tabId + "\"]");
}

function getActiveTab(windowId) {
    let window = getWindowEntry(windowId);
    return window.querySelector(".current-tab");
}

function getCurrentWindow() {
    return browser.tabs.query({currentWindow: true});
}

function setActiveTab(windowId, tabId) {
    let window = getWindowEntry(windowId);
    let tab = getTabEntry(window, tabId);
    getActiveTab(windowId).classList.remove("current-tab");
    tab.classList.add("current-tab");
}

function updateTabs(windows) {
    tabs_list.innerHTML = "";
    let windowEntry;
    let currentWindowEntry;
    for (let i = 0; i < windows.length; i++) {
        let w = windows[i];
        windowEntry = document.createElement("li");
        windowEntry.classList.add("window-entry");
        windowEntry.setAttribute("data-window_id", w.id);
        let span = document.createElement("span");
        span.textContent += "Window " + (i+1);
        if (w.focused) {
            currentWindowEntry = windowEntry;
            windowEntry.classList.add("current-window");
            span.textContent += " - Current Window";
        }
        windowEntry.appendChild(span);
        let tabs_list_html = document.createElement("ul");
        for (let tab of w.tabs) {
            if (tab.id !== browser.tabs.TAB_ID_NONE) {
                let tabEntry = document.createElement("li");
                tabEntry.classList.add("tab-entry");
                tabEntry.classList.add("button");

                let favicon = document.createElement("img");
                span = document.createElement("span");
                span.textContent += stripHTML(tab.title);

                let details = document.createElement("span");
                details.classList.add("tab-details");
                if (tab.active) {
                    tabEntry.classList.add("current-tab");
                }
                if (tab.favIconUrl) {
                    favicon.src = tab.favIconUrl;
                }
                if (tab.hidden) {
                    details.textContent = "Hidden: yes";
                }

                tabEntry.setAttribute("data-tab_id", tab.id);
                tabEntry.appendChild(favicon);
                tabEntry.appendChild(span);
                tabEntry.appendChild(details);

                if (tab.pinned) {
                    if (details.textContent !== "") {
                        details.textContent += ", Pinned: yes";
                    } else {
                        details.textContent = "Pinned: yes";
                    }
                    tabs_list_html.insertBefore(tabEntry, tabs_list_html.childNodes[0]);
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

function addTabs() {
    getWindows().then(function (windows) {
        updateTabs(windows);
    });
}

function documentDblClicked(e) {
    if (e.button === 0) {
        if (e.target.classList.contains("tab-entry")) {
            let tabId = parseInt(e.target.getAttribute("data-tab_id"));
            let parentWindowId = parseInt(e.target.parentElement.parentElement.getAttribute("data-window_id"));
            browser.tabs.update(tabId, {
                active: true
            });
            browser.windows.get(parentWindowId, {
                populate: true
            }).then(function (w){
                getCurrentWindow().then(function (cw) {
                    if (w !== cw) {
                        browser.windows.update(w.id, {
                            focused: true
                        });
                    }
                });
            });
        } else if (e.target.parentElement.classList.contains("window-entry")) {
            let windowId = parseInt(e.target.parentElement.getAttribute("data-window_id"));
            browser.windows.update(windowId, {
                focused: true
            });
            window.close();
        }
    }
    e.preventDefault();
}

function documentClicked(e) {
    if (e.button === 0) {
        if (e.target.classList.contains("tab-entry")) {
            let tabId = parseInt(e.target.getAttribute("data-tab_id"));
            browser.tabs.captureTab(tabId).then(function (imageUri){
                let detailsImage = document.querySelector("#details-img");
                detailsImage.src = imageUri;
                let detailsTitle = document.querySelector("#details-title");
                let detailsURL = document.querySelector("#details-url");
                browser.tabs.get(tabId).then(function (tab) {
                    detailsTitle.textContent = tab.title;
                    detailsURL.textContent = tab.url;
                    document.querySelector("#details-placeholder").style.display = "none";
                    document.querySelector("#tab-details").style.display = "table-cell";
                });
            });
        }
    }
    e.preventDefault();
}

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
document.querySelector("#search").addEventListener("keyup", searchTextChanged);
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
                removeTab(request.details.tabId, request.details.windowId);
                break;
        }
    }
);

function searchTextChanged(e) {
    let input, filter, tabEntries;
    input = document.querySelector("#search");
    filter = input.value.toUpperCase();
    tabEntries = document.querySelectorAll(".tab-entry");
    if (filter !== "") {
        for (let tabEntry of tabEntries) {
            if (!tabEntry.querySelector(".tab-title").textContent.toUpperCase().includes(filter)) {
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

function findWindowEntryById(windowId) {
    return tabs_list.querySelector("li[data-window_id=\"" + windowId + "\"]");
}

function getTabEntry(window, tabId) {
    return window.querySelector("li[data-tab_id=\"" + tabId + "\"]");
}

function getActiveTab(windowId) {
    let window = findWindowEntryById(windowId);
    return window.querySelector(".current-tab");
}

function getCurrentWindow() {
    return browser.tabs.query({currentWindow: true});
}

function setActiveTab(windowId, tabId) {
    let window = findWindowEntryById(windowId);
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
        windowEntry.classList.add("category");
        windowEntry.setAttribute("data-window_id", w.id);
        let span = document.createElement("span");
        span.textContent += "Window " + (i+1);
        if (w.focused) {
            currentWindowEntry = windowEntry;
            windowEntry.classList.add("current-window");
            span.textContent += " - Current Window";
        }
        span.classList.add("darker-button");
        windowEntry.appendChild(span);
        let tabs_list_html = document.createElement("ul");
        tabs_list_html.classList.add("category-list");
        for (let tab of w.tabs) {
            if (tab.id !== browser.tabs.TAB_ID_NONE) {
                let tabEntry = document.createElement("li");
                tabEntry.classList.add("tab-entry");
                tabEntry.classList.add("button");

                let favicon = null;
                span = document.createElement("span");
                span.classList.add("tab-title");
                span.textContent += stripHTML(tab.title);

                let details = document.createElement("span");
                details.classList.add("tab-details");
                if (tab.active) {
                    tabEntry.classList.add("current-tab");
                }
                if (tab.favIconUrl) {
                    favicon = document.createElement("img");
                    favicon.src = tab.favIconUrl;
                }
                if (tab.hidden) {
                    details.textContent = "Hidden: yes";
                }

                let closeBtn = document.createElement("span");
                closeBtn.classList.add("round-inline-button");
                closeBtn.classList.add("red-button");
                closeBtn.classList.add("img-button");
                closeBtn.classList.add("tab-entry-remove-btn");
                let closeBtnImage = document.createElement("img");
                closeBtnImage.src = "../icons/close.svg";
                closeBtnImage.style.height = "100%";
                closeBtn.appendChild(closeBtnImage);

                tabEntry.setAttribute("data-tab_id", tab.id);
                tabEntry.appendChild(closeBtn);
                if (favicon !== null) {
                    tabEntry.appendChild(favicon);
                }
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
        } else if (e.target.id === "details-close") {
            document.querySelector("#details-placeholder").style.display = "inline-block";
            document.querySelector("#tab-details").style.display = "none";
            browser.tabs.remove(parseInt(document.querySelector("#tab-details").getAttribute("data-tab_id")));
        } else if (e.target.classList.contains("tab-entry-remove-btn")) {
            let tabId = e.target.parentElement.getAttribute("data-tab_id");
            let tabDetails = document.querySelector("#tab-details");
            if (tabDetails.getAttribute("data-tab_id") === tabId) {
                tabDetails.style.display = "none";
                document.querySelector("#details-placeholder").style.display = "inline-block";
            }
            let parentWindowId = parseInt(e.target.parentElement.parentElement.parentElement.getAttribute("data-window_id"));
            removeTab(parseInt(tabId), parentWindowId);
        }
    }
}

function removeTab(tabId, windowId) {
    let tabEntry = findTabEntryById(tabId);
    tabEntry.outerHTML = "";
    browser.tabs.remove(tabId);
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

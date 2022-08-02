import "Polyfill"
import G from "./globals"
import { getImage } from "./net"
import { getCorrectTabId } from "./wrong-to-right"
import { getWindows, correctFocused } from "./wtutils"
import { getActualHeight, stopPropagation } from "./domutils"
import { windowEntryDragStarted, windowEntryDraggingOver, windowEntryDropped, windowEntryTitleClicked, windowCloseClick, windowEntryContextMenu } from "./event-listeners/windowEntry"
import { tabEntryMouseOver, tabEntryClicked, tabEntryAuxClicked, tabCloseClick, tabPinClick, tabSpeakerControlClick } from "./event-listeners/tabEntry"
import { sendRuntimeMessage } from "../messaging"

// Update tabs
export async function updateTabs(windows) {
    let { windowProperties } = await sendRuntimeMessage("GET_WINDOW_PROPS", {});

    G.tabsList.innerHTML = "";
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
    // Tab speaker control button
    let TAB_SPEAKER_BTN = document.createElement("span");
    TAB_SPEAKER_BTN.classList.add("inline-button");
    TAB_SPEAKER_BTN.classList.add("img-button");
    TAB_SPEAKER_BTN.classList.add("opacity-changing-button");
    TAB_SPEAKER_BTN.classList.add("tab-entry-speaker-btn");
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
        span.addEventListener("click", windowEntryTitleClicked);
        span.addEventListener("contextmenu", windowEntryContextMenu);

        // Create close button
        let closeBtn = WINDOW_CLOSE_BTN.cloneNode(true);
        closeBtn.addEventListener("click", windowCloseClick);

        // Buttons wrapper
        let buttons = document.createElement("span");
        buttons.classList.add("window-entry-buttons");
        buttons.appendChild(closeBtn);
        
        // Create window name span
        let windowName = document.createElement("span");
        windowName.classList.add("window-title");
        if (windowProperties.hasOwnProperty(w.id)) {
            windowName.textContent += windowProperties[w.id].name + " (" + (i+1) + ")";
        } else {
            windowName.textContent += "Window " + (i+1);
        }

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
        windowEntry.addEventListener("dragstart", windowEntryDragStarted);
        windowEntry.addEventListener("dragover", windowEntryDraggingOver);
        windowEntry.addEventListener("drop", windowEntryDropped);
        windowEntry.setAttribute("draggable", "true");

        let windowTabsList = document.createElement("ul");
        windowTabsList.classList.add("category-list");
        windowTabsList.classList.add("window-entry-tabs");

        let windowTabsListFragment = document.createDocumentFragment();
        // Loop through tabs
        if(G.sortByLastAccessed){
            w.tabs.sort((a,b)=>a.lastAccessed < b.lastAccessed)
        }
        for (let i = 0; i < w.tabs.length; i++) {
            let tab = w.tabs[i];
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
                
                favicon = document.createElement("img");
                favicon.classList.add("tab-entry-favicon");
                if (tab.favIconUrl) {
                    let favIconPromise;
                    if (!tab.favIconUrl.startsWith("chrome://")) {
                        if (w.incognito) {
                            favIconPromise = getImage(tab.favIconUrl, true);
                        } else {
                            favIconPromise = getImage(tab.favIconUrl);
                        }
                    } else {
                        favIconPromise = Promise.resolve(tab.favIconUrl);
                    }
                    favIconPromise.then(base64Image => {
                        favicon.src = base64Image;
                    });
                }

                // Create close button
                closeBtn = TAB_CLOSE_BTN.cloneNode(false);
                closeBtn.addEventListener("click", tabCloseClick);
                closeBtn.addEventListener("mouseover", stopPropagation);

                // Create pin button
                let pinBtn = TAB_PIN_BTN.cloneNode(false);
                pinBtn.addEventListener("click", tabPinClick);
                pinBtn.addEventListener("mouseover", stopPropagation);

                // Create speaker button
                let speakerBtn = TAB_SPEAKER_BTN.cloneNode(false);
                speakerBtn.addEventListener("click", tabSpeakerControlClick);
                speakerBtn.addEventListener("mouseover", stopPropagation);
                if (!tab.audible) {
                    speakerBtn.setAttribute("data-state", "none");
                } else {
                    if (tab.mutedInfo.muted) {
                        speakerBtn.setAttribute("data-state", "off");
                    } else {
                        speakerBtn.setAttribute("data-state", "on");
                    }
                }

                // Buttons wrapper
                buttons = document.createElement("span");
                buttons.classList.add("tab-entry-buttons");
                buttons.appendChild(pinBtn);
                buttons.appendChild(speakerBtn);
                buttons.appendChild(closeBtn);

                // Make tab entries focusable
                tabEntry.setAttribute("tabindex", "0");

                // Add contextual identity indicator
                if (browser.contextualIdentities && !["firefox-default", "firefox-private"].includes(tab.cookieStoreId)) {
                    await browser.contextualIdentities.get(tab.cookieStoreId).then(ci => {
                        let contextualIdentityIndicator = document.createElement("div");
                        contextualIdentityIndicator.classList.add("contextual-identity-indicator");
                        contextualIdentityIndicator.style.backgroundColor = ci.colorCode;
                        tabEntryFragment.appendChild(contextualIdentityIndicator);
                    });
                }

                // Set tab entry tab id
                tabEntry.setAttribute("data-tab_id", getCorrectTabId(tab.id));
                tabEntryFragment.appendChild(favicon);
                if (favicon === undefined) {
                    tabEntry.classList.add("noicon");
                    favicon.style.display = "none";
                }
                tabEntryFragment.appendChild(titleWrapper);
                tabEntryFragment.appendChild(buttons);
                
                tabEntry.appendChild(tabEntryFragment);

                tabEntry.addEventListener("mouseover", tabEntryMouseOver);
                tabEntry.addEventListener("click", tabEntryClicked);
                tabEntry.addEventListener("auxclick", tabEntryAuxClicked);

                if (tab.pinned) {
                    pinBtn.style.backgroundImage = "url(../icons/pinremove.svg)";
                    tabEntry.classList.add("pinned-tab");
                    let pinnedTabs = Array.from(windowTabsList.getElementsByClassName("pinned-tab"));
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
    G.tabsList.appendChild(tabsListFragment);
    G.tabsList.addEventListener("click", stopPropagation);
    document.getElementById("tabs").style.display = "block";
    currentWindowEntry.scrollIntoView({ behavior: 'smooth' });
}

// Add tabs to list
export async function populateTabsList() {
    let windows = await getWindows();
    await correctFocused(windows);
    await updateTabs(windows);
}

// Set tabs list height to any available height
export function extendTabsList() {
    let searchArea = document.getElementById("search-area");
    let searchAreaHeight = getActualHeight(searchArea);
    let tabs = document.getElementById("tabs");
    tabs.style.height = "calc(100% - " + searchAreaHeight + "px)";
}

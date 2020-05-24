import "Polyfill"
import * as Options from "../options"
import * as captureTab from "./captureTab"
import { getActualWidth } from "./domutils"
import { documentClicked, documentKeyPressed as documentKeyDown, documentMouseOver } from "./event-listeners/document"
import { onMessage } from "./event-listeners/message"
import { restore as recorderRestore, saveForLater } from "./event-listeners/recorder"
import { initSearch, searchKeydown, searchTextChanged } from "./event-listeners/search"
import G from "./globals"
import { sendRuntimeMessage } from "./messaging"
import { updateRecorderToolTip } from "./recorder"
import { getWrongToRight } from "./wrong-to-right"
import { hideTabPreview } from "./wtdom"
import { extendTabsList, populateTabsList } from "./wtinit"

G.tabsList = document.getElementById("tabs-list");

function setPopupSize(width, height) {
    document.documentElement.style.width = width + "px";
    document.documentElement.style.height = height + "px";
    document.body.style.width = width + "px";
    document.body.style.height = height + "px";
}

async function fulfillOptions() {
    let popupOptions = (await Options.options()).popup;
    // popup.size
    setPopupSize(popupOptions.size.width, popupOptions.size.height);
    // popup.scale
    document.documentElement.style.setProperty('--scale', popupOptions.scale.toString());
    // popup.showDetails
    if (!Options.stbool(popupOptions.showDetails)) {
        let leftContainer = document.getElementById("left-container");
        popupOptions.size.width = popupOptions.size.width - getActualWidth(leftContainer);
        setPopupSize(popupOptions.size.width, popupOptions.size.height);
        leftContainer.style.display = "none";
        document.getElementById("tabs-container").style.width = "100%";
    } else {
        // popup.showPreview
        if (!Options.stbool(popupOptions.showPreview)) hideTabPreview();
    }
    // popup.hideAfterTabSelection
    G.hideAfterTabSelection = Options.stbool(popupOptions.hideAfterTabSelection);
    // popup.searchInURLs
    G.searchInURLs = Options.stbool(popupOptions.searchInURLs);
}

async function main() {
    // Initialize captureTab based on environment
    captureTab.init();
    // Fulfill user options
    await fulfillOptions();
    // Make tabs list fit the panel
    extendTabsList();
    // Fix for cross-window dragging issue
    await getWrongToRight();
    // Populate tabs list with tabs
    await populateTabsList();
    // Update recorder tooltip
    await updateRecorderToolTip();
    // Initialize components
    initSearch();
    // Event Listeners
    generalSetup();
}

/* Add event listeners */

// Starting point
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", main);
} else {
    main();
}

function generalSetup() {
    document.addEventListener("mouseover", documentMouseOver);
    document.addEventListener("click", documentClicked);
    document.addEventListener("keydown", documentKeyDown);

    // Add event listeners to all copy buttons
    let copyButtons = Array.from(document.getElementsByClassName("copy-button"));
    for (let i = 0; i < copyButtons.length; i++) {
        copyButtons[i].addEventListener("click", e => {
            document.oncopy = ce => {
                ce.clipboardData.setData("text", document.getElementById(e.target.getAttribute("for")).innerText);
                ce.preventDefault();
            };
            document.execCommand("copy", false, null);
            e.target.innerText = "Copied!";
            setTimeout(() => {
                e.target.innerText = "Copy";
            }, 2000);
        });
    }

    // Add event listener for recorder.js
    document.getElementById("save-for-later").addEventListener("click", saveForLater);
    document.getElementById("restore-now").addEventListener("click", recorderRestore);

    // Add event listener to listen for any messages from background.js
    if (!browser.runtime.onMessage.hasListener(onMessage)) {
        browser.runtime.onMessage.addListener(onMessage);
    }

    // Add keyup event listener and put focus on search
    let search = document.getElementById("search");
    search.addEventListener("keydown", searchKeydown);
    search.addEventListener("keyup", searchTextChanged);
    search.focus();

    // Tell background script that popup is being unloaded
    window.addEventListener("unload", () => {
        sendRuntimeMessage("POPUP_UNLOADED", {});
    });

    // Tell background script that everything is loaded now
    sendRuntimeMessage("INIT__POPUP_LOADED", {});
}
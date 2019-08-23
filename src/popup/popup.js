import "Polyfill"
import G from "./globals"
import { getWrongToRight } from "./wrong-to-right"
import { populateTabsList, extendTabsList } from "./wtinit"
import { getActualWidth } from "./domutils"
import { documentMouseOver, documentMouseUp, documentClicked, documentKeyPressed } from "./event-listeners/document"
import { searchTextChanged } from "./event-listeners/search"
import { onMessage } from "./event-listeners/message"
import { saveForLater, restore as recorderRestore } from "./event-listeners/recorder"
import * as captureTab from "./captureTab"
import * as Options from "../options"
import { hideTabPreview } from "./wtdom"

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
}

/* Add event listeners */

// Starting point
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", main);
} else {
    main();
}

document.addEventListener("mouseover", documentMouseOver);
document.addEventListener("mouseup", documentMouseUp);
document.addEventListener("click", documentClicked);
document.addEventListener("keypress", documentKeyPressed);

// Add keyup event listener and put focus on search
let search = document.getElementById("search");
search.addEventListener("keyup", searchTextChanged);
search.focus();

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

import "Polyfill"
import G from "./globals"
import { getWrongToRight } from "./wrong-to-right"
import { populateTabsList, extendTabsList } from "./wtinit"
import { documentMouseOver, documentMouseUp, documentClicked, documentDragOver, documentKeyPressed } from "./event-listeners/document"
import { archiveDragOverReceiver, archiveDropReceiver } from "./event-listeners/archive"
import { searchTextChanged } from "./event-listeners/search"
import { onMessage } from "./event-listeners/message"
import * as captureTab from "./captureTab"

G.tabsList = document.getElementById("tabs-list");

async function main() {
    // Initialize captureTab based on environment
    captureTab.init();
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
document.addEventListener("dragover", documentDragOver);
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

G.archive = document.getElementById("save-for-later");
G.archive.addEventListener("dragover", archiveDragOverReceiver);
G.archive.addEventListener("drop", archiveDropReceiver);

// Add event listener to listen for any messages from background.js
if (!browser.runtime.onMessage.hasListener(onMessage)) {
    browser.runtime.onMessage.addListener(onMessage);
}

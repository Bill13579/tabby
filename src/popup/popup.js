import G from "./globals"
import { getWrongToRight } from "./wrong-to-right"
import { populateTabsList, extendTabsList } from "./wtinit"
import { documentMouseOver, documentMouseUp, documentClicked, documentDragOver } from "./event-listeners/document"
import { archiveDragOverReceiver, archiveDropReceiver } from "./event-listeners/archive"
import { searchTextChanged } from "./event-listeners/search"
import { onMessage } from "./event-listeners/message"

G.tabsList = document.getElementById("tabs-list");

async function main() {
    // Make tabs list fit the panel
    extendTabsList();
    // Fix for cross-window dragging issue
    await getWrongToRight();
    // Populate tabs list with tabs
    populateTabsList();
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

// Add keyup event listener and put focus on search
let search = document.getElementById("search");
search.addEventListener("keyup", searchTextChanged);
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

G.archive = document.getElementById("save-for-later");
G.archive.addEventListener("dragover", archiveDragOverReceiver);
G.archive.addEventListener("drop", archiveDropReceiver);

// Add event listener to listen for any messages from background.js
if (!browser.runtime.onMessage.hasListener(onMessage)) {
    browser.runtime.onMessage.addListener(onMessage);
}

import "Polyfill";
import { getTabId, getAdjTabEntry, getInView, selectTabEntry, closeTabEntry } from "../wtdom";
import { selectTab } from "./tabEntry";

export function documentMouseOver(e) {
    e.preventDefault();
}

export function documentClicked(e) {
    if (e.button === 0) {
        if (e.target.id === "details-close") {
            document.getElementById("details-placeholder").style.display = "inline-block";
            document.getElementById("tab-details").style.display = "none";
            browser.tabs.remove(getTabId(document.getElementById("tab-details")));
        }
    }
}

export function documentKeyPressed(e) {
    e.preventDefault();
    switch (e.code) {
        case "S": {
            document.getElementById("search").focus();
            break;
        }
        case "ArrowDown":
        case "ArrowUp": {
            let selectedTabEntries = document.getElementsByClassName("selected-entry");
            if (selectedTabEntries.length > 0) {
                let selectedTabEntry = selectedTabEntries[0];
                let adjTabEntry = getAdjTabEntry(selectedTabEntry, {
                    "ArrowDown": "DOWN",
                    "ArrowUp": "UP"
                }[e.code]);
                if (adjTabEntry !== null) {
                    selectTab(adjTabEntry);
                    getInView(adjTabEntry, e.code === "ArrowUp");
                }
            }
            break;
        }
        case "Enter": {
            let selectedTabEntries = document.getElementsByClassName("selected-entry");
            if (selectedTabEntries.length > 0) {
                selectedTabEntries[0].classList.add("going-to-this-entry");
                selectTabEntry(selectedTabEntries[0]);
            }
            break;
        }
        case "Delete": {
            let selectedTabEntries = Array.from(document.getElementsByClassName("selected-entry"));
            if (selectedTabEntries.length > 0) {
                selectedTabEntries[0].classList.add("going-to-this-entry");
                let newSelected = getAdjTabEntry(selectedTabEntries[0], "DOWN");
                if (newSelected !== null) {
                    selectTab(newSelected);
                    newSelected = null;
                } else {
                    newSelected = getAdjTabEntry(selectedTabEntries[0], "UP");
                }
                if (newSelected !== null) {
                    selectTab(newSelected);
                }
                closeTabEntry(selectedTabEntries[0]);
            }
            break;
        }
    }
}

import "Polyfill"
import G from "../globals"
import { getTabId, getInView } from "../wtdom"
import { stopPropagation } from "../domutils";
import { selectTab } from "./tabEntry";

// Init
export function initSearch() {
    document.getElementById("search").addEventListener("keypress", stopPropagation);
}

function keywordSearch(s, key) {
    let keywords = key.trim().split(" "), count = 0;
    for (let i = 0; i < keywords.length; i++) {
        let word = keywords[i];
        if (word.trim() !== "" && word.match(/^[a-zA-Z0-9]+$/)) {
            if (s.toUpperCase().includes(word.toUpperCase())) {
                count++;
            }
        }
    }
    return count >= 2;
}

function search(s, key) {
    return s.toUpperCase().includes(key.toUpperCase()) || keywordSearch(s, key);
}

// Search
export async function searchTextChanged(e) {
    let input, filter, tabEntries;
    input = document.getElementById("search");
    filter = input.value;
    tabEntries = document.getElementsByClassName("tab-entry");
    if (filter !== "") {
        for (let i = 0; i < tabEntries.length; i++) {
            let tabEntry = tabEntries[i];
            if (!search(tabEntry.getElementByClassName("tab-title").innerText, filter) &&
                !(G.searchInURLs && search((await browser.tabs.get(getTabId(tabEntry))).url, filter))) {
                tabEntry.classList.add("non-matching");
            } else {
                tabEntry.classList.remove("non-matching");
            }
        }
    } else {
        for (let i = 0; i < tabEntries.length; i++) {
            let tabEntry = tabEntries[i];
            tabEntry.classList.remove("non-matching");
        }
    }
}

// Search keydown
export function searchKeydown(e) {
    e.stopPropagation();
    if (e.code === "Enter") {
        let remainingTabEntry = document.querySelector(".tab-entry:not(.non-matching)");
        if (remainingTabEntry !== null) {
            e.target.blur();
            selectTab(remainingTabEntry);
            getInView(remainingTabEntry, true);
        }
    }
}
import "Polyfill";
import { getTabId, getAdjTabEntry, getInView, selectTabEntry, closeTabEntry } from "../wtdom";
import { selectTab } from "./tabEntry";
import { toggleMuted, togglePinned } from "../wtutils";

export function documentMouseOver(e) {
  e.preventDefault();
}

export function documentClicked(e) {
  for (let menu of document.getElementsByClassName("context-menu")) menu.removeAttribute("data-state");
  if (e.button === 0) {
    if (e.target.id === "details-close") {
      document.getElementById("details-placeholder").style.display = "inline-block";
      document.getElementById("tab-details").style.display = "none";
      browser.tabs.remove(getTabId(document.getElementById("tab-details")));
    }
  }
}

export function mouseActivate(e) {
  document.getElementById("tabs").removeAttribute("data-keyboard-first");
}

export function documentKeyPressed(e) {
  e.preventDefault();
  switch (e.code) {
    case "KeyS": {
      document.getElementById("search").focus();
      break;
    }
    case "KeyM": {
      let selectedTabEntries = document.getElementsByClassName("selected-entry");
      if (selectedTabEntries.length > 0) {
        toggleMuted(getTabId(selectedTabEntries[0]));
      }
      break;
    }
    case "KeyP": {
      let selectedTabEntries = document.getElementsByClassName("selected-entry");
      if (selectedTabEntries.length > 0) {
        togglePinned(getTabId(selectedTabEntries[0]));
      }
      break;
    }
    case "ArrowDown":
    case "ArrowUp": {
      document.getElementById("tabs").setAttribute("data-keyboard-first", "");
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
        setTimeout(() => {
          selectedTabEntries[0].classList.remove("going-to-this-entry");
        }, 50);
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

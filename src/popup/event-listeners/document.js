import "Polyfill";
import { getTabId } from "../wtdom";

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

function isInlinePrintableKey(e) {
    if (typeof e.which === "undefined") {
        return true;
    } else if (typeof e.which === "number" && e.which > 0) {
        return !e.ctrlKey && !e.metaKey && !e.altKey && e.which !== 8 && e.which !== 13;
    }
}

export function documentKeyPressed(e) {
    if (isInlinePrintableKey(e)) {
        document.getElementById("search").focus();
    }
}

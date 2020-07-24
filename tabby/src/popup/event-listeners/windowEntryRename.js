import { sendRuntimeMessage } from "../../messaging";
import { populateTabsList } from "../wtinit";
import { showContextMenu } from "../domutils";

export async function windowEntryRenameContextMenu(e) {
    let oldMenu = document.getElementById("window-entry-context-menu");
    let menu = document.getElementById("window-entry-context-menu-purpose");
    menu.setAttribute("data-window-id", oldMenu.getAttribute("data-window-id"));
    let inputBox = document.getElementById("window-entry-rename-box");
    inputBox.value = "";
    inputBox.setAttribute("placeholder", "Default Numbering");
    showContextMenu(oldMenu.offsetLeft, oldMenu.offsetTop, menu);
    oldMenu.removeAttribute("data-state");
    inputBox.focus();
}

export function windowEntryRenameCancel() {
    document.getElementById("window-entry-context-menu-purpose").removeAttribute("data-state");
}

export function windowEntryRename() {
    let menu = document.getElementById("window-entry-context-menu-purpose");
    let renameVal = document.getElementById("window-entry-rename-box").value.trim();
    sendRuntimeMessage("SET_WINDOW_PROPS", {
        windowId: parseInt(menu.getAttribute("data-window-id")),
        name: renameVal === "" ? undefined : renameVal
    }).then(() => populateTabsList());
    menu.removeAttribute("data-state");
}

export function windowEntryRenameBoxKeyDown(e) {
    if (e.code === "Enter") {
        windowEntryRename();
    } else if (e.code === "Escape") {
        windowEntryRenameCancel();
    }
}

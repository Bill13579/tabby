import { sendRuntimeMessage } from "./messaging"

var wrongToRight;

export function getWrongToRight() {
    return sendRuntimeMessage("WRONG_TO_RIGHT_GET", {}).then(response => {
        wrongToRight = response.wrongToRight;
    });
}

// Function to get correct tab id
export function getCorrectTabId(tabId) {
    return wrongToRight[tabId] || tabId;
}

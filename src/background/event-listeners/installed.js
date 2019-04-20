import "Polyfill"
import { INITIAL_OPTIONS } from "../../options/states"

// On Installed
export function onInstalled(details) {
    // Initialize options
    browser.storage.local.get(["options"]).then(data => {
        if (data["options"] === undefined) {
            data.options = INITIAL_OPTIONS;
            browser.storage.local.set(data);
        }
    });
}

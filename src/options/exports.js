import { TargetBrowser } from "../polyfill"

// Default option values
let defaults = {
    "option:popup-size": [760, 465],
    "option:popup-scale": 0.9,
    "option:show-tab-info": TargetBrowser === "chrome" ? 2 : 3,
    "option:hide-popup-after-tab-selection": true,
    "option:search-in-urls": true, // Currently unused since search has become a bit more complicated,
    "option:popup-custom-theme": "",
    "option:popup-theme": "classic"
};
export function resolveDefault(optionID) {
    return defaults[optionID];
}
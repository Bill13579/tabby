import "Polyfill"

import { $local$ } from "../tapi/store"
import { TargetBrowser } from "../polyfill"
import { EXT_VERSION } from "../../ext-info"
import { resolveDefault } from "./exports"

// Fill version
document.querySelector("#version").innerText = `Tabby ${EXT_VERSION}`;

//option:popup-size
$local$.fulfill("option:popup-size", (popupSize) => {
    // Get elements
    let width = document.querySelector("#option-popup-width");
    let height = document.querySelector("#option-popup-height");

    // Set on change listeners
    width.oninput = (evt) => {
        $local$.modify("option:popup-size", (current) => {
            current[0] = parseInt(width.value);
            return current;
        }, true);
    };
    height.oninput = (evt) => {
        $local$.modify("option:popup-size", (current) => {
            current[1] = parseInt(height.value);
            return current;
        }, true);
    };

    // Set current values
    width.value = popupSize[0];
    height.value = popupSize[1];
}, resolveDefault("option:popup-size"));

//option:popup-scale
$local$.fulfill("option:popup-scale", (popupScale) => {
    // Get elements
    let scale = document.querySelector("#option-popup-scale");

    // Set on change listeners
    scale.oninput = (evt) => {
        $local$.modify("option:popup-scale", (current) => {
            current = parseFloat(scale.value);
            return current;
        }, true);
    };

    // Set current values
    scale.value = popupScale;
}, resolveDefault("option:popup-scale"));

//option:show-tab-info
//legend:
// 1=none
// 2=details
// 3=details+preview
$local$.fulfill("option:show-tab-info", (showTabInfo) => {
    // Get elements
    let showTabDetails = document.querySelector("#option-show-tab-details");
    let showTabPreview = document.querySelector("#option-show-tab-preview");

    // Browser based restrictions
    if (TargetBrowser === "chrome") {
        showTabPreview.setAttribute("disabled", "");
    }

    // Set on change listeners
    showTabDetails.oninput = (evt) => {
        $local$.modify("option:show-tab-info", (current) => {
            current = showTabDetails.checked ? 2 : 1;
            return current;
        }, true);
    };
    showTabPreview.oninput = (evt) => {
        $local$.modify("option:show-tab-info", (current) => {
            current = showTabPreview.checked ? 3 : 2;
            return current;
        }, true);
    };

    // Set current values
    if (showTabInfo === 1) {
        showTabDetails.checked = false;
        showTabPreview.checked = false;
    } else if (showTabInfo === 2) {
        showTabDetails.checked = true;
        showTabPreview.checked = false;
    } else if (showTabInfo === 3) {
        showTabDetails.checked = true;
        showTabPreview.checked = true;
    }
}, resolveDefault("option:show-tab-info"));

//option:hide-popup-after-tab-selection
$local$.fulfill("option:hide-popup-after-tab-selection", (hidePopupAfterTabSelection) => {
    // Get elements
    let hidePopupSwitch = document.querySelector("#option-hide-popup-after-tab-selection");

    // Set on change listeners
    hidePopupSwitch.oninput = (evt) => {
        $local$.modify("option:hide-popup-after-tab-selection", (current) => {
            current = hidePopupSwitch.checked;
            return current;
        }, true);
    };

    // Set current values
    hidePopupSwitch.checked = hidePopupAfterTabSelection;
}, resolveDefault("option:hide-popup-after-tab-selection"));

//option:search-in-urls
// $local$.fulfill("option:search-in-urls", (searchInUrls) => {
//     // Get elements
//     let searchInUrlsSwitch = document.querySelector("#option-search-in-urls");

//     // Set on change listeners
//     searchInUrlsSwitch.oninput = (evt) => {
//         $local$.modify("option:search-in-urls", (current) => {
//             current = searchInUrlsSwitch.checked;
//             return current;
//         }, true);
//     };

//     // Set current values
//     searchInUrlsSwitch.checked = searchInUrls;
// }, resolveDefault("option:search-in-urls"));

//option:popup-theme
$local$.fulfill("option:popup-theme", (popupTheme) => {
    // Get elements
    let radios = document.querySelectorAll(".popup-theme");

    // Set on change listeners
    for (let radio of radios) {
        radio.oninput = (evt) => {
            $local$.modify("option:popup-theme", () => radio.getAttribute("data-theme-id"), false);
        };
    }

    // Set current values
    let radio = document.querySelector(`.popup-theme[data-theme-id="${popupTheme}"]`);
    if (radio) {
        radio.checked = true;
    }
}, resolveDefault("option:popup-theme"));

//option:popup-custom-theme
$local$.fulfill("option:popup-custom-theme", (popupCustomTheme) => {
    // Get elements
    let customThemeBox = document.querySelector("#popup-custom-theme");

    // Set on change listeners
    customThemeBox.oninput = (evt) => {
        $local$.modify("option:popup-custom-theme", (current) => {
            current = customThemeBox.value;
            return current;
        }, true);
    };

    // Set current values
    customThemeBox.value = popupCustomTheme;
}, resolveDefault("option:popup-custom-theme"));

//option:dont-clear-search
$local$.fulfill("option:dont-clear-search", (dontClearSearch) => {
    // Get elements
    let dontClearSearchSwitch = document.querySelector("#option-dont-clear-search");

    // Set on change listeners
    dontClearSearchSwitch.oninput = (evt) => {
        $local$.modify("option:dont-clear-search", (current) => {
            current = dontClearSearchSwitch.checked;
            return current;
        }, true);
    };

    // Set current values
    dontClearSearchSwitch.checked = dontClearSearch;
}, resolveDefault("option:dont-clear-search"));

//option:show-whats-new-on
$local$.fulfill("option:show-whats-new-on", (showWhatsNewOn) => {
    // Get elements
    let showWhatsNewOnLabel = document.querySelector("#option-show-whats-new-on");

    // Set on click listener
    showWhatsNewOnLabel.onclick = (evt) => {
        $local$.modify("option:show-whats-new-on", (current) => {
            switch (current) {
                case "update":
                    return "major-update";
                case "major-update":
                    return "never";
                case "never":
                    return "update";
            }
        }, true);
    };

    // Set current values
    showWhatsNewOnLabel.setAttribute("data-state", showWhatsNewOn);
}, resolveDefault("option:show-whats-new-on"));

//option:separate-save
$local$.fulfill("option:separate-save", (separateSave) => {
    // Get elements
    let separateSaveSwitch = document.querySelector("#option-separate-save");

    // Set on change listeners
    separateSaveSwitch.oninput = (evt) => {
        $local$.modify("option:separate-save", (current) => {
            current = separateSaveSwitch.checked;
            return current;
        }, true);
    };

    // Set current values
    separateSaveSwitch.checked = separateSave;
}, resolveDefault("option:separate-save"));


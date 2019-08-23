import "Polyfill"
import { SWITCH_ON, SWITCH_LOCKED_ON, SWITCH_OFF, SWITCH_LOCKED_OFF, INITIAL_OPTIONS } from "./states"
import { stbool } from "../options"

function setSwitchState(switchElement, state) {
    switch (state) {
        case SWITCH_ON:
            switchElement.setAttribute("value", "on");
            break;
        case SWITCH_LOCKED_ON:
            switchElement.setAttribute("value", "on");
            switchElement.setAttribute("disabled", "");
            break;
        case SWITCH_OFF:
            switchElement.setAttribute("value", "off");
            break;
        case SWITCH_LOCKED_OFF:
            switchElement.setAttribute("value", "off");
            switchElement.setAttribute("disabled", "");
            break;
    }
}

function getSwitchState(switchElement) {
    if (switchElement.getAttribute("value") === "on") {
        if (switchElement.hasAttribute("disabled")) {
            return SWITCH_LOCKED_ON;
        } else {
            return SWITCH_ON;
        }
    } else if (switchElement.getAttribute("value") === "off") {
        if (switchElement.hasAttribute("disabled")) {
            return SWITCH_LOCKED_OFF;
        } else {
            return SWITCH_OFF;
        }
    }
}

function readOptions() {
    browser.storage.local.get(["options"]).then(data => {
        let options = data.options;
        document.getElementById("option-popup-width").value = options.popup.size.width;
        document.getElementById("option-popup-height").value = options.popup.size.height;
        document.getElementById("option-popup-scale").value = options.popup.scale;
        setSwitchState(document.getElementById("option-details"), options.popup.showDetails);
        setSwitchState(document.getElementById("option-preview"), options.popup.showPreview);
        setSubOptionState(options.popup.showDetails, document.getElementById("option-preview").parentElement);
        setSwitchState(document.getElementById("option-hide-after-tab-switch"), options.popup.hideAfterTabSelection);
        setSwitchState(document.getElementById("option-search-urls"), options.popup.searchInURLs);
    });
}

function setSubOptionState(parentState, subOption) {
    if (parentState === SWITCH_ON) {
        if (subOption.hasAttribute("disabled")) {
            subOption.removeAttribute("disabled");
        }
    } else if (parentState === SWITCH_OFF) {
        subOption.setAttribute("disabled", "");
    }
}

function addEventListeners() {
    document.getElementById("option-popup-width").addEventListener("input", e => {
        browser.storage.local.get(["options"]).then(data => {
            data.options.popup.size.width = parseFloat(e.target.value);
            browser.storage.local.set(data);
        });
    });
    document.getElementById("option-popup-height").addEventListener("input", e => {
        browser.storage.local.get(["options"]).then(data => {
            data.options.popup.size.height = parseFloat(e.target.value);
            browser.storage.local.set(data);
        });
    });

    document.getElementById("option-popup-scale").addEventListener("input", e => {
        browser.storage.local.get(["options"]).then(data => {
            data.options.popup.scale = parseFloat(e.target.value);
            browser.storage.local.set(data);
        });
    });

    document.getElementById("option-details").addEventListener("input", e => {
        browser.storage.local.get(["options"]).then(data => {
            data.options.popup.showDetails = getSwitchState(e.target);
            setSubOptionState(data.options.popup.showDetails, document.getElementById("option-preview").parentElement);
            browser.storage.local.set(data);
        });
    });

    document.getElementById("option-preview").addEventListener("input", e => {
        browser.storage.local.get(["options"]).then(data => {
            data.options.popup.showPreview = getSwitchState(e.target);
            browser.storage.local.set(data);
        });
    });

    document.getElementById("option-hide-after-tab-switch").addEventListener("input", e => {
        browser.storage.local.get(["options"]).then(data => {
            data.options.popup.hideAfterTabSelection = getSwitchState(e.target);
            browser.storage.local.set(data);
        });
    });

    document.getElementById("option-search-urls").addEventListener("input", e => {
        browser.storage.local.get(["options"]).then(data => {
            data.options.popup.searchInURLs = getSwitchState(e.target);
            browser.storage.local.set(data);
        });
    });
}

function main() {
    readOptions();
    addEventListeners();
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", main);
} else {
    main();
}

import { TargetBrowser } from "Polyfill"

export const SWITCH_ON = 1;
export const SWITCH_LOCKED_ON = 2;
export const SWITCH_OFF = 0;
export const SWITCH_LOCKED_OFF = -1;

export const INITIAL_OPTIONS = {
    popup: {
        size: {
            width: 730,
            height: 450
        },
        scale: 1.0,
        showDetails: SWITCH_ON,
        showPreview: SWITCH_ON,
        livePreview: SWITCH_OFF,
        hideAfterTabSelection: SWITCH_ON,
        searchInURLs: SWITCH_ON
    }
};
if (TargetBrowser === "chrome") {
    INITIAL_OPTIONS.popup.showPreview = SWITCH_LOCKED_OFF;
    INITIAL_OPTIONS.popup.hideAfterTabSelection = SWITCH_LOCKED_ON;
    INITIAL_OPTIONS.popup.livePreview = SWITCH_LOCKED_OFF;
}

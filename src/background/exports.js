import "Polyfill"

import { $local$ } from "../tapi/store"
import { resolveDefault } from "../options/exports"
import { TTabActions, TWindowActions } from "../tapi/taction"

export const LAYOUT_POPUP = "popup";
export const LAYOUT_STANDALONE = "standalone";
export const LAYOUT_TAB = "tab";
export const LAYOUT_SIDEBAR = "sidebar";

export function cycleLayout(layout) {
    switch (layout) {
        case undefined:
        case LAYOUT_POPUP:
            return LAYOUT_TAB;
        case LAYOUT_TAB:
            return LAYOUT_SIDEBAR;
        case LAYOUT_SIDEBAR:
            return LAYOUT_STANDALONE;
        case LAYOUT_STANDALONE:
            return LAYOUT_POPUP;
    }
}

export function closeTabby() {
    browser.sidebarAction.close();
    let popupURL = browser.runtime.getURL("popup/tab.html");
    browser.tabs.query({ url: [`${popupURL}*`, `${popupURL}?*`] }).then(matches => {
        if (matches.length > 0) {
            new TTabActions(matches[0].id).remove();
        }
    });
}

export function openTabby(layout) {
    switch (layout) {
        case undefined:
        case LAYOUT_POPUP:
            return browser.browserAction.openPopup();
        case LAYOUT_STANDALONE:
        case LAYOUT_TAB:
            let popupURL = browser.runtime.getURL("popup/tab.html");
            return browser.tabs.query({ url: [`${popupURL}*`, `${popupURL}?*`] }).then(async matches => {
                if (matches.length > 0) {
                    await new TTabActions(matches[0].id).activate();
                    await new TWindowActions(matches[0].windowId).activate();
                } else {
                    let create = popupSize => {
                        let opt = { url: popupURL };
                        if (layout === LAYOUT_STANDALONE) {
                            opt.type = "popup";
                            opt.width = popupSize[0];
                            opt.height = popupSize[1];
                            return browser.windows.create(opt);
                        } else if (layout === LAYOUT_TAB) {
                            opt.active = true;
                            return browser.tabs.create(opt);
                        }
                    };
                    return $local$.fulfillOnce("option:popup-size", (popupSize) => create(popupSize), resolveDefault("option:popup-size"));
                }
            });
        case LAYOUT_SIDEBAR:
            return browser.sidebarAction.toggle();
    }
}


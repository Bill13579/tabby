import "Polyfill"
import { TTabActions } from "../tapi/taction";

export class DetailsController {
    constructor() {
        this.tabId = undefined;
        this._lastCaptureTabId = undefined;
        this._hookPlaceholder();
    }
    setCurrent(tabId) {
        // Hide placeholder and show details pane
        document.getElementById("details-pane").setAttribute("data-tab-id", tabId);
        document.getElementById("details-placeholder").style.display = "none";
        this.tabId = tabId;
    }
    setTitle(title) {
        document.getElementById("_title_txt").innerText = title;
    }
    setURL(url) {
        document.getElementById("_url_txt").innerText = url;
    }
    _setImage(src) {
        document.getElementById("_details_pane_image_holder").style.display = "";
        document.getElementById("_details_pane_image_holder").src = src;
    }
    _hideImage() {
        document.getElementById("_details_pane_image_holder").style.display = "none";
    }
    _showPlaceholder() {
        let ph = document.getElementById("unloaded-tab-preview-placeholder");
        ph.style.display = "flex";
    }
    _hidePlaceholder() {
        document.getElementById("unloaded-tab-preview-placeholder").style.display = "";
        document.getElementById("unloaded-tab-preview-placeholder-text").removeAttribute("data-loading");
    }
    _hookPlaceholder() {
        let label = document.getElementById("unloaded-tab-preview-placeholder-text");
        label.addEventListener("click", () => {
            label.setAttribute("data-loading", "");
            browser.tabs.reload(this.tabId);
        });
    }
    async captureTab(pageUpdated=false) {
        if (this.tabId && (this._lastCaptureTabId !== this.tabId || pageUpdated)) {
            let cap;
            let tab;
            try {
                cap = await browser.runtime.sendMessage({_: "captureTab", tabId: this.tabId, quality: {
                    format: "jpeg",
                    quality: 80,
                    scale: window.devicePixelRatio / 2
                }});
            } catch (e) {
                tab = await browser.tabs.get(this.tabId);
                if (tab.discarded) {
                    this._showPlaceholder();
                }
            }
            if (cap) {
                this._setImage(cap);
                this._hidePlaceholder();
            } else {
                if (tab.discarded) {
                    this._hideImage();
                } // Do not hide the image if the tab isn't discarded
            }
            this._lastCaptureTabId = this.tabId;
        }
    }
}
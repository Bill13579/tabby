import "Polyfill"
import { TTabActions } from "../tapi/taction";

export class DetailsController {
    constructor() {
        this.tabId = undefined;
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
    async captureTab() {
        if (this.tabId) {
            let cap = await browser.runtime.sendMessage({_: "captureTab", tabId: this.tabId, quality: {
                format: "jpeg",
                quality: 80,
                scale: window.devicePixelRatio / 2
            }});
            if (cap) {
                this._setImage(cap);
            } else {
                this._hideImage();
            }
        }
    }
}
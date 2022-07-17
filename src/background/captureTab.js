import "Polyfill"
import { TTabActions } from "../tapi/taction";

let _captureTabAbortController;

class AbortError extends Error {  }

async function captureTab(tabId, quality) {
    if (_captureTabAbortController) {
        _captureTabAbortController.abort();
    }
    _captureTabAbortController = new AbortController();
    const signal = _captureTabAbortController.signal;
    try {
        let dataURI = await new TTabActions(tabId).captureTab(signal, quality);
        if (dataURI) {
            return dataURI;
        } else {
            return undefined;
        }
    } catch (e) { throw new AbortError(e.message); }
}

browser.runtime.onMessage.addListener(message => {
    if (message["_"] !== "captureTab") return;
    return captureTab(message["tabId"], message["quality"]);
});
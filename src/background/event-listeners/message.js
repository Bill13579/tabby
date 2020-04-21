import "Polyfill"
import G from "../globals"

export function onMessage(request, sender) {
    switch (request.type) {
        case "INIT__POPUP_LOADED":
            if (G.events.onpopuploaded) G.events.onpopuploaded();
            break;
        case "POPUP_UNLOADED":
            if (G.events.onpopupunloaded) G.events.onpopupunloaded();
            break;
        case "WRONG_TO_RIGHT_GET":
            return Promise.resolve({
                wrongToRight: G.wrongToRight
            });
    }
}

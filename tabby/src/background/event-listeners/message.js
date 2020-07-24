import "Polyfill"
import G from "../globals"
import { setWindowProp, getWindowProps } from "../windowProps";
import { record, restoreWindow } from "../sfl";

export function onMessage(request, sender) {
  switch (request.type) {
    case "INIT__POPUP_LOADED": {
      if (G.events.onpopuploaded) G.events.onpopuploaded();
      break;
    }
    case "POPUP_UNLOADED": {
      if (G.events.onpopupunloaded) G.events.onpopupunloaded();
      break;
    }
    case "WRONG_TO_RIGHT_GET": {
      return Promise.resolve({
        wrongToRight: G.wrongToRight
      });
    }
    case "SET_WINDOW_PROPS": {
      return setWindowProp(request.data.windowId, request.data.name);
    }
    case "GET_WINDOW_PROPS": {
      return Promise.resolve({
        windowProperties: getWindowProps()
      });
    }
    case "RESTORE_WINDOW": {
      return restoreWindow(request.data["windowRecord"]);
    }
    case "RECORD": {
      return record(request.data["id"], request.data["name"], request.data["channelName"]);
    }
  }
}

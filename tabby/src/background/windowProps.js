import G from "./globals"
import { updateContextMenu } from "./contextMenu";

export function setWindowProp(windowId, name) {
  if (name) {
    if (!G.windowProperties.hasOwnProperty(windowId)) {
      G.windowProperties[windowId] = {};
    }
    G.windowProperties[windowId]["name"] = name;
  } else {
    delete G.windowProperties[windowId];
  }
  return updateContextMenu();
}

export function getWindowProps() {
  return G.windowProperties;
}
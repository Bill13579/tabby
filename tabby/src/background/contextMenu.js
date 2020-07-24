import G from "./globals"

let updating = false;
let callback = undefined;

export async function updateContextMenu() {
  if (!updating) {
    updating = true;
    await browser.contextMenus.removeAll();
    await browser.contextMenus.create({
      id: "tabby-send-tab-to",
      title: "Send Tab to...",
      contexts: ["audio", "editable", "frame", "image", "link", "page", "password", "selection", "tab", "video"],
    });
    let windows = await browser.windows.getAll({
      populate: false,
      windowTypes: ["normal"],
    });
    for (let i = 0; i < windows.length; i++) {
      let windowId = windows[i].id;
      await browser.contextMenus.create({
        parentId: "tabby-send-tab-to",
        title: G.windowProperties.hasOwnProperty(windowId.toString()) ? G.windowProperties[windowId.toString()].name : "Window " + (i + 1),
        onclick: (info, tab) => {
          browser.tabs.move(tab.id, {
            windowId: parseInt(windowId),
            index: -1
          });
        }
      });
    }
    await browser.contextMenus.create({
      parentId: "tabby-send-tab-to",
      type: "separator"
    });
    await browser.contextMenus.create({
      parentId: "tabby-send-tab-to",
      title: "A New Window",
      onclick: (info, tab) => {
        browser.windows.create({
          tabId: tab.id,
          incognito: tab.incognito
        });
      }
    });
    updating = false;
    if (callback) {
      callback();
      callback = undefined;
    }
  } else {
    callback = updateContextMenu;
  }
}
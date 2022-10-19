import "Polyfill"
import { $local$, $sync$, $localtmp$ } from "../tapi/store";
import { TSession } from "../tapi/tsession";

// import { TSession } from "tapi/tsession";

// (async () => {
//     window.sess = await TSession.read_from_current();
//     window.sess.enableBrowserHooks();
// })();

browser.runtime.onInstalled.addListener(({ reason }) => {
    if (reason !== "browser_update" && reason !== "chrome_update" && reason !== "shared_module_update") {
        browser.tabs.create({
            active: true,
            url: "https://github.com/Bill13579/tabby/wiki/Everything-new-in-Tabby-3.0"
        });
    }
});

// Setup "Send Tab to..."
let attachedEventListener = {};
let updateContextMenu = async () => {
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
        let windowName = await $localtmp$.getOne(`window${windowId}`);
        let menuId = await browser.contextMenus.create({
            parentId: "tabby-send-tab-to",
            title: windowName ? windowName : "Window " + (i+1),
            onclick: (info, tab) => {
                browser.tabs.move(tab.id, {
                    windowId: parseInt(windowId),
                    index: -1
                });
            }
        });
        if (attachedEventListener.hasOwnProperty(windowId)) {
            $localtmp$.removeFulfiller(`window${windowId}`, attachedEventListener[windowId]);
        }
        attachedEventListener[windowId] = (windowName) => browser.contextMenus.update(menuId, {
            title: windowName ? windowName : "Window " + (i+1)
        });
        $localtmp$.addFulfiller(`window${windowId}`, attachedEventListener[windowId]);
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
};
updateContextMenu();
browser.windows.onCreated.addListener(async _ => {
    await updateContextMenu();
});
browser.windows.onRemoved.addListener(async _ => {
    await updateContextMenu();
});

browser.runtime.onMessage.addListener((message) => {
    if (message["_"] !== "sflv1_openSession") return;
    let { store, mozContextualIdentityMap } = message;
    if (store === "local") {
        store = $local$;
    } else if (store === "sync") {
        store = $sync$;
    }
    store.getOne("sflv1_rel").then(rel => {
        store.retrieveLarge("sflv1_tabs").then(async tabs => {
            let sess = TSession.fromSerializable({ rel: JSON.parse(rel), tabs: JSON.parse(LZString.decompressFromUTF16(tabs)) });
            await sess.openAll(mozContextualIdentityMap);
        });
    });
});


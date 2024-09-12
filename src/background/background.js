import "Polyfill"
import { $local$, $sync$, $localtmp$ } from "../tapi/store";
import { ExecutionState } from "../tapi/ping";
import { TSession } from "../tapi/tsession";
import { TTabActions } from "../tapi/taction";
import LZString from "lz-string";

// import { TSession } from "tapi/tsession";

// (async () => {
//     window.sess = await TSession.read_from_current();
//     window.sess.enableBrowserHooks();
// })();

browser.runtime.onInstalled.addListener(({ reason }) => {
    if (reason !== "browser_update" && reason !== "chrome_update" && reason !== "shared_module_update") {
        browser.tabs.create({
            active: true,
            url: "https://github.com/Bill13579/tabby/wiki/3.2-The-Uwa!!-So-QoL%E2%99%AB-Update"
        });
    }
});

// Setup "Send Tab to..."
browser.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId.startsWith("tabby-send-tab-to-")) {
        let moveTo = info.menuItemId.replace("tabby-send-tab-to-", "");
        switch (moveTo) {
            case "":
                break;
            case "-":
            case "new":
                browser.windows.create({
                    tabId: tab.id,
                    incognito: tab.incognito
                });
                break;
            default:
                browser.tabs.move(tab.id, {
                    windowId: parseInt(moveTo),
                    index: -1
                });
                break;
        }
    }
});
let updateContextMenu = async () => {
    await browser.contextMenus.removeAll();
    await browser.contextMenus.create({
        id: "tabby-send-tab-to-",
        title: "Send Tab to...",
        contexts: ["audio", "editable", "frame", "image", "link", "page", "selection", "video"],
    });
    let windows = await browser.windows.getAll({
        populate: false,
        windowTypes: ["normal"],
    });
    for (let i = 0; i < windows.length; i++) {
        let windowId = windows[i].id;
        let windowName = await $localtmp$.getOne(`window${windowId}`);
        let menuId = await browser.contextMenus.create({
            parentId: `tabby-send-tab-to-`,
            id: `tabby-send-tab-to-${windowId}`,
            title: windowName ? windowName : "Window " + (i+1)
        });
    }
    await browser.contextMenus.create({
        parentId: "tabby-send-tab-to-",
        id: "tabby-send-tab-to--",
        type: "separator"
    });
    await browser.contextMenus.create({
        parentId: "tabby-send-tab-to-",
        id: "tabby-send-tab-to-new",
        title: "A New Window"
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

// Mechanism for taking over from the popup when it needs to move tabs to a new window
// Note: async onMessage listeners always return a Promise, thus, if the listener is async, it will always take over and sendResponse before the correct one can, ruining every single piece of code that needs to return something after
browser.runtime.onMessage.addListener(message => {
    if (message["_"] !== "menuMoveTabsToANewWindow") return;
    return (async () => {
        if (message.tabIds.length > 0) {
            let firstTab = await browser.tabs.get(message.tabIds[0])
            let window = await browser.windows.create({ incognito: firstTab.incognito });
            await new TTabActions(...message.tabIds).moveTo(window.id, -1);
            if (window.tabs.length > 0) {
                await new TTabActions(window.tabs[0].id).remove();
            }
        }
    })();
});

// Mechanism for updating the menu when the window name is changed from the popup
let exec_state = new ExecutionState();
browser.runtime.onMessage.addListener((message) => {
    if (message["_"] !== "__ping") return;
    if (message["id"] !== "listenForUpdatesToWindowName") return;
    
    if (exec_state.requiresSetup()) {
        // Make sure that any custom listeners are set up here
        $localtmp$.addFulfiller("*", async (optionValue, optionID) => {
            if (!optionID.startsWith("window")) return;
            let windowId = parseInt(optionID.replace("window", ""));
            if (isNaN(windowId)) return;

            //TODO: Replace this wordaround with something official. It get the order of the window based on browser.tabs.get({}) when it should be getting it from a global Tabby TSession. However, as there's no global Tabby TSession at the moment (it's completely reliant on the browser's internal states and doesn't maintain its own realtime records inside of storage, Tabby's own window order doesn't exist so querying for the browser's internal window order should suffice for now)
            // ---
            let allWindows = await browser.windows.getAll({
                populate: false,
                windowTypes: ["normal"],
            });
            let i = 0;
            for (let w of allWindows) {
                if (w.id === windowId) {
                    break;
                } else {
                    i++;
                }
            }
            // ---

            await browser.contextMenus.update(`tabby-send-tab-to-${windowId}`, {
                title: optionValue ? optionValue : "Window " + (i+1)
            });
        });

        exec_state.started();
    }

    return Promise.resolve();
});


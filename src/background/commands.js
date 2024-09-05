import "Polyfill";
import { $local$ } from "../tapi/store";
import { StorageSpacePersistentObject } from "../tapi/storeobj";

import { TTabActions, TWindowActions } from "../tapi/taction";
import { closeTabby, cycleLayout, LAYOUT_POPUP, openTabby } from "./exports";

// For tracking the tab and window last selected by the user
let currentTabId, lastTabId, currentWindowId, lastWindowId, dropCurrentTabId, dropCurrentWindowId;
// For tracking if the user wanted the focus to be on the search bar on startup of the next popup
let __search;
// For tracking if the user has just requested for Tabby to be opened. Unset after first retrieval by any popup
let __justOpened;

async function batchInit() {
    currentTabId = await new StorageSpacePersistentObject($local$, "cmd-last-used__current-tab-id").initialize();
    lastTabId = await new StorageSpacePersistentObject($local$, "cmd-last-used__last-tab-id").initialize();
    currentWindowId = await new StorageSpacePersistentObject($local$, "cmd-last-used__current-window-id").initialize();
    lastWindowId = await new StorageSpacePersistentObject($local$, "cmd-last-used__last-window-id").initialize();
    dropCurrentTabId = await new StorageSpacePersistentObject($local$, "cmd-last-used__drop-current-tab-id").initialize(false);
    dropCurrentWindowId = await new StorageSpacePersistentObject($local$, "cmd-last-used__drop-current-window-id").initialize(false);

    __search = await new StorageSpacePersistentObject($local$, "focus__search").initialize();
    __justOpened = await new StorageSpacePersistentObject($local$, "focus__justOpened").initialize(false);
}
// Batch initialize
batchInit();

// These objects are NOT guaranteed to exist in browser storage! They are simply shells to set and get the data in these values directly from browser storage, and could very well return undefined if the key has never been set before
function batchInitShells() {
    // Since this function just creates a bunch of empty shells, if unnecessary, don't replace already initialized objects with caches
    if (!currentTabId) currentTabId = new StorageSpacePersistentObject($local$, "cmd-last-used__current-tab-id");
    if (!lastTabId) lastTabId = new StorageSpacePersistentObject($local$, "cmd-last-used__last-tab-id");
    if (!currentWindowId) currentWindowId = new StorageSpacePersistentObject($local$, "cmd-last-used__current-window-id");
    if (!lastWindowId) lastWindowId = new StorageSpacePersistentObject($local$, "cmd-last-used__last-window-id");
    if (!dropCurrentTabId) dropCurrentTabId = new StorageSpacePersistentObject($local$, "cmd-last-used__drop-current-tab-id");
    if (!dropCurrentWindowId) dropCurrentWindowId = new StorageSpacePersistentObject($local$, "cmd-last-used__drop-current-window-id");

    if (!__search) __search = new StorageSpacePersistentObject($local$, "focus__search");
    if (!__justOpened) __justOpened = new StorageSpacePersistentObject($local$, "focus__justOpened");
}

// Note: async onMessage listeners always return a Promise, thus, if the listener is async, it will always take over and sendResponse before the correct one can, ruining every single piece of code that needs to return something after
browser.runtime.onMessage.addListener(message => {
    if (message["_"] !== "justOpened") return;
    return (async () => {
        await batchInit();
        let result = {
            "_": "justOpened",
            "justOpened": await __justOpened.get()
        };
        if (__justOpened.cache()) await __justOpened.set(false);
        return result;
    })();
});
browser.runtime.onMessage.addListener(message => {
    if (message["_"] !== "initialFocus") return;
    return (async () => {
        await batchInit();
        let result = {
            "_": "initialFocus",
            "search": await __search.get()
        };
        if (__search.cache() !== undefined) await __search.set(undefined);
        return result;
    })();
});

browser.tabs.onActivated.addListener(async (activeInfo) => {
    await batchInit();
    if (await dropCurrentTabId.get()) {
        await lastTabId.set(await currentTabId.get());
    } else {
        await dropCurrentTabId.set(true);
    }
    await currentTabId.set(activeInfo.tabId);
});
browser.tabs.onRemoved.addListener(async (tabId, _) => {
    await batchInit();
    if (await lastTabId.get() === tabId) {
        await lastTabId.set(undefined);
    }
    if (await currentTabId.get() === tabId) {
        await currentTabId.set(undefined);
        await dropCurrentTabId.set(false);
    }
});
browser.windows.onFocusChanged.addListener(async (windowId) => {
    await batchInit();
    if (windowId !== browser.windows.WINDOW_ID_NONE) {
        if (await dropCurrentWindowId.get()) {
            await lastWindowId.set(await currentWindowId.get());
        } else {
            await dropCurrentWindowId.set(true);
        }
        await currentWindowId.set(windowId);
        await browser.tabs.query({
            active: true,
            windowId: windowId
        }).then(async tabs => {
            if (tabs[0].id !== await currentTabId.get()) {
                if (await dropCurrentTabId.get()) {
                    await lastTabId.set(currentTabId.cache());
                } else {
                    await dropCurrentTabId.set(true);
                }
                await currentTabId.set(tabs[0].id);
            }
        });
    }
});
browser.windows.onRemoved.addListener(async (windowId) => {
    await batchInit();
    if (await lastWindowId.get() === windowId) {
        await lastWindowId.set(undefined);
    }
    if (await currentWindowId.get() === windowId) {
        await currentWindowId.set(undefined);
        await dropCurrentWindowId.set(false);
    }
});

browser.commands.onCommand.addListener((name) => {
    batchInitShells();
    switch (name) {
        case "open-tabby-focus-current": {
            __search.set(false); //TODO: Add await after Mozilla removes user-action restrictions!
            __justOpened.set(true); //TODO: Add await after Mozilla removes user-action restrictions!
            openTabby(LAYOUT_CACHE);
            break;
        }
        case "open-tabby-focus-search": {
            __search.set(true); //TODO: Add await after Mozilla removes user-action restrictions!
            __justOpened.set(true); //TODO: Add await after Mozilla removes user-action restrictions!
            openTabby(LAYOUT_CACHE);
            break;
        }
        case "open-tabby-switch-view": {
            __search.set(false); //TODO: Add await after Mozilla removes user-action restrictions!
            __justOpened.set(true); //TODO: Add await after Mozilla removes user-action restrictions!
            closeTabby();
            openTabby(cycleLayout(LAYOUT_CACHE), true);
            $local$.modify("memory:layout", layout => cycleLayout(layout), true);
            break;
        }
    }
});
browser.commands.onCommand.addListener(async (name) => {
    await batchInit();
    switch (name) {
        case "last-used-tab": {
            if (await lastTabId.get() !== undefined) {
                await new TTabActions(lastTabId.cache()).activate();
                let w = await browser.windows.getLastFocused({ populate: false });
                let tab = await browser.tabs.get(lastTabId.cache())
                if (w.id !== tab.windowId) {
                    await new TWindowActions(tab.windowId).activate();
                    await lastTabId.set(await currentTabId.get());
                }
            }
            break;
        }
        case "last-used-window": {
            if (await lastWindowId.get() !== undefined) {
                await new TWindowActions(lastWindowId.cache()).activate();
            }
            break;
        }
    }
});
let LAYOUT_CACHE = LAYOUT_POPUP;
$local$.fulfill("memory:layout", layout => {
    LAYOUT_CACHE = layout;
});


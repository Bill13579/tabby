import "Polyfill"
import G from "./globals"
import { onMessage } from "./event-listeners/message"
import { tabActivated, tabUpdated, tabRemoved } from "./event-listeners/tab"
import { windowFocusChanged, windowRemoved, windowCreated } from "./event-listeners/window"
import { onCommand } from "./event-listeners/command"
import { onInstalled } from "./event-listeners/installed"
import { updateContextMenu } from "./contextMenu"

if (!browser.runtime.onInstalled.hasListener(onInstalled)) {
    browser.runtime.onInstalled.addListener(onInstalled);
}

// Set initial tab id
browser.tabs.query({
    active: true,
    currentWindow: true
}).then(tabs => {
    G.currentTabId = tabs[0].id;
    G.dropCurrentTabId = true;
});

// Set initial window id
browser.windows.getLastFocused({}).then(w => {
    G.currentWindowId = w.id;
    G.dropCurrentWindowId = true;
});

// Watch out for any changes in tabs & windows
browser.tabs.onUpdated.addListener(tabUpdated);
browser.tabs.onActivated.addListener(tabActivated);
browser.tabs.onRemoved.addListener(tabRemoved);
browser.windows.onRemoved.addListener(windowRemoved);
browser.windows.onFocusChanged.addListener(windowFocusChanged);
browser.windows.onCreated.addListener(windowCreated);

// Watch out for any commands
browser.commands.onCommand.addListener(onCommand);

// Watch out for any messages
browser.runtime.onMessage.addListener(onMessage);

// Update context menus
updateContextMenu();

// Save for Later (SfL)

import "Polyfill"
import { setWindowProp, getWindowProps } from "./windowProps";

// Run code after a tab loads
function runAfterTabLoad(tabId, f) {
    return new Promise((resolve, reject) => {
        let listener = (uTabId, info) => {
            if (uTabId === tabId && info.status === 'complete') {
                browser.tabs.onUpdated.removeListener(listener);
                resolve(f());
            }
        };
        browser.tabs.onUpdated.addListener(listener);
    });
}

async function tabInfoToRecord(info) {
    return {
        url: info.url,
        title: info.title,
        active: info.active,
        muted: info.mutedInfo.muted,
        pinned: info.pinned,
        container: info.hasOwnProperty("cookieStoreId") && !["firefox-default", "firefox-private"].includes(info.cookieStoreId) ? {
            id: info.cookieStoreId,
            name: (await browser.contextualIdentities.get(info.cookieStoreId)).name,
        } : null,
    };
}

export async function record(ids=undefined, name=null, channelName="Default") {
    if (ids === undefined) ids = (await browser.windows.getAll()).map(w => w.id);
    let newRecord = await serializeSession(ids, name);
    let data = await browser.storage.sync.get(["save-for-later"]);
    if (data["save-for-later"]["channels"][channelName] !== undefined) {
        if (data["save-for-later"]["channels"][channelName]["records"].length >= data["save-for-later"]["channels"][channelName]["maximum-number-of-records"]) {
            data["save-for-later"]["channels"][channelName]["records"].shift();
        }
        data["save-for-later"]["last-modified-channel"] = channelName;
        data["save-for-later"]["channels"][channelName]["records"].push(newRecord);
    }
    return browser.storage.sync.set(data);
}

async function serializeSession(ids, name=null) {
    let t = Date.now();
    let windowProperties = getWindowProps();
    let windowArray = [];
    for (let windowId of ids) {
        let tabArray = [];
        let { tabs, incognito } = await browser.windows.get(windowId, {
            populate: true
        });
        for (let tab of tabs) {
            await browser.tabs.sendMessage(tab.id, { target: "packd", data: { action: "pack" } }).then(async pack => {
                tabArray.push(Object.assign({
                    pack: pack
                }, await tabInfoToRecord(tab)));
            }).catch(async reason => {
                tabArray.push(Object.assign({
                    pack: undefined
                }, await tabInfoToRecord(tab)));
            });
        }
        windowArray.push({
            name: windowProperties.hasOwnProperty(windowId) ? windowProperties[windowId].name : null,
            incognito,
            tabs: tabArray,
        });
    }
    return {
        name,
        timestamp: t,
        windows: windowArray,
    };
}

export function restoreWindow(windowRecord) {
    if (browser.runtime.getBrowserInfo) {
        windowRecord.tabs = windowRecord.tabs.filter(tabRecord => 
            (!tabRecord.url.startsWith("about:") || ["about:blank", "about:newtab"].includes(tabRecord.url)) &&
            !tabRecord.url.startsWith("chrome:") &&
            !tabRecord.url.startsWith("javascript:") &&
            !tabRecord.url.startsWith("data:") &&
            !tabRecord.url.startsWith("file:"));
    }
    return browser.windows.create({
        incognito: windowRecord["incognito"],
    }).then(async w => {
        let originalNewTab = w.tabs[0].id;
        let oneTabDown = false;
        await setWindowProp(w.id, windowRecord["name"]);
        for (let i = 0; i < windowRecord.tabs.length; i++) {
            let tabRecord = windowRecord.tabs[i];
            browser.tabs.create(Object.assign(tabRecord.container ? { cookieStoreId: tabRecord.container.id } : { }, {
                url: tabRecord.url,
                active: tabRecord.active,
                pinned: tabRecord.pinned,
                windowId: w.id,
            })).then(async t => {
                browser.tabs.update(t.id, {
                    muted: tabRecord.muted
                });
                if (tabRecord.pack) {
                    await runAfterTabLoad(t.id, () => {
                        browser.tabs.sendMessage(t.id, {
                            target: "packd",
                            data: Object.assign({action: "unpack"}, tabRecord.pack)
                        });
                    });
                }
                if (!oneTabDown) {
                    oneTabDown = true;
                    browser.tabs.remove(originalNewTab);
                }
            }).catch(e => {
                console.log(e);
            });
        }
    });
}
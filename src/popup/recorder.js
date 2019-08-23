import "Polyfill"
import G from "./globals"
import { getTabId } from "./wtdom"
import { runAfterTabLoad } from "./wtutils";

export async function lastRecord() {
    return browser.storage.local.get(["record"]).then(data => data.record);
}

function tabInfoToRecord(info) {
    return {
        url: info.url,
        pinned: info.pinned
    };
}
export async function record() {
    let record = [];
    for (let windowEntry of G.tabsList.getElementsByClassName("window-entry")) {
        let windowRecord = [];
        for (let tabEntry of windowEntry.getElementsByClassName("tab-entry")) {
            await browser.tabs.sendMessage(getTabId(tabEntry), { target: "packd", data: { action: "pack" } }).then(async pack => {
                windowRecord.push(Object.assign({
                    pack: pack
                }, tabInfoToRecord(await browser.tabs.get(getTabId(tabEntry)))));
            }).catch(async reason => {
                windowRecord.push(Object.assign({
                    pack: undefined
                }, tabInfoToRecord(await browser.tabs.get(getTabId(tabEntry)))));
            });
        }
        record.push(windowRecord);
    }
    return browser.storage.local.set({ record: record });
}

export async function restore() {
    let r = await lastRecord();
    for (let windowRecord of r) {
        browser.windows.create().then(w => {
            for (let tabRecord of windowRecord) {
                browser.tabs.create({
                    url: tabRecord.url,
                    windowId: w.id,
                    pinned: tabRecord.pinned
                }).then(t => {
                    if (tabRecord.pack) {
                        runAfterTabLoad(t.id, () => {
                            browser.tabs.sendMessage(t.id, {
                                target: "packd",
                                data: Object.assign({action: "unpack"}, tabRecord.pack)
                            });
                        });
                    }
                });
            }
            browser.tabs.remove(w.tabs[0].id);
        });
    }
}

import "Polyfill"
import G from "./globals"
import { getTabId } from "./wtdom"

export async function lastRecord() {
    return browser.storage.local.get(["record"]).then(data => data.record);
}

export async function record() {
    let record = [];
    for (let windowEntry of G.tabsList.getElementsByClassName("window-entry")) {
        let windowRecord = [];
        for (let tabEntry of windowEntry.getElementsByClassName("tab-entry")) {
            windowRecord.push({
                url: (await browser.tabs.get(getTabId(tabEntry))).url,
                pack: await browser.tabs.sendMessage(getTabId(tabEntry), { target: "packd", data: { action: "pack" } })
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
                    windowId: w.id
                }).then(t => {
                    browser.tabs.sendMessage(t.id, {
                        target: "packd",
                        data: Object.assign({action: "unpack"}, tabRecord.pack)
                    });
                });
            }
        });
    }
}

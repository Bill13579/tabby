import "Polyfill"

// Function to send a message to the runtime
export function sendRuntimeMessage(type, data) {
    return browser.runtime.sendMessage({
        type: type,
        data: data
    });
}

export async function restoreWindow(windowRecord) {
    await sendRuntimeMessage("RESTORE_WINDOW", { windowRecord });
}

export async function record(ids=undefined, name=undefined, channelName=undefined) {
    await sendRuntimeMessage("RECORD", { ids, name, channelName });
}

export async function restore(record) {
    for (let windowRecord of record["windows"]) {
        restoreWindow(windowRecord);
    }
}

export async function hasSFLvt2() {
    let saveForLater = (await browser.storage.sync.get("save-for-later"))["save-for-later"];
    if (saveForLater) {
        return true;
    } else {
        return false;
    }
}
export async function restoreSFLvt2() {
    let saveForLater = (await browser.storage.sync.get("save-for-later"))["save-for-later"];
    let lastModified = saveForLater["last-modified-channel"];
    let recentChannelRecords = saveForLater["channels"][lastModified]["records"];
    restore(recentChannelRecords[recentChannelRecords.length - 1]);
}
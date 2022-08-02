import { StorageSpace } from "../tapi/store";

let tmpClear = async () => {
    console.log("[store] clearing temporary data");
    const $localtmp$ = new StorageSpace("local", "temp", true);
    const $synctmp$ = new StorageSpace("sync", "temp", true);
    await $localtmp$.__delOnStart();
    await $synctmp$.__delOnStart();
    console.log("[store] done!");
};

browser.runtime.onStartup.addListener(tmpClear);
browser.runtime.onInstalled.addListener(tmpClear);

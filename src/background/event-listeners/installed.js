import "Polyfill"
import { INITIAL_OPTIONS } from "../../options/states"

// On Installed
export function onInstalled(details) {
    if (details.reason === "install" || details.reason === "update") {
        // Initialize options
        browser.storage.local.get(["options"]).then(data => {
            if (data["options"] === undefined) {
                data.options = INITIAL_OPTIONS;
                browser.storage.local.set(data);
            }
        });
        // Initialize "Save for Later" DB
        browser.storage.sync.get(["save-for-later", "record"]).then(data => {
            if (data["save-for-later"] === undefined) {
                data["save-for-later"] = {
                    version: 2.1,
                    "last-modified-channel": "Default",
                    channels: {
                        "Default": {
                            "records": [ ]
                        }
                    }
                };
                // Migration from the old data storage format
                browser.storage.sync.set(data).then(() => {
                    if (data["record"] !== undefined) {
                        data["save-for-later"]["channels"]["Default"]["records"].push({
                            "name": null,
                            "timestamp": data["record"]["timestamp"],
                            "windows": data["record"]["record"].map(w => {
                                return {
                                    "name": null,
                                    "incognito": false,
                                    "tabs": w.map(t => Object.assign({
                                        container: null,
                                        title: t.url,
                                        active: false,
                                        muted: false
                                    }, t))
                                };
                            }),
                        });
                        delete data["record"];
                        browser.storage.sync.set(data);
                    }
                });
            }
        });
    }
}

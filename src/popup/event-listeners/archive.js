import "Polyfill"
import G from "../globals"
import { sendTabMessage } from "../messaging"
import { getTabByTabEntry, getTabId } from "../wtdom"

var archiveTarget;

export function archiveDragStartReceiver(e) {
    archiveTarget = e.target;
    e.dataTransfer.effectAllowed = "move";
}

export function archiveDragOverReceiver(e) {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = "move";
    G.archive.classList.add("saving-for-later");
}

export function archiveDropReceiver(e) {
    if (archiveTarget.classList.contains("tab-entry")) {
        getTabByTabEntry(archiveTarget).then(tab => {
            sendTabMessage(getTabId(archiveTarget), "packd", {
                action: "pack"
            }).then(response => {
                browser.storage.sync.get(["archive"], data => {
                    if (!data.archive) {
                        data.archive = {};
                        data.archive.default = [];
                    }
                    var repeat;
                    for (var i = 0; i < data.archive.default.length; i++) {
                        if (data.archive.default[i].url === tab.url) {
                            repeat = i;
                            break;
                        }
                    }
                    var scroll = {
                        top: response.top,
                        left: response.left
                    };
                    repeat === undefined ? data.archive.default.push({ url: tab.url, scroll: scroll }) : data.archive.default[repeat].scroll = scroll;
                    browser.storage.sync.set({ "archive": data.archive });
                });
            });
        });
    }
}

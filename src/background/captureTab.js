/**
 * Capture various information about the tab (e.g. captureTab screenshot, indexing for full-text search)
 */

import "Polyfill"
import { TTabActions } from "../tapi/taction";
import { callContentScript } from "../tapi/content";
import { $localtmp$ } from "../tapi/store";
import { greet, index, init_shard, parse_query, query, shard_doc, shard_uninitialized, unindex, unshard_doc, update_stats } from "../../cartographer/pkg/cartographer";

let _captureTabAbortController;

class AbortError extends Error {  }

async function captureTab(tabId, quality) {
    if (_captureTabAbortController) {
        _captureTabAbortController.abort();
    }
    _captureTabAbortController = new AbortController();
    const signal = _captureTabAbortController.signal;
    try {
        let dataURI = await new TTabActions(tabId).captureTab(signal, quality);
        if (dataURI) {
            return dataURI;
        } else {
            return undefined;
        }
    } catch (e) { throw new AbortError("captureTab aborted"); }
}

browser.runtime.onMessage.addListener(message => {
    if (message["_"] !== "captureTab") return;
    return captureTab(message["tabId"], message["quality"]);
});

/**
 * Gather cartographer documents from temp local store
 */
async function gatherDocs() {
    let keys = (await $localtmp$.getKeys()).filter(key => key.startsWith("cartographer_"));
    return $localtmp$.get(...keys);
}
/**
 * Load documents in memory
 * (Make sure that cartographer is actually uninitialized)
 */
async function initializeCartographerFromStore() {
    console.log("background process terminated: reinitializing");
    init_shard();
    let docs = await gatherDocs();
    for (let key in docs) {
        if (docs.hasOwnProperty(key)) {
            shard_doc(docs[key]);
        }
    }
    console.log("index successfully loaded!");
}

let lastUpdatePromise; // Make sure that updates are made sequentially

class GenericUpdateObject {
    constructor(update_type, ...args) {
        this.update_type = update_type;
        this.args = args;
    }
}
class GenericUpdateBuffer {
    constructor() {
        this.update_buffer = [];
        this.running = false;
    }
    do(update_type, ...args) {
        this.update_buffer.push(new GenericUpdateObject(update_type, ...args));
        this.start();
    }
    async update(update_object) {
        console.log("!!UNIMPLEMENTED GENERIC UPDATE BUFFERS DON'T DO ANYTHING!!");
    }
    async start() {
        if (this.running) return;
        else this.running = true;
        const check_buffer = async () => {
            if (this.update_buffer.length === 0) return 0;
            else await Promise.resolve(this.update(this.update_buffer.shift()));
        };
        while (true) {
            if (await check_buffer() === 0) {
                break;
            }
        }
        this.running = false;
    }
}

// const CartographerUpdateType = {
//     Init: 'Init',
//     GenerateUnindexerAndUnshard: 'GenerateUnindexerAndUnshard',
//     GenerateIndexerAndShard: 'GenerateIndexerAndShard',
// };
// class CartographerUpdateBuffer extends GenericUpdateBuffer {
//     async update(update_object) {
//         switch (update.update_type) {
//             case CartographerUpdateType.Init:
//                 // Re-index
//                 if (shard_uninitialized()) {
//                     await initializeCartographerFromStore();
//                 }
//             break;
//             case CartographerUpdateType.GenerateUnindexerAndUnshard:

//             break;
//             case CartographerUpdateType.GenerateIndexerAndShard:

//             break;
//         }
//     }
// }

let urlDB = {};
const webNavigationListener = async ({tabId, url}) => {
    if (!urlDB.hasOwnProperty(tabId)) {
        urlDB[tabId] = url;
    } else {
        if (urlDB[tabId] === url) {
            return;
        } else {
            urlDB[tabId] = url;
        }
    }

    let a = new Date();
    let content;
    try {
        try {
            content = await callContentScript(tabId, "packd", {
                action: "innerText"
            });
        } catch (e) {
            console.error(`could not contact tab ${tabId}, error: ${e}`);
            console.error("falling back on title+url");
            let tab = await browser.tabs.get(tabId);
            content = {
                innerText: "",
                title: tab.title,
                url: url
            };
        }
    } catch (e) {
        console.log(`could not index tab ${tabId}, error: ${e}`);

        return;
    }

    let updatePromise = lastUpdatePromise;
    lastUpdatePromise = new Promise(async (resolve, reject) => {
        try {
            if (updatePromise) await updatePromise;

            // Re-index
            if (shard_uninitialized()) {
                await initializeCartographerFromStore();
            }
            
            if (!await $localtmp$.hasOne("cartographerStats")) {
                await $localtmp$.set("cartographerStats", `{"totalDocs": 0, "lengthAvg": 0, "occurences": {}}`);
            }
            let cartographerStats = await $localtmp$.getOne("cartographerStats");
            
            // Unindex old doc first if there is one
            let oldDoc = await $localtmp$.getOne(`cartographer_${tabId}`);
            if (oldDoc) {
                let { stats } = unindex(oldDoc, cartographerStats);
                cartographerStats = JSON.stringify(stats);
                unshard_doc(tabId.toString());
            }

            let i = index(tabId.toString(), content.innerText, content.title, content.url, cartographerStats);
            
            let doc = JSON.stringify(i.doc);

            await $localtmp$.set("cartographerStats", JSON.stringify(i.stats));
            await $localtmp$.set(`cartographer_${tabId}`, doc);
            shard_doc(doc);
            
            let b = new Date();
            console.log("indexing took " + (b - a) + "ms");

            resolve();
        } catch (e) {
            console.log(`could not index tab ${tabId}, error: ${e}`);

            resolve(); // Resolve anyways so the chain can keep going
        }
    });
};
browser.webNavigation.onHistoryStateUpdated.addListener(webNavigationListener);
browser.webNavigation.onCompleted.addListener(webNavigationListener);

browser.tabs.onRemoved.addListener((tabId, _) => {
    let updatePromise = lastUpdatePromise;
    lastUpdatePromise = new Promise(async (resolve, reject) => {
        try {
            if (updatePromise) await updatePromise;

            if (!await $localtmp$.hasOne("cartographerStats")) {
                await $localtmp$.set("cartographerStats", `{"totalDocs": 0, "lengthAvg": 0, "occurences": {}}`);
            }
            if (await $localtmp$.hasOne(`cartographer_${tabId}`)) {
                let cartographerStats = await $localtmp$.getOne("cartographerStats");
                let doc = await $localtmp$.getOne(`cartographer_${tabId}`);
        
                let a = new Date();
        
                let i = unindex(doc, cartographerStats);
        
                let b = new Date();
                
                await $localtmp$.set("cartographerStats", JSON.stringify(i.stats));
                await $localtmp$.unset(`cartographer_${tabId}`);
                unshard_doc(tabId.toString());

                console.log(`unindexed ${tabId} in ${(b - a)}ms`);
            }

            resolve();
        } catch (e) {
            console.log(`could not unindex tab ${tabId}, error: ${e}`);

            resolve(); // Resolve anyways so the chain can keep going
        }
    });
});

async function search(ids, signal) {
    let results = {};
    const chunkSize = 10;
    for (let i = 0; i < ids.length; i += chunkSize) {
        if (signal.aborted) throw new AbortError(`search aborted`);
        const chunk = ids.slice(i, i + chunkSize);
        Object.assign(results, query(chunk.join(","), chunk.length));
    }
    if (signal.aborted) throw new AbortError(`search aborted`);
    await browser.runtime.sendMessage({
        _: "search",
        results
    });
}

let _searchAbortController;

async function searchSetup(queryString, ids) {
    if (_searchAbortController) {
        _searchAbortController.abort();
    }
    _searchAbortController = new AbortController();
    const signal = _searchAbortController.signal;

    let stats = await $localtmp$.getOne("cartographerStats");
    update_stats(stats);
    let query = parse_query(queryString);

    search(ids, signal);

    return query;
}

browser.runtime.onMessage.addListener(message => {
    if (message["_"] !== "search") return;
    return searchSetup(message["queryString"], message["ids"]);
});
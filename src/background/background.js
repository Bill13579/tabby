import "Polyfill"
import { $local$, $sync$ } from "../tapi/store";
import { TSession } from "../tapi/tsession";

// import { TSession } from "tapi/tsession";

// (async () => {
//     window.sess = await TSession.read_from_current();
//     window.sess.enableBrowserHooks();
// })();

browser.runtime.onInstalled.addListener(({ reason }) => {
    if (reason !== "install") {
        browser.tabs.create({
            active: true,
            url: "https://github.com/Bill13579/tabby/wiki/Everything-new-in-Tabby-3.0"
        });
    }
});

browser.runtime.onMessage.addListener((message) => {
    if (message["_"] !== "sflv1_openSession") return;
    let { store, mozContextualIdentityMap } = message;
    if (store === "local") {
        store = $local$;
    } else if (store === "sync") {
        store = $sync$;
    }
    store.getOne("sflv1_rel").then(rel => {
        store.retrieveLarge("sflv1_tabs").then(async tabs => {
            let sess = TSession.fromSerializable({ rel: JSON.parse(rel), tabs: JSON.parse(LZString.decompressFromUTF16(tabs)) });
            await sess.openAll(mozContextualIdentityMap);
        });
    });
});


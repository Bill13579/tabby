import "Polyfill"

import { TSession } from "tapi/tsession";

(async () => {
    window.sess = await TSession.read_from_current();
    window.sess.enableBrowserHooks();
})();

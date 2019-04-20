import "Polyfill"
import { module } from "./module"

module("packd", data => {
    switch (data.action) {
        case "pack":
            return Promise.resolve({
                top: document.documentElement.scrollTop || document.body.scrollTop,
                left: document.documentElement.scrollLeft || document.body.scrollLeft
            });
            break;
        case "unpack":
            (document.documentElement.scrollTo || document.body.scrollTo)(data.left, data.top);
            break;
    }
});

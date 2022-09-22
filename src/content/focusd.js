import "Polyfill"
import { module } from "./module"

const PASSTHROUGH = [
    "Meta", "Control", "Shift", "Enter", "Delete",
    "ArrowUp", "ArrowDown",
    "a", "A", "i", "I", "s", "S", "m", "M", "p", "P"
];

let keyDowns = [];
function passthrough(type, key) {
    return browser.runtime.sendMessage({
        _: "initialKeyEventsPassthrough",
        type,
        key
    });
}
function passthroughListener(evt) {
    if (evt.isTrusted && // Make sure that the web page cannot alter things maliciously
        (evt.type === "keydown" || evt.type === "keyup") && 
        PASSTHROUGH.indexOf(evt.key) != -1) {
            evt.preventDefault();
            evt.stopImmediatePropagation();
            passthrough(evt.type, evt.key);
            if (evt.type === "keydown") {
                keyDowns.push(evt.key);
            } else if (evt.type === "keyup") {
                let i = keyDowns.indexOf(evt.key);
                if (i !== -1) {
                    keyDowns.splice(i, 1);
                }
            }
    }
}
function flush() {
    return Promise.all(keyDowns.splice(0, keyDowns.length).map(key => passthrough("keyup", key)));
}

let lastStop;
module("focusd", data => {
    if (data && data.action === "checkPrevious") {
        if (lastStop) {
            let promise = lastStop();
            lastStop = undefined;
            return Promise.resolve(promise);
        } else {
            return Promise.resolve();
        }
    } else {
        window.blur();
        for (let ele of t_getKeyboardFocusableElements()) ele.blur();
        document.addEventListener("keydown", passthroughListener);
        document.addEventListener("keyup", passthroughListener);
        let stopped = false;
        let stop = (evt) => {
            if (!evt.isTrusted) return; // Make sure that the web page cannot alter things maliciously
            if (!stopped) {
                document.removeEventListener("keydown", passthroughListener);
                document.removeEventListener("keyup", passthroughListener);
                document.removeEventListener("focus", stop);
                document.removeEventListener("blur", stop);
                document.removeEventListener("mousedown", stop);
                stopped = true;
                return flush().then(() => passthrough("passthroughover", undefined));
            } else {
                return Promise.resolve();
            }
        };
        lastStop = stop;
        document.addEventListener("focus", stop);
        document.addEventListener("blur", stop);
        document.addEventListener("mousedown", stop);
        return Promise.resolve();
    }
});
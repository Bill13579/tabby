import "Polyfill"

let modules = {};

export function module(name, onRequest) {
    if (modules[name] !== undefined) {
        throw new Error("Module already exists");
    } else {
        modules[name] = onRequest;
    }
}

browser.runtime.onMessage.addListener((message, sender) => {
    let onRequest = modules[message.target];
    if (onRequest !== undefined) {
        return onRequest(message.data);
    }
});
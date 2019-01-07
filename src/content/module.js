var modules = {};

export function module(name, onRequest) {
    if (modules[name] !== undefined) {
        throw new Error("Module already exists");
    } else {
        modules[name] = onRequest;
    }
}

browser.runtime.onMessage.addListener((message, sender) => {
    var onRequest = modules[message.target];
    if (onRequest !== undefined) {
        return onRequest(message.action, message.data);
    }
});

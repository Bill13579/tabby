import "Polyfill"

const globals = {
    wrongToRight: undefined,
    lastTabId: undefined,
    currentTabId: undefined,
    lastWindowId: undefined,
    currentWindowId: undefined,
    dropCurrentTabId: false,
    dropCurrentWindowId: false,
    windowProperties: {},
    events: {
        onpopuploaded: undefined,
        onpopupunloaded: undefined
    }
};
export default globals;

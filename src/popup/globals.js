import "Polyfill"

const globals = {
    tabsList: undefined,
    isSelecting: false,
    selectedTabs: 0,
    slideSelection: {
        sliding: false,
        initiator: undefined,
        vector: 0
    },
    hideAfterTabSelection: undefined,
    searchInURLs: undefined
};
export default globals;

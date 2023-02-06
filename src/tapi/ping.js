// Background ping routine
export function ping(id) {
    return browser.runtime.sendMessage({
        _: "__ping",
        id
    });
}

export class ExecutionState {
    constructor() {
        this.state = false;
    }
    requiresSetup() {
        return !this.state;
    }
    started() {
        this.state = true;
    }
}

let exec_state = new ExecutionState();

// Example for how a ping-based background activation script should be setup to enable the use of custom event listners (ones that do not start with `browser.`)
function EXAMPLE_FLOW() {
    browser.runtime.onMessage.addListener((message) => {
        if (message["_"] !== "__ping") return;
        if (message["id"] !== "<whatever ping id this listener looks out for>") return;
        
        if (exec_state.requiresSetup()) {
            // Make sure that any custom listeners are set up here

            exec_state.started();
        }

        return Promise.resolve();
    });
}
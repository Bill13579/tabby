import "Polyfill"

// Key tracker
export function KeyTracker() {
    this.keys = {};
    window.addEventListener("keydown", e => {
        this.keys[e.code] = true;
    });
    window.addEventListener("keyup", e => {
        this.keys[e.code] = false;
    });
}
KeyTracker.prototype.pressed = function (code) {
    return Boolean(this.keys[code]);
};
KeyTracker.prototype.ctrl = function () {
    return this.pressed("ControlLeft") || this.pressed("ControlRight");
};
KeyTracker.prototype.cmd = function () {
    return this.pressed("OSRight") || this.pressed("OSLeft");
};
KeyTracker.prototype.ctrlOrCmd = function () {
    if (window.navigator.platform.toUpperCase().indexOf("MAC") >= 0) {
        return this.cmd();
    }
    return this.ctrl();
};
KeyTracker.prototype.shift = function () {
    return this.pressed("ShiftLeft") || this.pressed("ShiftRight");
};
export let Keys = new KeyTracker();

// Checks if either Ctrl(Windows & Linux) or Command(Mac) is pressed
export function ctrlOrCmd() {
    return Keys.ctrlOrCmd();
}

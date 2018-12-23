let keyPressed = {};
onkeydown = onkeyup = e => {
    e = e || event;
    keyPressed[e.code] = e.type == "keydown";
};

// Checks if either Ctrl(Windows & Linux) or Command(Mac) is pressed
export function ctrlOrCmd() {
    if (window.navigator.platform.toUpperCase().indexOf("MAC") >= 0) {
        return keyPressed["OSRight"] || keyPressed["OSLeft"];
    }
    return keyPressed["ControlLeft"] || keyPressed["ControlRight"];
}

import "Polyfill"
import { module } from "./module"

function click(x, y) {
    x = Math.floor(x * window.innerWidth);
    y = Math.floor(y * window.innerHeight);
    let elementAtPoint = document.elementFromPoint(x, y);
    let eventParams = {
        clientX: x,
        clientY: y,
        button: 0,
        bubbles: true,
        cancelable: true,
        view: window,
    };
    elementAtPoint.dispatchEvent(new MouseEvent("mousedown", eventParams));
    elementAtPoint.dispatchEvent(new MouseEvent("mouseup", eventParams));
    elementAtPoint.dispatchEvent(new MouseEvent("click", eventParams));
}

module("minid", data => {
    click(data.x, data.y);
});
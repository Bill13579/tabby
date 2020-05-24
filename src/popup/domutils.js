import "Polyfill"

// Stop propagation event listener
export function stopPropagation(e) {
    e.stopPropagation();
}

// Toggle a class of an element
export function toggleClass(element, c) {
    if (element.classList.contains(c)) {
        element.classList.remove(c);
    } else {
        element.classList.add(c);
    }
}

// Get actual height of an element
export function getActualHeight(element) {
    let styles = window.getComputedStyle(element);
    let margin = parseFloat(styles['marginTop']) +
               parseFloat(styles['marginBottom']);
    return element.offsetHeight + margin;
}

// Get actual width of an element
export function getActualWidth(element) {
    let styles = window.getComputedStyle(element);
    let margin = parseFloat(styles['marginLeft']) +
               parseFloat(styles['marginRight']);
    return element.offsetWidth + margin;
}

// getElementByClassName
Element.prototype.getElementByClassName = function (classNames) {
    return this.getElementsByClassName(classNames)[0] || null;
};

export function showContextMenu(x, y, ctxMenu) {
    ctxMenu.setAttribute("data-state", "on");
    ctxMenu.style.top = y + "px";
    ctxMenu.style.left = x + "px";
}

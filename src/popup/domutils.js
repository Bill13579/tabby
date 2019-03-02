import "Polyfill"

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

// getElementByClassName
Element.prototype.getElementByClassName = function (classNames) {
    return this.getElementsByClassName(classNames)[0] || null;
};

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
    var styles = window.getComputedStyle(element);
    var margin = parseFloat(styles['marginTop']) +
               parseFloat(styles['marginBottom']);
    return element.offsetHeight + margin;
}

// getElementByClassName
Element.prototype.getElementByClassName = function (classNames) {
    return this.getElementsByClassName(classNames)[0] || null;
};

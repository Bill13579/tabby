import smoothscroll from 'smoothscroll-polyfill';
// kick off the polyfill!
try {
    smoothscroll.polyfill();
} catch (e) {
    console.log(e); // Will fail in service workers, but that's ok.
}

import 'proxy-polyfill';

export const TargetBrowser = TARGET;

let globalScope; // `self` is the global scope inside a service worker.

if (TARGET === "chrome") {
    globalScope = self;
    globalScope["browser"] = require("webextension-polyfill");
} else {
    globalScope = window;
}

if (!Array.from) {
    Array.from = (function () {
        let toStr = Object.prototype.toString;
        let isCallable = function (fn) {
            return typeof fn === 'function' || toStr.call(fn) === '[object Function]';
        };
        let toInteger = function (value) {
            let number = Number(value);
            if (isNaN(number)) { return 0; }
            if (number === 0 || !isFinite(number)) { return number; }
            return (number > 0 ? 1 : -1) * Math.floor(Math.abs(number));
        };
        let maxSafeInteger = Math.pow(2, 53) - 1;
        let toLength = function (value) {
            let len = toInteger(value);
            return Math.min(Math.max(len, 0), maxSafeInteger);
        };

        // The length property of the from method is 1.
        return function from(arrayLike/*, mapFn, thisArg */) {
            // 1. Let C be the this value.
            let C = this;

            // 2. Let items be ToObject(arrayLike).
            let items = Object(arrayLike);

            // 3. ReturnIfAbrupt(items).
            if (arrayLike == null) {
                throw new TypeError('Array.from requires an array-like object - not null or undefined');
            }

            // 4. If mapfn is undefined, then let mapping be false.
            let mapFn = arguments.length > 1 ? arguments[1] : void undefined;
            let T;
            if (typeof mapFn !== 'undefined') {
                // 5. else
                // 5. a If IsCallable(mapfn) is false, throw a TypeError exception.
                if (!isCallable(mapFn)) {
                    throw new TypeError('Array.from: when provided, the second argument must be a function');
                }

                // 5. b. If thisArg was supplied, let T be thisArg; else let T be undefined.
                if (arguments.length > 2) {
                    T = arguments[2];
                }
            }

            // 10. Let lenValue be Get(items, "length").
            // 11. Let len be ToLength(lenValue).
            let len = toLength(items.length);

            // 13. If IsConstructor(C) is true, then
            // 13. a. Let A be the result of calling the [[Construct]] internal method 
            // of C with an argument list containing the single item len.
            // 14. a. Else, Let A be ArrayCreate(len).
            let A = isCallable(C) ? Object(new C(len)) : new Array(len);

            // 16. Let k be 0.
            let k = 0;
            // 17. Repeat, while k < len… (also steps a - h)
            let kValue;
            while (k < len) {
                kValue = items[k];
                if (mapFn) {
                    A[k] = typeof T === 'undefined' ? mapFn(kValue, k) : mapFn.call(T, kValue, k);
                } else {
                    A[k] = kValue;
                }
                k += 1;
            }
            // 18. Let putStatus be Put(A, "length", len, true).
            A.length = len;
            // 20. Return A.
            return A;
        };
    }());
}

globalScope["t_delay"] = ms => new Promise(res => setTimeout(res, ms));

globalScope["t_in"] = (obj, key) => obj.hasOwnProperty(key);

globalScope["t_arrayBufferToBase64"] = function arrayBufferToBase64(buffer) {
    let binary = "";
    let bytes = [].slice.call(new Uint8Array(buffer));
    bytes.forEach((b) => binary += String.fromCharCode(b));
    return globalScope.btoa(binary);
};

globalScope["t_getImage"] = function (url, noCache=false) {
    return new Promise((resolve, reject) => {
        try {
            if (!url.startsWith("chrome://")) {
                let xhr = new XMLHttpRequest();
                xhr.onreadystatechange = function () {
                    if (this.readyState == 4) {
                        if (this.status == 200) {
                            let contentType = xhr.getResponseHeader("Content-Type").trim();
                            if (contentType.startsWith("image/")) {
                                let flag = "data:" + contentType + ";charset=utf-8;base64,";
                                let imageStr = t_arrayBufferToBase64(xhr.response);
                                resolve(flag + imageStr);
                            } else {
                                reject("Image Request Failed: Content-Type is not an image! (Content-Type: \"" + contentType + "\")");
                            }
                        } else {
                            reject(this.status);
                        }
                    }
                };
                xhr.responseType = "arraybuffer";
                xhr.open("GET", url, true);
                if (noCache) { xhr.setRequestHeader("Cache-Control", "no-store"); }
                xhr.send();
            } else {
                resolve();
            }
        } catch (err) {
            reject(err.message);
        }
    });
};

globalScope["t_ctrlCmdKey"] = function () {
    if (navigator.platform.indexOf("Mac") >= 0 || navigator.platform === "iPhone") {
        return "Meta";
    } else {
        return "Control";
    }
};

globalScope["t_getElementsBetween"] = function (node1, node2, condition=_ => true) {
    if (!node1.parentElement.isSameNode(node2.parentElement)) return undefined; // can't perform function
    if (node1.isSameNode(node2)) return [];
    let between = [];

    let getNext = (n) => n.nextElementSibling;
    if (node1.compareDocumentPosition(node2) & Node.DOCUMENT_POSITION_PRECEDING) {
        getNext = (n) => n.previousElementSibling;
    }

    let nextNode = getNext(node1);
    while (nextNode && !nextNode.isSameNode(node2)) {
        if (condition(nextNode)) {
            between.push(nextNode);
        }

        nextNode = getNext(nextNode);
    }

    return between;
};

globalScope["t_getInView"] = function (e, frame, alignToTop) {
    let tbounding = frame.getBoundingClientRect();
    let bounding = e.getBoundingClientRect();
    if (tbounding.y > bounding.y
        || tbounding.y > (bounding.y + bounding.height)
        || bounding.y >= (tbounding.y + tbounding.height)
        || (bounding.y + bounding.height) >= (tbounding.y + tbounding.height)) {
        e.scrollIntoView(alignToTop);
    }
}

// https://stackoverflow.com/questions/4811822/get-a-ranges-start-and-end-offsets-relative-to-its-parent-container/4812022#4812022
globalScope["t_getCaretPosition"] = function (element) {
    var caretOffset = 0;
    var doc = element.ownerDocument || element.document;
    var win = doc.defaultView || doc.parentWindow;
    var sel;
    if (typeof win.getSelection != "undefined") {
        sel = win.getSelection();
        if (sel.rangeCount > 0) {
            var range = win.getSelection().getRangeAt(0);
            var preCaretRange = range.cloneRange();
            preCaretRange.selectNodeContents(element);
            preCaretRange.setEnd(range.endContainer, range.endOffset);
            caretOffset = preCaretRange.toString().length;
        }
    } else if ((sel = doc.selection) && sel.type != "Control") {
        var textRange = sel.createRange();
        var preCaretTextRange = doc.body.createTextRange();
        preCaretTextRange.moveToElementText(element);
        preCaretTextRange.setEndPoint("EndToEnd", textRange);
        caretOffset = preCaretTextRange.text.length;
    }
    return caretOffset;
}

function setCaret(element, pos) {
    var range = document.createRange();
    var sel = window.getSelection();

    range.setStart(element, pos);
    range.collapse(true);

    sel.removeAllRanges();
    sel.addRange(range);
}

// t_setCaretPosition with consideration for child elements
globalScope["t_setCaretPosition"] = function (element, caretPos) {
    let pos = 0;
    let relativeCaretPos = caretPos;
    for (let node of element.childNodes) {
        if (node.nodeType === Node.TEXT_NODE) {
            pos += node.nodeValue.length;
            if (caretPos <= pos) {
                setCaret(node, relativeCaretPos);
                return;
            }
            relativeCaretPos -= node.nodeValue.length;
        } else if (node.nodeType === Node.ELEMENT_NODE) {
            let t = node.innerText;
            pos += t.length;
            if (caretPos <= pos) {
                t_setCaretPosition(node, relativeCaretPos);
                return;
            }
            relativeCaretPos -= t.length;
        }
    }
}

globalScope["t_stripHtml"] = function (html) {
    let doc = new DOMParser().parseFromString(html, "text/html");
    return doc.body.textContent || "";
}

globalScope["t_byteLen"] = (str) => new Blob([str]).size;

globalScope["t_chunkSubstr"] = function (str, size) {
    const numChunks = Math.ceil(str.length / size)
    const chunks = new Array(numChunks)

    for (let i = 0, o = 0; i < numChunks; ++i, o += size) {
        chunks[i] = str.substr(o, size)
    }

    return chunks
}
globalScope["t_chunkBytes"] = function (str, size) {
    let numChunks = Math.ceil(t_byteLen(str) / size);
    let chunks = new Array(numChunks);

    let i = 0;
    chunks[i] = "";
    for (const c of str) {
        let cat = chunks[i] + c;
        if (t_byteLen(cat) > size) {
            i++;
            if (i >= chunks.length) chunks.push("");
            chunks[i] = c;
        } else {
            chunks[i] = cat;
        }
    }

    return chunks;
}

globalScope["t_browserDetection"] = function () {
    let url = browser.runtime.getURL("/");
    if (url.startsWith("moz")) {
        return "moz";
    } else {
        return "chromium";
    }
}

/**
 * Gets keyboard-focusable elements within a specified element
 * https://zellwk.com/blog/keyboard-focusable-elements/
 * @param {HTMLElement} [element=document] element
 * @returns {Array}
 */
globalScope["t_getKeyboardFocusableElements"] = (element = document) => {
    return [
        ...element.querySelectorAll(
            'a[href], button, input, textarea, select, details,[tabindex]:not([tabindex="-1"])'
        )
    ].filter(
        el => !el.hasAttribute('disabled') && !el.getAttribute('aria-hidden')
    )
}

// https://stackoverflow.com/questions/6268508/restart-animation-in-css3-any-better-way-than-removing-the-element
globalScope["t_resetAnimation"] = function (el) {
    el.style.animation = 'none';
    el.offsetHeight; /* trigger reflow */
    el.style.animation = null;
};


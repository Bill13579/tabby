import smoothscroll from 'smoothscroll-polyfill';
// kick off the polyfill!
smoothscroll.polyfill();

import 'proxy-polyfill';

export const TargetBrowser = TARGET;

if (TARGET === "chrome") {
    window["browser"] = require("webextension-polyfill");
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

window["t_delay"] = ms => new Promise(res => setTimeout(res, ms));

window["t_in"] = (obj, key) => obj.hasOwnProperty(key);

window["t_arrayBufferToBase64"] = function arrayBufferToBase64(buffer) {
    let binary = "";
    let bytes = [].slice.call(new Uint8Array(buffer));
    bytes.forEach((b) => binary += String.fromCharCode(b));
    return window.btoa(binary);
};

window["t_getImage"] = function (url, noCache=false) {
    return new Promise((resolve, reject) => {
        try {
            if (!url.startsWith("chrome://")) {
                let xhr = new XMLHttpRequest();
                xhr.onreadystatechange = function(){
                    if (this.readyState == 4 && this.status == 200) {
                        let contentType = xhr.getResponseHeader("Content-Type").trim();
                        if (contentType.startsWith("image/")) {
                            let flag = "data:" + contentType + ";charset=utf-8;base64,";
                            let imageStr = t_arrayBufferToBase64(xhr.response);
                            resolve(flag + imageStr);
                        } else {
                            reject("Image Request Failed: Content-Type is not an image! (Content-Type: \"" + contentType + "\")");
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

window["t_ctrlCmdKey"] = function () {
    if (navigator.platform.indexOf("Mac") >= 0 || navigator.platform === "iPhone") {
        return "Meta";
    } else {
        return "Control";
    }
};

window["t_getElementsBetween"] = function (node1, node2) {
    if (!node1.parentElement.isSameNode(node2.parentElement)) return undefined; // can't perform function
    if (node1.isSameNode(node2)) return [];
    let between = [];

    let getNext = (n) => n.nextElementSibling;
    if (node1.compareDocumentPosition(node2) & Node.DOCUMENT_POSITION_PRECEDING) {
        getNext = (n) => n.previousElementSibling;
    }

    let nextNode = getNext(node1);
    while (nextNode && !nextNode.isSameNode(node2)) {
        between.push(nextNode);

        nextNode = getNext(nextNode);
    }

    return between;
};
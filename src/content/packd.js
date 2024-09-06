import "Polyfill"
import { module } from "./module"

import getFavicons from "get-favicons/from-array";

/**
 * Attaches a mutation observer on the document and waits for the selector to exist
 * @param {String} selector 
 * @returns {Promise<Element, TypeError>}
 */
function waitForElementToExist(selector) {
    return new Promise((resolve, reject) => {
        let MutationObserver = window.MutationObserver || window.WebKitMutationObserver || window.MozMutationObserver;
        
        if (typeof MutationObserver !== 'undefined') {
            let observer = new MutationObserver((mutations) => {
                let node = document.querySelector(selector);
                if (node) {
                    observer.disconnect();
                    resolve(node);
                }
            });
            
            observer.observe(document.body, { childList: true, subtree: true, attributes: false, characterData: false });
        } else {
            reject(new TypeError("MutationObservers are not supported on this browser!"));
        }
    });
}

/**
 * Attaches a mutation observer on the element until its content (childList/subtree) changes, then return its textContent
 * @param {Element} element 
 * @returns {Promise<String, TypeError>}
 */
function waitForElementValueToChange(element) {
    return new Promise((resolve, reject) => {
        let MutationObserver = window.MutationObserver || window.WebKitMutationObserver || window.MozMutationObserver;

        if (typeof MutationObserver !== 'undefined') {
            let observer = new MutationObserver((mutations) => {
                resolve(element.textContent);
            });

            observer.observe(element, { attributes: false, childList: true, subtree: true, characterData: false });
        } else {
            reject(new TypeError("MutationObservers are not supported on this browser!"));
        }
    });
}

const MUTATION_OBSERVERS = {
    "www.youtube.com": () => new Promise(async (resolve, reject) => {
        if (window.location.pathname.startsWith("/watch")) {
            let ele = document.querySelector('ytd-watch-metadata');
            if (ele) {
                let value = await waitForElementValueToChange(ele);
                resolve(value);
            } else {
                let value = await waitForElementToExist('ytd-watch-metadata');
                resolve(value.textContent);
            }
        } else {
            resolve(document.body.innerText);
        }
    })
};

function getScroll() {
    return {
        scrollTop: document.documentElement.scrollTop || document.body.scrollTop,
        scrollLeft: document.documentElement.scrollLeft || document.body.scrollLeft
    }
}
function setScroll(data) {
    document.documentElement.scrollTo(data.scrollLeft, data.scrollTop);
}

function getVideoStats() {
    return {
        videos: Array.from(document.querySelectorAll("video")).map(v => ({
            currentTime: v.currentTime
        }))
    }
}
function setVideoStats(data) {
    let videos = document.querySelectorAll("video");
    if (data.videos.length === videos.length) {
        for (let i = 0; i < videos.length; i++) {
            videos[i].currentTime = data.videos[i].currentTime;
        }
    }
}

module("packd", data => {
    switch (data.action) {
        case "pack": {
            return Promise.resolve(Object.assign({
                packContents: {
                    scroll: true,
                    videoStats: true
                }
            }, getScroll(), getVideoStats()));
        }
        case "unpack": {
            return new Promise((resolve, reject) => {
                let unpack = () => {
                    console.log("Unpacking");
                    console.log(data)
                    if (data.packContents.scroll) setScroll(data);
                    if (data.packContents.videoStats) setVideoStats(data);
                    resolve();
                }
                if (document.readyState === 'loading') {
                    document.addEventListener('load', unpack);
                } else {
                    unpack();
                }
            });
        }
        case "favicon": {
            // Convert head elements into the get-favicons format
            return getFavicons(Array.from(document.querySelectorAll("base, link, meta"))
                            .map(ele => {
                                let attrs = ele.attributes;
                                let obj = {};
                                for (let attr of attrs) {
                                    obj[attr.name] = attr.value;
                                }
                                return Object.assign(obj, {
                                    'nodeName': ele.nodeName.toLocaleUpperCase(),
                                    'innerText': ele.innerText,
                                });
                            }));
        }
        case "innerText": {
            if (window.location.hostname in MUTATION_OBSERVERS && MUTATION_OBSERVERS.hasOwnProperty(window.location.hostname)) {
                return MUTATION_OBSERVERS[window.location.hostname]().then(value => {
                    return {
                        title: document.title,
                        url: window.location.href,
                        innerText: value
                    };
                });
            } else {
                // return Mercury.parse(window.location.href, {
                //     html: new XMLSerializer().serializeToString(document)
                // }).then(result => {
                //     let processed = t_stripHtml(result.content);
                //     return {
                //         title: document.title,
                //         url: window.location.href,
                //         innerText: processed
                //     };
                // });
                return Promise.resolve({
                    title: document.title,
                    url: window.location.href,
                    innerText: seo()
                });
            }
        }
    }
});

function seo() {
    let title = document.title;
    let url = window.location.href;
    let description = document.querySelector("meta[name='description']");
    if (description) {
        description = description.getAttribute("content");
    } else {
        description = "<same as title> " + title;
    }
    let __contentTags = document.querySelectorAll(":not(aside):not(header):not(footer):not(nav) h1, :not(aside):not(header):not(footer):not(nav) h2, :not(aside):not(header):not(footer):not(nav) h3, article section:not(aside):not(header):not(footer):not(nav)");
    let content = "";
    for (let node of __contentTags) {
        content += node.innerText;
        content += "\n\n";
    }
    let imageAlts = document.querySelectorAll("article section:not(aside):not(header):not(footer):not(nav) img[alt]")
    let imageDescriptions = "";
    for (let node of imageAlts) {
        imageDescriptions += node.alt;
        imageDescriptions += "\n\n";
    }
    return title + "\n" + url + "\n" + description + "\n\n" + content + imageDescriptions;
}
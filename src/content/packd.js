import "Polyfill"
import { module } from "./module"

import Mercury from "@postlight/mercury-parser";

function waitForElementToExist(selector) {
    return new Promise((resolve, _) => {
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
        }
    });
}
function waitForElementValueToChange(element) {
    return new Promise((resolve, _) => {
        let MutationObserver = window.MutationObserver || window.WebKitMutationObserver || window.MozMutationObserver;

        if (typeof MutationObserver !== 'undefined') {
            let observer = new MutationObserver((mutations) => {
                resolve(element.textContent);
            });

            observer.observe(element, { attributes: false, childList: true, subtree: true, characterData: false });
        }
    });
}

const MUTATION_OBSERVERS = {
    "www.youtube.com": () => new Promise(async (resolve, reject) => {
        if (window.location.pathname.startsWith("/watch")) {
            let ele = document.querySelector('#meta-contents #description yt-formatted-string.content');
            if (ele) {
                let value = await waitForElementValueToChange(ele);
                resolve(value);
            } else {
                let value = await waitForElementToExist('#meta-contents #description yt-formatted-string.content');
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
                return Mercury.parse(window.location.href, {
                    html: new XMLSerializer().serializeToString(document)
                }).then(result => {
                    let processed = t_stripHtml(result.content);
                    return {
                        title: document.title,
                        url: window.location.href,
                        innerText: processed
                    };
                });
            }
        }
    }
});
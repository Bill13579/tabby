import "Polyfill"
import { module } from "./module"

import Mercury from "@postlight/mercury-parser";

const BYPASS = ["www.youtube.com"];

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
            if (window.location.hostname in BYPASS) {
                return Promise.resolve({
                    title: document.title,
                    url: window.location.href,
                    innerText: document.body.innerText
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
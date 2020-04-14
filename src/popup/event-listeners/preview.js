import { captureTab } from "../captureTab";

export function previewClick(e) {
    let tabId = parseInt(document.getElementById("details").getAttribute("data-details-of"));
    let bounding = document.getElementById("details-img").getBoundingClientRect();
    browser.tabs.sendMessage(tabId, {
        target: "minid",
        data: {
            x: (e.clientX - bounding.x) / bounding.width,
            y: (e.clientY - bounding.y) / bounding.height
        }
    });
}

export function enableRealTimePreview() {
    let details = document.getElementById("details");
    let previewImg = document.getElementById("details-img");
    let animationFrameCB = (e) => {
        if (details.hasAttribute("data-details-of")) {
            captureTab(parseInt(details.getAttribute("data-details-of"))).then(dataUri => {
                if (dataUri !== null) {
                    previewImg.src = dataUri;
                }
            });
        }
    };
    setInterval(animationFrameCB, 500);
}
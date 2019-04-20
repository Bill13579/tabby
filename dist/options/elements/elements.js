function configureSwitches() {
    let switches = document.getElementsByClassName("ui-switch");
    let GLOW = document.createElement("div");
    GLOW.classList.add("ui-switch-glow");
    let SLIDER = document.createElement("div");
    SLIDER.classList.add("ui-switch-slider");
    for (let i = 0; i < switches.length; i++) {
        let s = switches[i];
        s.insertBefore(SLIDER.cloneNode(true), s.childNodes[0]);
        s.insertBefore(GLOW.cloneNode(true), s.childNodes[0]);
        function switchClick(e) {
            if (s.getAttribute("value") === "on") {
                s.setAttribute("value", "off");
            } else if (s.getAttribute("value") === "off") {
                s.setAttribute("value", "on");
            }
            let event = new Event("input", {
                bubbles: false,
                cancelable: true
            });
            s.dispatchEvent(event);
        }
        if (!s.hasAttribute("value")) s.setAttribute("value", "off");
        s.addEventListener("click", switchClick);
        let glow = s.getElementsByClassName("ui-switch-glow")[0];
        let slider = s.getElementsByClassName("ui-switch-slider")[0];
        slider.addEventListener("mouseover", e => {
            glow.style.display = "inline-block";
        });
        slider.addEventListener("mouseleave", e => {
            glow.style.display = "none";
        });
    }
}

function main() {
    configureSwitches();
}

(function () {
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", main);
    } else {
        main();
    }
})();
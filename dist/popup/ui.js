/**
 * Script for making the UI function, unrelated to browser interactions. Pure JavaScript
 */

// Enable horizontal scroll
// for (let d of document.getElementsByClassName("-horizontal-scroll")) {
//     d.addEventListener("wheel", e => {
//         e.preventDefault();
//         if (e.deltaY > 0) d.scrollBy({
//             top: 0, 
//             left: Math.max(e.deltaY, 1), 
//             behavior: 'smooth' 
//         });
//         else d.scrollBy({
//             top: 0, 
//             left: Math.min(e.deltaY, -1), 
//             behavior: 'smooth' 
//         });
//     });
// }

// Enable copy buttons
for (let d of document.getElementsByClassName("-copy")) {
    d.addEventListener("click", async e => {
        e.preventDefault();
        let targetText = document.getElementById(d.getAttribute("data-target")).innerText;
        await navigator.clipboard.writeText(targetText);
        d.setAttribute("data-copy-success", "");
        setTimeout(() => {
            d.removeAttribute("data-copy-success");
        }, 2000);
    });
}

/**
 * Switch view (0 for main, 1 for session)
 * @param {Integer} v 
 */
function TUI_switchView(v) {
    switch (v) {
        case 0:
            document.getElementById("main").setAttribute("data-view", "0");
            document.getElementById("details-pane").scrollIntoView({ behavior: 'smooth', block: 'center' });
            break;
        case 1:
            document.getElementById("main").setAttribute("data-view", "1");
            document.getElementById("session-pane").scrollIntoView({ behavior: 'smooth', block: 'center' });
            break;
        default: console.log(`[UI] unknown view ${v}`);
    }
}

// === VIEW SWITCHING TEST ===
/*
let c = 1;
setInterval(() => {
    TUI_switchView(c);
    if (c == 0) c = 1;
    else c = 0;
}, 5000);
*/


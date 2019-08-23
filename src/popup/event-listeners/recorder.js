import { lastRecord, record, restore } from "../recorder"

let saveForLaterBtn = document.getElementById("save-for-later");
let sflTimeout = () => {
    saveForLaterBtn.removeAttribute("done");
};
export function saveForLater() {
    saveForLaterBtn.setAttribute("disabled", "");
    record().then(() => {
        saveForLaterBtn.removeAttribute("disabled");
        saveForLaterBtn.setAttribute("done", "");
        clearTimeout(sflTimeout); setTimeout(sflTimeout, 2000);
    });
}

export { restore }

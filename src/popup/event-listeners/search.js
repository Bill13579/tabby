// Search
export function searchTextChanged(e) {
    let input, filter, tabEntries;
    input = document.getElementById("search");
    filter = input.value.toUpperCase();
    tabEntries = document.getElementsByClassName("tab-entry");
    if (filter !== "") {
        for (let tabEntry of tabEntries) {
            if (!tabEntry.getElementByClassName("tab-title").innerText.toUpperCase().includes(filter)) {
                tabEntry.style.display = "none";
            } else {
                tabEntry.style.display = "flex";
            }
        }
    } else {
        for (let tabEntry of tabEntries) {
            tabEntry.style.display = "flex";
        }
    }
}

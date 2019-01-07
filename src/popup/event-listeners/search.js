function keywordSearch(s, key) {
    var keywords = key.trim().split(" "), count = 0;
    for (var i = 0; i < keywords.length; i++) {
        var word = keywords[i];
        if (word.trim() !== "" && word.match(/^[a-zA-Z0-9]+$/)) {
            if (s.toUpperCase().includes(word.toUpperCase())) {
                count++;
            }
        }
    }
    return count >= 2;
}

function search(s, key) {
    return s.toUpperCase().includes(key.toUpperCase()) || keywordSearch(s, key);
}

// Search
export function searchTextChanged(e) {
    var input, filter, tabEntries;
    input = document.getElementById("search");
    filter = input.value;
    tabEntries = document.getElementsByClassName("tab-entry");
    if (filter !== "") {
        for (var i = 0; i < tabEntries.length; i++) {
            var tabEntry = tabEntries[i];
            if (!search(tabEntry.getElementByClassName("tab-title").innerText, filter)) {
                tabEntry.style.display = "none";
            } else {
                tabEntry.style.display = "flex";
            }
        }
    } else {
        for (var i = 0; i < tabEntries.length; i++) {
            var tabEntry = tabEntries[i];
            tabEntry.style.display = "flex";
        }
    }
}

import "Polyfill"

export class TUIEditableColor {
    constructor() {
        this.root = document.createElement("input");
        this.editing = false;
        this.root.setAttribute("type", "color");
        this.root.value = "#e66465";
        this.root.classList.add("-tui-editable-color");
        for (let ev of "drag dragend dragenter dragleave dragover dragstart drop blur change click dblclick error focus focusin focusout hover keydown keypress keyup load mousedown mouseenter mouseleave mousemove mouseout mouseover mouseup resize scroll select submit".split(" ")) {
            this.root.addEventListener(ev, (evt) => evt.stopPropagation());
        }
        this.root.addEventListener("input", this.onInput);
    }
    get value() {
        return this.root.value;
    }
    set value(v) {
        this.root.value = v;
    }
    onInput(evt) { /*OVERRIDE*/ }
}

export class TUIEditableColorDot extends TUIEditableColor {
    constructor() {
        super();
        this.root.classList.add("-tui-editable-color-dot");
        this.wrapper = document.createElement("div");
        this.wrapper.classList.add("-tui-editable-color-dot-wrapper");
        this.wrapper.appendChild(this.root);
    }
}

export class TUIEditableLabel {
    constructor() {
        this.root = document.createElement("input");
        this.editing = false;
        this.root.value = "Editable Label";
        this.root.classList.add("-tui-editable-span");
        for (let ev of "drag dragend dragenter dragleave dragover dragstart drop blur change click dblclick error focus focusin focusout hover keydown keypress keyup load mousedown mouseenter mouseleave mousemove mouseout mouseover mouseup resize scroll select submit".split(" ")) {
            this.root.addEventListener(ev, (evt) => evt.stopPropagation());
        }
        this.root.addEventListener("keyup", e => {
            if (this.editing) {
                if (e.key === "Enter") {
                    this.onEnter(this.root.value);
                }
            }
        });
        this.root.addEventListener("blur", e => {
            this.onEnter(this.root.value);
        });
        this.root.addEventListener("input", e => {
            setInputWidthToText(this.root);
        });
    }
    get editing() {
        return this.root.style.pointerEvents !== "none";
    }
    set editing(bool) {
        if (bool) {
            this.root.style.pointerEvents = "";
            this.root.focus();
            this.root.classList.add("-tui-editable-span-editing");
        } else {
            this.root.style.pointerEvents = "none";
            this.root.blur();
            this.root.classList.remove("-tui-editable-span-editing");
        }
    }
    get value() {
        return this.root.value;
    }
    set value(v) {
        this.root.value = v;
        setInputWidthToText(this.root);
    }
    onEnter(value) { /*OVERRIDE*/ }
}

function setInputWidthToText(input) {
    let span = document.createElement("span");

    // Copy attributes
    if (input.hasAttributes()) {
        for (let pair of input.attributes) {
            span.setAttribute(pair.name, pair.value);
        }
    }

    // Clone children
    for (let c of input.children) {
        span.appendChild(c.cloneNode(true));
    }

    // Disable wrapping
    span.style.whiteSpace = "nowrap";

    // Copy text
    span.innerText = input.value + "​";
    
    // Calculate width, discard after
    input.parentElement.appendChild(span);
    let rect = span.getBoundingClientRect();
    input.parentElement.removeChild(span);

    // Set input width accordingly
    input.style.width = `${rect.width}px`;
}


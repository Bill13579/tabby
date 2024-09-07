import "Polyfill"

export class TUIEditableColor {
    constructor() {
        this.root = document.createElement("input");
        this.editing = false;
        this.root.setAttribute("type", "color");
        this.root.value = "#e66465";
        this.root.classList.add("-tui-editable-color");
        // for (let ev of "drag dragend dragenter dragleave dragover dragstart drop blur change click dblclick error focus focusin focusout hover keydown keypress keyup load mousedown mouseenter mouseleave mousemove mouseout mouseover mouseup resize scroll select submit".split(" ")) {
        //     this.root.addEventListener(ev, (evt) => evt.stopPropagation());
        // }
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

export class TUIEditableDiv {
    constructor(singleLine=true) {
        this.root = document.createElement("pre");
        this.root.setAttribute("contenteditable", "true");
        this.root.addEventListener("paste", e => {
            e.preventDefault();
            let text = e.clipboardData.getData("text/plain");
            if (this.singleLine) {
                document.execCommand("insertText", false, text);
            } else {
                let lines = text.split("\n");
                lines.forEach((line, index) => {
                    document.execCommand("insertText", false, line);
                    if (index < lines.length - 1) {
                        document.execCommand('insertParagraph', false);
                    }
                });
            }
        });
        this.singleLine = singleLine;

        this._placeholderTemplate = document.createElement("span");
        this._placeholderTemplate.classList.add("-tui-editable-div-placeholder");

        this.root.classList.add("-tui-editable-div");
        this.root.addEventListener("keypress", e => {
            e.stopPropagation();
            if (e.key === "Enter") {
                if (this.singleLine || !e.shiftKey) e.preventDefault();
                return false;
            }
        });
        this.root.addEventListener("keydown", e => {
            e.stopPropagation();
        });
        this.root.addEventListener("keyup", e => {
            e.stopPropagation();
            if (this.editing) {
                if (e.key === "Enter") {
                    if (this.singleLine || !e.shiftKey) {
                        this.onEnter(this.value, e);
                    } else {
                        e.preventDefault();
                        let selection = window.getSelection();
                        let range = selection.getRangeAt(0);
                        let br = document.createElement('br');
                        range.insertNode(br);
                        range.setStartAfter(br);
                        range.setEndAfter(br);
                        selection.removeAllRanges();
                        selection.addRange(range);
                    }
                }
            }
        });
        this.root.addEventListener("blur", e => {
            this.onEnter(this.value, e);
        });
        this.root.addEventListener("input", e => {
            this.onInput(this.value);

            // Strip any <br>'s if div is empty so that the cursor shows when there's nothing in the box
            if (this.value === "") {
                let placeholderBrs = this.root.querySelectorAll("br");
                for (let placeholderBr of placeholderBrs) {
                    this.root.removeChild(placeholderBr);
                }
            }

            this.autoPlaceholder();
        });

        this.autoPlaceholder();
    }
    get value() {
        return this.root.innerText;
    }
    set value(v) {
        this.rememberCaretPosition();
        this.root.textContent = v; // textContent since newlines need to be kept intact
        this.recoverCaretPosition();
        this.autoPlaceholder();
    }
    rememberCaretPosition() {
        this._caretPosition = t_getCaretPosition(this.root);
    }
    recoverCaretPosition() {
        if (this._caretPosition !== undefined) {
            t_setCaretPosition(this.root, this._caretPosition);
            this._caretPosition = undefined;
        }
    }
    /**
     * Clear all content completely without adding a placeholder afterwards
     */
    clear() {
        this.root.innerText = "";
    }
    /**
     * Automatically add or remove placeholder depending on the value
     */
    autoPlaceholder() {
        if (this.value === "") {
            this.addPlaceholder();
        } else {
            this.removePlaceholder();
        }
    }
    /**
     * Adds in the placeholder
     */
    addPlaceholder() {
        this.root.appendChild(this._placeholderTemplate.cloneNode(true));
        TUIEditableDiv.focus(this.root);
    }
    /**
     * Removes the placeholder
     */
    removePlaceholder() {
        for (let ph of this.root.querySelectorAll(".-tui-editable-div-placeholder"))
            this.root.removeChild(ph);
    }
    get singleLine() {
        return this._singleLine;
    }
    set singleLine(bool) {
        this._singleLine = bool;
        if (bool) {
            this.root.classList.add("-tui-editable-singleline-div");
            this.root.classList.remove("-tui-editable-multiline-div");
        } else {
            this.root.classList.remove("-tui-editable-singleline-div");
            this.root.classList.add("-tui-editable-multiline-div");
        }
    }
    get editing() {
        return this.root.style.pointerEvents !== "none";
    }
    set editing(bool) {
        if (bool) {
            this.root.style.pointerEvents = "";
            TUIEditableDiv.focus(this.root);
            this.root.classList.add("-tui-editable-div-editing");
        } else {
            this.root.style.pointerEvents = "none";
            this.root.blur();
            this.root.classList.remove("-tui-editable-div-editing");
        }
    }
    onEnter(value, originalEvent) { /*OVERRIDE*/ }
    onInput(value) { /*OVERRIDE*/ }
    static focus(element) {
        let s = window.getSelection();
        let r = document.createRange();
        r.setStart(element, 0);
        let ph = element.querySelector(".-tui-editable-div-placeholder");
        if (ph) {
            r.setEndBefore(ph);
        } else {
            r.selectNodeContents(element);
        }
        s.removeAllRanges();
        s.addRange(r);
        element.focus();
    }
}

export class TUIEditableLabel {
    constructor() {
        this.root = document.createElement("input");
        this.editing = false;
        this.root.value = "Editable Label";
        this.root.classList.add("-tui-editable-span");
        // for (let ev of "drag dragend dragenter dragleave dragover dragstart drop blur change click dblclick error focus focusin focusout hover keydown keypress keyup load mousedown mouseenter mouseleave mousemove mouseout mouseover mouseup resize scroll select submit".split(" ")) {
        //     this.root.addEventListener(ev, (evt) => evt.stopPropagation());
        // }
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
        this.stopPropagation = (evt) => evt.stopPropagation();
    }
    get editing() {
        return this.root.style.pointerEvents !== "none";
    }
    set editing(bool) {
        if (bool) {
            this.root.style.pointerEvents = "";
            this.root.focus();
            this.root.select();
            this.root.classList.add("-tui-editable-span-editing");
            this.root.addEventListener("keydown", this.stopPropagation);
            this.root.addEventListener("keyup", this.stopPropagation);
        } else {
            this.root.style.pointerEvents = "none";
            this.root.blur();
            this.root.classList.remove("-tui-editable-span-editing");
            this.root.removeEventListener("keydown", this.stopPropagation);
            this.root.removeEventListener("keyup", this.stopPropagation);
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


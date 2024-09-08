import "Polyfill"

/**
 * Simple list layout
 */
export class TUIMenuListLayout {
    constructor(...children) {
        this.children = children;
    }
    get root() {
        return this.__root;
    }
    pushInto(array) {
        array.push(this);
        return this;
    }
    make(ret=undefined) {
        // Create the list layout
        let root = document.createElement("div");
        root.classList.add("-tui-menu-list-layout");
        for (let child of this.children) {
            root.appendChild(child.make(ret));
        }
        this.__root = root;
        return root;
    }
}

export class TUIMenuFlexLayout extends TUIMenuListLayout {
    make(ret=undefined) {
        let root = super.make(ret);
        root.classList.add("-tui-menu-flex-layout");
        return root;
    }
}

/**
 * @callback TUIMenu_init
 */
/**
 * @callback TUIMenu_callback
 * @param {Function} ret
 */

export class TUIMenu extends TUIMenuListLayout {
    /**
     * Sets the final callback when the menu returns
     * If set, this object will become the root of the menu,
     *  and `ret` will be created by it.
     * @param {TUIMenu_init} initialized
     * @param {TUIMenu_callback} callback 
     * @returns {TUIMenu}
     */
    callback(initialized, callback) {
        this.__init = initialized;
        this.__cb = callback;
        return this;
    }
    /**
     * Initialize this object as the root and set the initial state
     * @param {Object} initialState 
     * @returns 
     */
    init(initialState={}) {
        return this.make(undefined, initialState);
    }
    /**
     * Creates the element and returns it so that it can be added into the document
     * @param {Function} ret 
     * @param {Object} initialState 
     * @returns {Element}
     */
    make(ret=undefined, initialState={}) {
        // If a callback is defined on this object, use it as the root
        if (this.__cb) {
            // Define the `ret` function since this is the root
            // `ret` will be passed onto every single child, and they will be able to call it
            //  to end the menu process. Once it is called, the state (`ret.state`) will be returned
            //  to the initial caller via the callback, and the root element will be removed from the
            //  document.
            ret = function (next=undefined) {
                // Make sure that the menu hasn't already been removed from the page
                if (ret.__removed !== true) {
                    // If a replacement menu is defined, call `make` on it and replace the old root
                    //  with the new one
                    if (next) {
                        let ele = next.make(ret);
                        ret.__currentRoot.parentElement.replaceChild(ret.__currentRoot, ele);
                        ret.__currentRoot = ele;
                    } else {
                        // A replacement menu was not passed, that means that we're done here
                        ret.__removed = true;
                        ret.__cb(ret.state); // Bam! Sent
                        ret.__currentRoot.parentElement.removeChild(ret.__currentRoot);
                        ret.__currentRoot = undefined;
                    }
                }
            };
            // Initialize the `ret` object
            ret.__cb = this.__cb;
            ret.state = initialState;
        }
        
        // Create the menu
        let root = super.make(ret);
        root.classList.add("-tui-menu");

        // If a callback was set, then this must be the root element. Initialize __currentRoot
        if (this.__cb) {
            ret.__currentRoot = root;
        }

        // If the user clicks outside the menu, then return early
        this.__documentMouseDown = () => {
            ret();
            document.removeEventListener("mousedown", this.__documentMouseDown);
        };
        document.addEventListener("mousedown", this.__documentMouseDown);

        // If it not were for this line, it is possible to have a menu inside a menu, inside a menu
        // Which isn't good
        root.addEventListener("contextmenu", (evt) => evt.stopPropagation());

        // Another setup callback, this time right before returning, for convenience
        if (this.__cb) {
            this.__init(root, this);
        }
        return root;
    }
}
export class TUIMenuItem {
    constructor(label="Label", icon="", iconTransform="scale(80%) translateY(-2.8%)", markdown=false, data=undefined) {
        this.__labelText = label;
        this.__iconSrc = icon;
        this.iconTransform = iconTransform;
        this.__markdown = markdown;
        this.data = data;
    }
    get root() {
        return this.__root;
    }
    get label() {
        return this.__label;
    }
    get labelText() {
        return this.__labelText;
    }
    get markdown() {
        return this.__markdown;
    }
    __setLabelContent(label, textContent, useMarkdown) {
        if (useMarkdown) {
            (async () => {
                let DOMPurify = (await import("dompurify")).default;
                let { marked } = await import("marked");
                label.innerHTML = DOMPurify.sanitize(marked.parse(textContent));
            })();
        } else {
            label.innerText = textContent;
        }
    }
    set labelText(v) {
        this.__labelText = v;
        this.__setLabelContent(this.__label, this.__labelText, this.__markdown);
    }
    set markdown(v) {
        this.__markdown = v;
        this.__setLabelContent(this.__label, this.__labelText, this.__markdown);
    }
    get icon() {
        return this.__icon;
    }
    get iconSrc() {
        return this.__iconSrc;
    }
    set iconSrc(v) {
        this.__iconSrc = v;
        this.__icon.style.backgroundColor = `black`;
        this.__icon.style.webkitMaskImage = `url(${this.__iconSrc})`;
        this.__icon.style.maskImage = `url(${this.__iconSrc})`;
    }
    set enabled(v) {
        if (v) {
            this.root.style.pointerEvents = "";
            this.root.classList.remove("-tui-menu-item-disabled");
        } else {
            this.root.style.pointerEvents = "none";
            this.root.classList.add("-tui-menu-item-disabled");
        }
    }
    make(ret) {
        let root = document.createElement("div");
        root.classList.add("-tui-menu-item");
        let icon = document.createElement("span");
        icon.className = "-tui-menu-item-icon inline-button inline-icon-button -force-filter-svg-to-match-theme";
        let label = document.createElement("span");
        label.classList.add("-tui-menu-item-label");
        
        this.__setLabelContent(label, this.__labelText, this.__markdown);
        icon.style.backgroundColor = "black";
        icon.style.webkitMaskImage = `url(${this.__iconSrc})`;
        icon.style.maskImage = `url(${this.__iconSrc})`;
        icon.style.transform = this.iconTransform;

        root.appendChild(icon);
        root.appendChild(label);

        this.__mousedown = (evt) => {
            evt.stopPropagation();
            if (evt.button === 0) {
                root.setAttribute("data-pressed", "");
            }
        };
        root.addEventListener("mousedown", this.__mousedown);
        this.__click = (evt) => {
            evt.stopPropagation();
            if (evt.button === 0) {
                root.removeAttribute("data-pressed");
                ret.state.target = this;
                ret();
            }
        };
        root.addEventListener("click", this.__click);

        this.__root = root;
        this.__label = label;
        this.__icon = icon;

        return root;
    }
    pushInto(array) {
        array.push(this);
        return this;
    }
    static colorIcon(icon, color) {
        icon.style.backgroundColor = color;
        icon.classList.remove("-force-filter-svg-to-match-theme");
    }
    static matchThemeIcon(icon) {
        icon.style.backgroundColor = "";
        icon.classList.add("-force-filter-svg-to-match-theme");
    }
}
export class TUIMenuLabel extends TUIMenuItem {
    constructor(label="Label", icon="", iconTransform="scale(80%) translateY(-2.8%)", markdown=false, data=undefined) {
        super(label, icon, iconTransform, markdown, data);
    }
    make(ret) {
        let root = super.make(ret);
        root.classList.add("-tui-menu-label");
        root.addEventListener("mouseup", (evt) => {
            root.removeAttribute("data-pressed");
        });
        root.removeEventListener("click", this.__click);
        return root;
    }
}
export class TUIMenuHR {
    get root() {
        return this.__root;
    }
    make(ret) {
        let root = document.createElement("hr");
        root.classList.add("-tui-menu-hr");
        this.__root = root;
        return root;
    }
}
export class TUISubMenu extends TUIMenuItem {
    constructor(onMake, onSelect, options, dropdown=false, label="Label", icon="", iconTransform="scale(80%) translateY(-2.8%)", markdown=false, data=undefined) {
        super(label, icon, iconTransform, markdown, data);
        this.__onMake = onMake;
        this.__onSelect = onSelect;
        this.options = options;
        this.__dropdown = dropdown;
    }
    set selection(target) {
        this.__selection = target;
        if (this.__dropdown) {
            this.labelText = target.labelText;
            this.iconSrc = target.iconSrc;
        }
        this.__onSelect(this.selection, this);
    }
    get selection() {
        return this.__selection;
    }
    make(ret) {
        let root = super.make(ret);
        root.addEventListener("mouseup", (evt) => {
            root.removeAttribute("data-pressed");
        });
        root.removeEventListener("click", this.__click);

        let dropdown = document.createElement("span");
        dropdown.className = "-tui-menu-dropdown-indicator inline-button inline-icon-button -opacity-indication -force-filter-svg-to-match-theme";
        root.appendChild(dropdown);

        this.__positioner = () => {
            let rect = root.getBoundingClientRect();
            return {
                clientX: rect.left + rect.width * (11/12),
                clientY: rect.top - rect.height / 8
            };
        };
        this.__dropdownClick = (evt) => {
            if (!this.__menuOpen) {
                let menu = new TUIMenu(
                    ...this.options
                ).callback((root) => {
                    for (let opt of this.options) {
                        if (opt === this.selection) {
                            opt.root.setAttribute("data-pressed", "");
                            break;
                        }
                    }
                    this.__onMake(root, this.options);
                }, state => {
                    this.__menuOpen = false;
                    if (state.target) {
                        this.selection = state.target;
                        if (!this.__dropdown) {
                            ret.state.target = state.target;
                            ret();
                        }
                    }
                }).make();
                menu.classList.add("-tui-list-dropdown-menu");
                this.__menuOpen = true;
                openSubContextMenu(evt, menu, this.__positioner);
            }
        };
        root.addEventListener("click", this.__dropdownClick);

        return root;
    }
}

export function openContextMenu(evt, menu) {
    if (evt.preventDefault) {
        evt.preventDefault();
    }
    let x = evt.clientX;
    let y = evt.clientY;
    document.body.appendChild(menu);
    let rect = menu.getBoundingClientRect();
    x -= Math.max((window.innerWidth - evt.clientX - rect.width) * -1, 0);
    y -= Math.max((window.innerHeight - evt.clientY - rect.height) * -1, 0);
    menu.style.top = y + "px";
    menu.style.left = x + "px";
};
export function openSubContextMenu(evt, menu, pos) {
    if (evt.preventDefault) {
        evt.preventDefault();
        evt.stopPropagation();
    }
    document.body.appendChild(menu);
    let rect = menu.getBoundingClientRect();
    if (pos instanceof Function) {
        pos = pos(evt);
    }
    let x = pos.clientX;
    let y = pos.clientY;
    x -= Math.max((window.innerWidth - pos.clientX - rect.width) * -1, 0);
    y -= Math.max((window.innerHeight - pos.clientY - rect.height) * -1, 0);
    menu.style.top = y + "px";
    menu.style.left = x + "px";
}
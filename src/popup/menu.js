export class TUIMenu {
    constructor(...children) {
        this.children = children;
    }
    callback(callback) {
        this.__cb = callback;
        return this;
    }
    make(ret=undefined) {
        if (this.__cb) {
            ret = function (next=undefined) {
                if (ret.__removed !== true) {
                    if (next) {
                        let ele = next.make(ret);
                        ret.__currentRoot.parentElement.replaceChild(ret.__currentRoot, ele);
                        ret.__currentRoot = ele;
                    } else {
                        ret.__removed = true;
                        ret.__cb(ret.state);
                        ret.__currentRoot.parentElement.removeChild(ret.__currentRoot);
                        ret.__currentRoot = undefined;
                    }
                }
            };
            ret.__cb = this.__cb;
            ret.state = {};
        }
        
        let root = document.createElement("div");
        root.classList.add("-tui-menu");
        for (let child of this.children) {
            root.appendChild(child.make(ret));
        }

        if (this.__cb) {
            ret.__currentRoot = root;
        }

        let documentHook_mouseDown = () => {
            ret();
            document.removeEventListener("mousedown", documentHook_mouseDown);
        };
        document.addEventListener("mousedown", documentHook_mouseDown);

        root.addEventListener("contextmenu", (evt) => evt.stopPropagation());
        return root;
    }
}
export class TUIMenuItem {
    constructor(label="Label", icon="", iconTransform="scale(90%) translateY(-4%)") {
        this.label = label;
        this.icon = icon;
        this.iconTransform = iconTransform;
    }
    make(ret) {
        let root = document.createElement("div");
        root.classList.add("-tui-menu-item");
        let icon = document.createElement("span");
        icon.className = "-tui-menu-item-icon inline-button inline-icon-button -force-filter-svg-to-match-theme";
        let label = document.createElement("span");
        label.classList.add("-tui-menu-item-label");
        
        label.innerText = this.label;
        icon.style.backgroundImage = `url(${this.icon})`;
        icon.style.transform = this.iconTransform;

        root.appendChild(icon);
        root.appendChild(label);

        root.addEventListener("mousedown", (evt) => {
            evt.stopPropagation();
            root.setAttribute("data-pressed", "");
        });
        root.addEventListener("click", (evt) => {
            evt.stopPropagation();
            root.removeAttribute("data-pressed");
            ret.state.target = this;
            ret();
        });

        return root;
    }
}

export function openContextMenu(evt, menu) {
    evt.preventDefault();
    let x = evt.clientX;
    let y = evt.clientY;
    document.body.appendChild(menu);
    let rect = menu.getBoundingClientRect();
    x -= Math.max((window.innerWidth - evt.clientX - rect.width) * -1, 0);
    y -= Math.max((window.innerHeight - evt.clientY - rect.height) * -1, 0);
    menu.style.top = y-3 + "px";
    menu.style.left = x-2 + "px";
};
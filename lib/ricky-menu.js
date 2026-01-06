class ContextMenu extends HTMLElement {

    /** @type {HTMLElement} */
    _contextTarget;

    /** @type {number} */
    #_posX;
    /** @type {number} */
    #_posY;

    /** @type {HTMLStyleElement} */
    #shadowRootCoords;

    constructor() {
        super();
        this._contextTarget = null;
        
        const shadowRoot = this.attachShadow({ mode: "closed" });
        shadowRoot.innerHTML =
        `
            <style id="coords">
                :host {
                    --ctx-x: 0px;
                    --ctx-y: 0px;
                }
            </style>
            <style>
                :host {
                    position: absolute;
                    top: var(--ctx-y);
                    left: var(--ctx-x);
                    margin: 0px;
                }
            </style>
            <slot>
        ` 

        this.shadowRootCoords = shadowRoot.getElementById("coords");

        // TODO: Figure out why this event doesn't seem to be fired...
        this.addEventListener('contextmenu', (event) => {
            event.preventDefault();
        });

        this.addEventListener('beforetoggle', (event) => {
            if(event.newState === "open") {
                // this.popover = "manual";
                
            }
            else {
                
            }
        });

        this.addEventListener('toggle', (event) => {
            const bRec = this.getBoundingClientRect();
                const mX = ContextMenu._mousePos.x;
                const mY = ContextMenu._mousePos.y;
                console.log("Mouse position: (" + mX + "px, " + mY + "px)");
                console.log(bRec)

                if (this.isMouseInBoundingBox(bRec))
                    console.log("TRUE!!!");
                else
                    console.log("FALSE");
        });
        
    }

    static _mousePos = { x: 0, y: 0 };
    static _isMouseInitialized = false;
    static _mousePositionHandler(event) {
        ContextMenu._mousePos.x = event.clientX;
        ContextMenu._mousePos.y = event.clientY;
    }

    static observedAttributes = ["target", "popover"];

    get posX() {
        return this._posX;
    }

    set posX(newValue) {
        this._posX = newValue;
        this._updateRendering();
    }

    get posY() {
        return this._posY;
    }

    set posY(newValue) {
        this._posY = newValue;
        this._updateRendering();
    }

    /**
     * 
     * @param {DOMRect} bRec
     */
    isMouseInBoundingBox(bRec) {
        const mX = ContextMenu._mousePos.x;
        const mY = ContextMenu._mousePos.y;
        return (
            bRec.bottom + 1 >= mY &
            bRec.top    - 1 <= mY &
            bRec.left   - 1 <= mX &
            bRec.right  + 1 >= mX
        );
    }

    /**
     * 
     * @param {ContextMenu} contextMenu 
     * @param {PointerEvent} event 
     */
    _handleContextMenu(contextMenu, event) {
        event.preventDefault();
        contextMenu.posX = ContextMenu._mousePos.x;
        contextMenu.posY = ContextMenu._mousePos.y;
        
        // Check if the mouse is in the bounding box of the popover while it's open, and if the mouse is NOT over the element.
        // If this returns true, then DO NOT toggle the popover
        // TODO: Override the togglePopover() method so that the explicit display state can be tracked
        if(
            this.isMouseInBoundingBox(this.getBoundingClientRect()) &&
            contextMenu.checkVisibility()
        ){
            contextMenu.togglePopover();
        }
    }
    /**
     * This function is used a handler for targets of this context menu.
     * @param {PointerEvent} event - The `PointerEvent` that would normally summon the default browser context menu
     */
    handleContextMenu = this._handleContextMenu.bind(this, this);

    attributeChangedCallback(name, oldValue, newValue) {
        switch(name) {
            case "target":
                    // If the target was changed, make sure not to respond to the user opening the context menu on the target
                    if(this._contextTarget) {
                        this._contextTarget.removeEventListener('contextmenu', this.handleContextMenu);
                    }

                    // Select the new target and (if it exists) listen for when the user opens the context menu on it
                    this._contextTarget = document.getElementById(newValue);
                    if(this._contextTarget) {
                        this._contextTarget.addEventListener('contextmenu', this.handleContextMenu);
                    }
                    break;
            case "popover":
                    // no-op
                    break;
        }
    }

    connectedCallback() {
        // TODO: Is there a reason why I don't update the _isMouseInitialized flag to be true at the end of this 'if' statement?
        if(!ContextMenu._isMouseInitialized) {
            window.addEventListener('mouseenter', ContextMenu._mousePositionHandler);
            window.addEventListener('mouseleave', ContextMenu._mousePositionHandler);
            window.addEventListener('mousemove', ContextMenu._mousePositionHandler);
        }
        this.popover = "auto";
        this._updateRendering();
    }

    get target() {
        return this._contextTarget;
    }

    set target(newValue) {
        this.setAttribute("target", newValue);
    }

    _updateRendering() {
        this.shadowRootCoords.innerText = 
        `
            :host {
                --ctx-x: ${this.posX}px;
                --ctx-y: ${this.posY}px;
            }
        `
    }
}
customElements.define("context-menu", ContextMenu);
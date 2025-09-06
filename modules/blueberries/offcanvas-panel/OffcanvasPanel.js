// we must use the template element as it only requires: shadow.appendChild(template.content.cloneNode(true));
const template = document.createElement('template');

// we use html`` as it enables syntax higlighiting in zed editor
template.innerHTML = html`
  <style>
  :host {
      --offcanvas-z: 1100;
      --offcanvas-transition: transform 0.35s cubic-bezier(.4,0,.2,1);
      --offcanvas-width: clamp(200px, 25vw, 320px) ;

      position: fixed;
      inset: 0 auto 0 0;
      width: var(--offcanvas-width);
      max-width: 100vw;
      height: 100%;
      background: var(--l2-bg);
      box-shadow: 2px 0 24px 0 rgba(0,0,0,0.18);
      z-index: var(--offcanvas-z);
      transform: translateX(-100%);
      transition: var(--offcanvas-transition);
      outline: none;
      border: none;
      will-change: transform;

      display: flex;
      flex-direction: column;
      justify-content: space-between;

    }

    :host([open]) {
      transform: translateX(0);
    }

    ::slotted(*:not([slot])) {
      flex-grow: 1; /* Assign flex properties */
      padding: var(--padding);
    }

    ::slotted([slot="header"]) {
      padding: var(--padding);
      font-weight: bold;
    }

    ::slotted([slot="footer"]) {
      display: block;
      padding: var(--padding);
      background: var(--background-tertiary-color)
    }

    .visually-hidden {
      position: absolute;
      width: 1px;
      height: 1px;
      overflow: hidden;
      clip: rect(1px,1px,1px,1px);
    }



  </style>
  <slot name="header"></slot>
  <button part="dismiss" id="dismiss" class="dismiss visually-hidden" aria-label="Close" data-dismiss="offcanvas"></button>
  <slot></slot>
  <slot name="footer"></slot>
`;



export class OffcanvasPanel extends HTMLElement {
  static observedAttributes = ["open"];

  #previouslyFocusedPageElement;

  constructor() {
    super();
    const shadow = this.attachShadow({ mode: "open" });
    shadow.appendChild(template.content.cloneNode(true));
    shadow.getElementById("dismiss").addEventListener("click", () => this.hide());
  }

  // 2. API: show/hide/toggle (Declarative and imperative)
  show() {
    if (this.open) return;
    this.setAttribute("open", "");
  }
  hide() {
    if (!this.open) return;
    this.removeAttribute("open");
  }
  toggle(force) {
    if (force == null) {
      this.open ? this.hide() : this.show();
    } else {
      force ? this.show() : this.hide();
    }
  }

  // 3. Attribute/property sync
  get open() {
    return this.hasAttribute("open");
  }
  set open(val) {
    val ? this.setAttribute("open", "") : this.removeAttribute("open");
  }

  // Lifecycle
  connectedCallback() {
    this.setAttribute("tabindex", "-1");
    this.setAttribute("role", "dialog");
    this.setAttribute("aria-modal", "true");

    // this.addEventListener("keydown", this.#onKeydown);
    this.addEventListener("click", this.#onClick);
    window.addEventListener("resize", this.#onResize);
    document.addEventListener("click", this.#onDocumentToggle, true); // data-api
  }

  disconnectedCallback() {
    // this.removeEventListener("keydown", this.#onKeydown);
    this.removeEventListener("click", this.#onClick);
    window.removeEventListener("resize", this.#onResize);
    document.removeEventListener("click", this.#onDocumentToggle, true);
  }

  // 5. Attribute change
  attributeChangedCallback(name, oldValue, newValue) {
    if (name === "open") {
      if (this.open) this.#onShow();
      else this.#onHide();
    }
  }

  #onShow() {

    document.querySelectorAll("offcanvas-component[open]:not(:host)").forEach((el) => el.hide()); // Multi-instance safety: close others
    this.dispatchEvent(new CustomEvent("show", { bubbles: true }));

    // Scroll lock
    //TODO document.body.style.overflow = "hidden";

    // Save last active element
    this.#previouslyFocusedPageElement = document.activeElement;

    // ARIA
    this.removeAttribute("aria-hidden");
    this.focus({ preventScroll: true });

    this.dispatchEvent(new CustomEvent("shown", { bubbles: true }));
  }

  // 7. Hide (with backdrop, events, scroll unlock, focus restore)
  #onHide() {
    this.dispatchEvent(new CustomEvent("hide", { bubbles: true }));

    // Scroll unlock
    document.body.style.overflow = "";

    // Focus restore
    if (this.#previouslyFocusedPageElement?.focus) this.#previouslyFocusedPageElement.focus();
    this.#previouslyFocusedPageElement = null;

    // ARIA
    this.setAttribute("aria-hidden", "true");

    this.dispatchEvent(new CustomEvent("hidden", { bubbles: true }));
  }

  // 9. Click handling (backdrop & dismiss triggers)
  #onClick = (e) => {
    // 10. Dismiss triggers
    if (e.target.closest('[data-dismiss="offcanvas"]')) {
      this.hide();
      return;
    }
  };

  // [data-offcanvas-toggle] (event delegation)
  #onDocumentToggle = (e) => {

    // The closest() method of the Element interface traverses the element and its parents (heading toward the document root) until it finds a node that matches the specified CSS selector.
    const toggle = e.target.closest("[data-offcanvas-toggle]");

    if (toggle) {
      const target = toggle.getAttribute("data-offcanvas-target"); // offcanvas-target holds the selector
      const offcanvas = document.querySelector(target);
      offcanvas?.toggle();
      e.preventDefault();
    }
  };

  // Hide on resize if not fixed
  #onResize = () => {
    if (this.open && getComputedStyle(this).position !== "fixed") {
      this.hide();
    }
  };

}

function html(a,...b) { return (Array.from({ length: Math.max(a.length, b.length) }, (_, index) => [a[index], b[index]])).flat().join('') }  // For Code Highlighters (zed editor treats html`` as html and highlights the syntax)

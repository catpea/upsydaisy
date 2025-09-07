// import { Disposables } from "../util/Disposables.js";

// we must use the template element as it only requires: shadow.appendChild(template.content.cloneNode(true));
const template = document.createElement('template');
template.innerHTML = `

  <style>
    :host { }
    class-name:hover{ }
    ::slotted(*:not([slot])) { }
    ::slotted([slot="slot-name"]) { }
    .visually-hidden { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(1px,1px,1px,1px); }
  </style>

	 <slot>note</slot>
`;

export class WebApplication extends HTMLElement {

  constructor() {
    super();
    const shadow = this.attachShadow({ mode: "open" });
    shadow.appendChild(template.content.cloneNode(true));

    this.addEventListener('context-request', event => {
      event.stopImmediatePropagation();
      // If the callback throws, propagation is already stopped
      event.callback(this);
    });

  }

  connectedCallback() {
    // this.dispatchEvent( new ContextRequestEvent(application => this.contextCallback(application)));
    lo(this.constructor.name, 'Connected')
  }
  contextCallback(application){
    // this.application = application;
    // now all components have a shared copntext
  }

  disconnectedCallback() {
  }

  attributeChangedCallback(name, oldValue, newValue) {
    // if (name === ...) { this.#...
  }

  #internal(){
    this.dispatchEvent(new CustomEvent("something", { bubbles: true }));
  }
}

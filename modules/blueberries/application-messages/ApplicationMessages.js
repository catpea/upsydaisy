import { ContextRequestEvent } from "../util/ContextRequestEvent.js";

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

export class ApplicationMessages extends HTMLElement {

  constructor() {
    super();
    const shadow = this.attachShadow({ mode: "open" });
    shadow.appendChild(template.content.cloneNode(true));
  }

  connectedCallback() {
    this.dispatchEvent( new ContextRequestEvent(application => this.contextCallback(application)));
  }
  contextCallback(application){
    this.application = application;
    lo(this.constructor.name, 'Connected to Application', this.application);
    const small = document.createElement('small');
    small.textContent = this.constructor.name + ' is ' + 'Connected to Application'
    this.appendChild(small);
  }

  disconnectedCallback() {
  }

  attributeChangedCallback(name, oldValue, newValue) {
    // if (name === ...) { this.#....
  }

  #internal(){
    this.dispatchEvent(new CustomEvent("something", { bubbles: true }));
  }
}

import { Signal, DisposableSinusoidalListener } from "#sinusoid";
import { Disposables } from "../util/Disposables.js";
import { DisposableEventListener } from "../util/DisposableEventListener.js";

/**
 * Simple and minimal, lightweight implementation of a switch-panel web component (aka card-stack/view-stack)
 *
 * @example
 * <switch-panel data-selected="second">
 *   <section data-id="first">
 *     view content
 *   </section>
 *   <section data-id="second">
 *     view content
 *   </section>
 * </switch-panel>
 */

const template = document.createElement('template');
template.innerHTML = `
  <style>
    :host {
      display: block;
    }

  </style>

  <slot></slot>
`;

export class SwitchPanel extends HTMLElement {
  #disposables = new Disposables(); // set by external web-component
  #view;

  constructor() {
    super();
    const shadow = this.attachShadow({ mode: "open" });
    shadow.appendChild(template.content.cloneNode(true));
    this.#disposables.add(new DisposableEventListener(this, "view-change", ({detail:{view}})=>this.selectView(view)));

  }

  connectedCallback() {

  }

  disconnectedCallback() {
    this.#disposables.dispose();
  }

  static get observedAttributes() {
    return ["view"];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name === "view" && newValue) {
        this.dispatchEvent(new CustomEvent('view-change', {
          detail: { view: newValue },
          bubbles: true
        }));
    }
  }

  selectView(view){

    const slot = this.shadowRoot.querySelector('slot');
    const assignedNodes = slot.assignedNodes({ flatten: true });

    slot.style.display = 'block';

    assignedNodes.forEach(node => {
      if (node.nodeType === Node.ELEMENT_NODE) {
        if(node.dataset.id == view){
          node.style.display = 'block';
        }else{
          node.style.display = 'none';
        }
      }
    });
  }


  // Generate unique ID for accessibility
  generateId() {
    return Math.random().toString(36).substring(2, 9);
  }

}

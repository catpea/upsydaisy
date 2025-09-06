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

  constructor() {
    super();
    const shadow = this.attachShadow({ mode: "open" });
    shadow.appendChild(template.content.cloneNode(true));
    this.#disposables.add(new DisposableEventListener(this, "selectchange", ({detail:{select}})=>this.selectView(select)));
  }

  connectedCallback() {

  }

  disconnectedCallback() {
    this.#disposables.dispose();
  }

  static get observedAttributes() {
    return ["select"];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name === "select" && newValue) {
      try {
        this.dispatchEvent(new CustomEvent('selectchange', {
          detail: { select: newValue },
          bubbles: true
        }));
      } catch (e) {
        console.error("Invalid gradient-stops JSON:", e);
      }
    }
  }

  selectView(select){
    console.log('@@@ select', selectView)
  }


  // Generate unique ID for accessibility
  generateId() {
    return Math.random().toString(36).substring(2, 9);
  }

}

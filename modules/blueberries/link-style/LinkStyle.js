// we must use the template element as it only requires: shadow.appendChild(template.content.cloneNode(true));


export class LinkStyle extends HTMLElement {
  constructor() {
    super();
    const shadow = this.attachShadow({ mode: "open" });

    this.styleElement = document.createElement("style");

    document.addEventListener('generated', (e) => {
      console.log('XXXXX', e)
      this.styleElement.innerHTML = e.detail.css;
    })

  }

  connectedCallback() {
    this.parentNode.appendChild( this.styleElement );
  }

  disconnectedCallback() {
    // this.parentNode.remove(this.style);

  }

  attributeChangedCallback(name, oldValue, newValue) {
    // if (name === ...) { this.#...
  }

  #internal(){
    this.dispatchEvent(new CustomEvent("something", { bubbles: true }));
  }
}

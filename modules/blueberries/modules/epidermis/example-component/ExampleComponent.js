const template = document.createElement("template");

template.innerHTML = `

  <link href="../reset.css" rel="stylesheet">
  <link href="../controls.css" rel="stylesheet">
  <link href="../developer.css" rel="stylesheet">

  <style>
    :host { }
    class-name:hover{ }
    ::slotted(*:not([slot])) { }
    ::slotted([slot="slot-name"]) { }
  </style>

  <div>Your HTML</div>
`;

export class ExampleComponent extends HTMLElement {
  constructor() {
    super();
    const shadow = this.attachShadow({ mode: "open" });
    shadow.appendChild(template.content.cloneNode(true));

    // create locals
    this.tableHeader = shadow.querySelector("#tableHeader");
    this.tableBody = shadow.querySelector("#tableBody");

    this.initializeYourThing();

  }

  initializeYourThing(){

  }

  connectedCallback() {
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

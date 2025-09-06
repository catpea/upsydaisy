import { Signal, DisposableSinusoidalListener } from "#sinusoid";
import { ColorFilters, ColorMath } from "#iridescence";

import { Disposables } from "../util/Disposables.js";
import { DisposableEventListener } from "../util/DisposableEventListener.js";
import { GradientCalculator } from "../util/GradientCalculator.js";
import { DisposableArrayListener, ReactiveArray, detectSetChanges, detectOrderChanges } from "../util/ReactiveArray.js";

const gradientCalculator = new GradientCalculator();

// we must use the template element as it only requires: shadow.appendChild(template.content.cloneNode(true));
const template = document.createElement("template");
template.innerHTML = `
  <link href="https://cdn.jsdelivr.net/npm/epidermis/reset.css" rel="stylesheet">
  <link href="https://cdn.jsdelivr.net/npm/epidermis/controls.css" rel="stylesheet">
  <link href="https://cdn.jsdelivr.net/npm/epidermis/developer.css" rel="stylesheet">
  <style>
    :host {
      --table-bg-color: var(--l3-bg); /* Background color of the table */
      --header-bg-color: var(--l4-bg); /* Background color of the header */
      --header-text-color: var(--text); /* Text color for the header */
      --text-color: var(--text); /* Text color for the table body */
      --border-color: var(--l3-br); /* Border color */
      --border-radius: 10px; /* Border radius for rounded corners */
      --padding: 10px; /* Padding for table cells */
      --font-family: Arial, sans-serif; /* Font family */

      background: var(--l3-bg);

    }
    class-name:hover{ }
    ::slotted(*:not([slot])) { }
    ::slotted([slot="slot-name"]) { }
    .visually-hidden { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(1px,1px,1px,1px); }

    .table {
      width: 100%;
      font-family: var(--font-family);
      font-size: x-small;
    }

    .table th,
    .table td {
      padding: var(--padding);
      text-align: left;
      border-radius: var(--border-radius); /* Apply border-radius to cells */
      border: 1px solid var(--border-color);
    }




    .table thead {
      border: none;
    }
    .table thead th {
      border: none;
    }
    .table thead th {
      border: none;
    }

    .table tbody th {
      border: none;
    }

    /*
    .table tbody tr:nth-child(even) td {
      background-color:var(--l3-bg); /* Light gray for even rows */
    }

    .table tbody tr:hover td {
      background-color: var(--l3-fg); /* Highlight on hover */
    }
    */

  </style>
  <table class="table">
    <thead>
      <tr id="tableHeader">
      </tr>
    </thead>

    <tbody id="tableBody">
      <tr id="transformerSelectors"></tr>
      <tr id="powerAdjusters"></tr>
      <tr id="sensitivityAdjusters"></tr>
    </tbody>

  </table>
`;

export class ThemeGrid extends HTMLElement {
  #cssCode = new Signal('body {}');
  #colorStops = new ReactiveArray(); // set by external web-component
  #disposables = new Disposables(); // set by external web-component

  #colorFilters = [
    {value:'darkOceanDepths', text:'darkOceanDepths'},
    {value:'nightLakeReflection', text:'nightLakeReflection'},
    {value:'foxfire', text:'foxfire'},
    {value:'moonlessForest', text:'moonlessForest'},
    {value:'deepCaveAmbient', text:'deepCaveAmbient'},
    {value:'terminatorVision', text:'terminatorVision'},
    {value:'predatorThermal', text:'predatorThermal'},
    {value:'nightVisionGoggles', text:'nightVisionGoggles'},
    {value:'cyberpunkNeon', text:'cyberpunkNeon'},
    {value:'ghostlySpectral', text:'ghostlySpectral'},
    {value:'nebulaDust', text:'nebulaDust'},
    {value:'plutoAtmosphere', text:'plutoAtmosphere'},
    {value:'blackHoleAccretion', text:'blackHoleAccretion'},
    {value:'voidCold', text:'voidCold'},
    {value:'cosmicRadiation', text:'cosmicRadiation'},
    {value:'atmosphericScatter', text:'atmosphericScatter'},
    {value:'sunsetGradient', text:'sunsetGradient'},
    {value:'mistEffect', text:'mistEffect'},
    {value:'chromaticAberration', text:'chromaticAberration'},
    {value:'iridescence', text:'iridescence'},
    {value:'oilSlick', text:'oilSlick'},
    // {value:'soapBubble', text:'soapBubble'}, // uses angle
    {value:'sunlightTransform', text:'sunlightTransform'},
    {value:'moonlightTransform', text:'moonlightTransform'},
    {value:'bioluminescence', text:'bioluminescence'},
    {value:'butterflyWing', text:'butterflyWing'},
    {value:'firefly', text:'firefly'},
    {value:'underwaterCaustics', text:'underwaterCaustics'},
    {value:'deepSeaGlow', text:'deepSeaGlow'},
    {value:'auroraTransform', text:'auroraTransform'},
    {value:'lightning', text:'lightning'},
    {value:'canopyFilter', text:'canopyFilter'},
    {value:'xenCrystal', text:'xenCrystal'},
    {value:'gravityGun', text:'gravityGun'},
    {value:'combine', text:'combine'},
    {value:'headcrabInfestation', text:'headcrabInfestation'},
    {value:'lambdaCore', text:'lambdaCore'},
    {value:'portalEnergy', text:'portalEnergy'},
    {value:'radioactive', text:'radioactive'},
  ];



  #levels = new ReactiveArray(
    // { id: "level0" },
    { id: "up5" },
    { id: "up4" },
    { id: "up3" },
    { id: "up2" },
    { id: "up1" },
    // { id: "level6" },
    // { id: "level7" },
    // { id: "level8" },
    // { id: "level9" }
  );

  // level5,  level4,  level3,  level2,  level1
  // caption,  backdrop,  background,  raised,  foreground,  text,  link,  info,  success,  warning,  danger,  muted,
  #variables = new ReactiveArray(
    { id: "caption",       transformer: new Signal('oilSlick'), power: new Signal(0.6),   sensitivity: new Signal(.3), },
    { id: "backdrop",      transformer: new Signal('oilSlick'), power: new Signal(0.3),   sensitivity: new Signal(.3), },
    { id: "background",    transformer: new Signal('oilSlick'), power: new Signal(0.4),   sensitivity: new Signal(.3), },
    { id: "border",        transformer: new Signal('oilSlick'), power: new Signal(0.7),   sensitivity: new Signal(.3), },
    { id: "raised",        transformer: new Signal('oilSlick'), power: new Signal(0.7),   sensitivity: new Signal(.3), },
    { id: "foreground",    transformer: new Signal('oilSlick'), power: new Signal(0.9),   sensitivity: new Signal(.3), },
    { id: "text",          transformer: new Signal('oilSlick'), power: new Signal(0.8),   sensitivity: new Signal(.3), },
    { id: "link",          transformer: new Signal('oilSlick'), power: new Signal(0.9),   sensitivity: new Signal(.3), },

    // {id: 'info', value:new Signal(0.8)},
    // {id: 'success', value:new Signal(0.9)},
    // {id: 'warning', value:new Signal(0.10)},
    // {id: 'danger', value:new Signal(0.11)},
    // {id: 'muted', value:new Signal(0.12)},
  );

  constructor() {
    super();
    const shadow = this.attachShadow({ mode: "open" });
    shadow.appendChild(template.content.cloneNode(true));

    this.tableHeader = shadow.querySelector("#tableHeader");
    this.tableBody = shadow.querySelector("#tableBody");

    this.transformerSelectors = shadow.querySelector("#transformerSelectors");
    this.powerAdjusters = shadow.querySelector("#powerAdjusters");
    this.sensitivityAdjusters = shadow.querySelector("#sensitivityAdjusters");

    this.cssCode = document.querySelector("#cssCode");
    this.cssPreview = document.querySelector("#cssPreview");

    this.initializeTable();
  }

  initializeTable() {

    this.#disposables.add(new DisposableArrayListener(this.#variables, "change", (e) => this.renderTableHeaders()));
    this.#disposables.add(new DisposableArrayListener(this.#variables, "change", (e) => this.renderTransformerSelectors()));
    this.#disposables.add(new DisposableArrayListener(this.#variables, "change", (e) => this.renderPowerAdjusters()));
    this.#disposables.add(new DisposableArrayListener(this.#variables, "change", (e) => this.renderSensitivityAdjusters()));
    this.#disposables.add(new DisposableArrayListener(this.#colorStops, "change", (e) => this.renderTableRows()));

    this.#colorStops.rev.subscribe(([rev])=>console.info(`this.#colorStops revision is now at ${rev}`))


    const any = Signal.combineLatest(
      this.#colorStops.rev,
      this.#variables.rev,
      this.#levels.rev,
      ...this.#variables.map(({transformer})=>transformer),
      ...this.#variables.map(({power})=>power),
      ...this.#variables.map(({sensitivity})=>sensitivity),
      );
    const anyDeferred = Signal.debounce(any, 100);

    this.#disposables.add({dispose:()=>any.terminate()});
    this.#disposables.add({dispose:()=>anyDeferred.terminate()});

    // generate code
    this.#disposables.add({dispose:anyDeferred.subscribe(v=>this.#cssCode.value=this.generateCSS())});

    // highlight code
    this.#disposables.add({dispose:this.#cssCode.subscribe(cssCode => this.cssCode.innerHTML = Prism.highlight(cssCode, Prism.languages.css, 'css'))});
    // make it live
    this.#disposables.add({dispose:this.#cssCode.subscribe(cssCode => this.cssPreview.innerHTML = cssCode)});
    this.#disposables.add({dispose:this.#cssCode.subscribe(css => {
      document.dispatchEvent(new CustomEvent("generated", { bubbles: true, detail:{css}}));
    })});


  }



  // sensitivity comes from here (I use .value correctly):




/*
// Option 2: Use a logarithmic scale
return Math.pow(level / totalLevels, 1.2);

// Option 3: Custom curve for better visual distribution
const t = level / (totalLevels - 1);
return Math.pow(t, 0.8); // Slows down the progression toward the end
*/
  calculateColor(levels, level, variable, inverse){
    const filter = new ColorFilters();

    const transformer = variable.transformer.value;
    const power = variable.power.value;
    const sensitivity = variable.sensitivity.value;

    const ratio = (level + 0.5) / levels.length;
    const percentage = 100 * ratio;
    const location = inverse?percentage:100-percentage;

    const hexColor = gradientCalculator.getColorAtPercentage(this.#colorStops, location);
    console.log('DDD', hexColor)
    if(hexColor == null) return '#000';

    const originalColor = ColorMath.hexToRgb(hexColor);

    const transformedColor = filter[transformer](originalColor,  power);
    const attenuatedColor = ColorMath.mix(originalColor, transformedColor, sensitivity);
    // const attenuatedColor = ColorMath.mix(transformedColor, originalColor, sensitivity);

    const response = ColorMath.rgbToHex(attenuatedColor.r, attenuatedColor.g, attenuatedColor.b);
    // const response = ColorMath.rgbToHex(originalColor.r, originalColor.g, originalColor.b);
    // return hexColor;
    return response;
  }

  generateUps(levels, level=0){
    if(!levels[level]) return '';
    const options = levels[level];

    return `
     /* level: ${options.id} */
      .up {
        ${this.#variables.map(variable=>`--${variable.id}:  var(--${options.id}-${variable.id});`).join('\n')}
        ${this.generateUps(levels, level + 1)}
      }
    `;
  }
  generateLevels(levels, level=0){
    if(!levels[level]) return '';
    const options = levels[level];

    return `
        /* level: ${options.id} */
        ${this.#variables.map(variable=>`--${options.id}-${variable.id}: ${this.calculateColor(levels, level, variable, true)};`).join('\n')}
        ${this.generateLevels(levels, level + 1)}
    `;
  }
  generateCSS(){

    const options = {
      "indent_size": "2",
      "indent_char": " ",
      "max_preserve_newlines": "-1",
      "preserve_newlines": false,
      "keep_array_indentation": false,
      "break_chained_methods": false,
      "indent_scripts": "normal",
      "brace_style": "collapse",
      "space_before_conditional": true,
      "unescape_strings": false,
      "jslint_happy": false,
      "end_with_newline": true,
      "wrap_line_length": "0",
      "indent_inner_html": false,
      "comma_first": false,
      "e4x": false,
      "indent_empty_lines": false
    };

    let css = '';
    css += `:root {${ this.generateLevels(this.#levels.toReversed(), 0)}}`;
    css += this.generateUps(this.#levels.toReversed(), 0);
    return css_beautify(css , options);
  }

  renderTableHeaders() {
    this.tableHeader.textContent = "";
    const th = document.createElement("th"); // ID/blank Header (never changes)
    th.setAttribute("scope", "col");
    th.innerText = 'override';
    this.tableHeader.appendChild(th);
    for (const { id } of this.#variables) {
      const th = document.createElement("th");
      th.setAttribute("scope", "col");
      th.textContent = id;
      this.tableHeader.appendChild(th);
    }
  }


  renderTransformerSelectors() {
    this.transformerSelectors.textContent = "";

    const td = document.createElement("td");


      // DROPDOWN
      const transformerSelect = document.createElement("select");
      for(const {value, text} of this.#colorFilters){
        const transformerOption = document.createElement("option");
        transformerOption.setAttribute("value", value);
        transformerOption.innerText = text;
        transformerSelect.appendChild(transformerOption);
      }
      // transformerSelect.value = entry.transformer.value;
      td.appendChild(transformerSelect);
      // DROPDOWN HANDLER
      const eventHandler = (e) => {
        for (const entry of this.#variables) {
          entry.transformer.value = e.target.value;
        }
      };
      const disposableId = `transformer-select-override`;
      const disposableListener = new DisposableEventListener(transformerSelect, "change", eventHandler);
      this.#disposables.dispose(disposableId);
      this.#disposables.add(disposableListener, disposableId);



    this.transformerSelectors.appendChild(td);

    for (const entry of this.#variables) {
      const td = document.createElement("td");

      // DROPDOWN
      const transformerSelect = document.createElement("select");
      for(const {value, text} of this.#colorFilters){
        const transformerOption = document.createElement("option");
        transformerOption.setAttribute("value", value);
        transformerOption.innerText = text;
        transformerSelect.appendChild(transformerOption);
      }
      td.appendChild(transformerSelect);
      // FROM SIGNAL HANDLER FOR ALL
      const transformerSignalUpdateHandler = transformerValue => transformerSelect.value = transformerValue;
      const fromSignalDisposableId = `transformer-signal-${entry.id}`;
      const fromSignalDisposableListener = new DisposableSinusoidalListener(entry.transformer, transformerSignalUpdateHandler);
      this.#disposables.dispose(fromSignalDisposableId);
      this.#disposables.add(fromSignalDisposableListener, fromSignalDisposableId);
      // FROM DROPDOWN HANDLER
      const eventHandler = (e) => entry.transformer.value = e.target.value;
      const fromDropdownDisposableId = `transformer-select-${entry.id}`;
      const fromDropdownDisposableListener = new DisposableEventListener(transformerSelect, "change", eventHandler);
      this.#disposables.dispose(fromDropdownDisposableId);
      this.#disposables.add(fromDropdownDisposableListener, fromDropdownDisposableId);

      this.transformerSelectors.appendChild(td);

    }
  }


  renderPowerAdjusters() {
    this.powerAdjusters.textContent = "";

    const td = document.createElement("td");
    // INPUT
    const powerInput = document.createElement("input");
    powerInput.setAttribute("type", "number");
    powerInput.setAttribute("min", "0");
    powerInput.setAttribute("max", "1");
    powerInput.setAttribute("step", "0.1");
    // powerInput.setAttribute("value", entry.power.value);
    td.appendChild(powerInput);
    // HANDLER
    const eventHandler = (e) => {
      for (const entry of this.#variables) {
        entry.power.value = e.target.value;
      }
    };
    const disposableId = `power-input-override`;
    const disposableListener = new DisposableEventListener(powerInput, "input", eventHandler);
    this.#disposables.dispose(disposableId);
    this.#disposables.add(disposableListener, disposableId);
    this.powerAdjusters.appendChild(td);

    for (const entry of this.#variables) {
      const td = document.createElement("td");

      const powerInput = document.createElement("input");
      powerInput.setAttribute("type", "number");
      powerInput.setAttribute("min", "0");
      powerInput.setAttribute("max", "1");
      powerInput.setAttribute("step", "0.01");
      powerInput.setAttribute("value", entry.power.value);
      td.appendChild(powerInput);


      // FROM SIGNAL HANDLER FOR ALL
      const powerSignalUpdateHandler = powerValue => powerInput.value = powerValue;
      const fromSignalDisposableId = `power-signal-${entry.id}`;
      const fromSignalDisposableListener = new DisposableSinusoidalListener(entry.power, powerSignalUpdateHandler);
      this.#disposables.dispose(fromSignalDisposableId);
      this.#disposables.add(fromSignalDisposableListener, fromSignalDisposableId);
      // FROM UI
      const eventHandler = (e) => {
        entry.power.value = e.target.value;
      };

      const disposableId = `power-input-${entry.id}`;
      const disposableListener = new DisposableEventListener(powerInput, "input", eventHandler);
      this.#disposables.dispose(disposableId);
      this.#disposables.add(disposableListener, disposableId);

      this.powerAdjusters.appendChild(td);
    }
  }


  renderSensitivityAdjusters() {
    this.sensitivityAdjusters.textContent = "";


    const td = document.createElement("td");
    // INPUT
    const sensitivityInput = document.createElement("input");
    sensitivityInput.setAttribute("type", "number");
    sensitivityInput.setAttribute("min", "0");
    sensitivityInput.setAttribute("max", "1");
    sensitivityInput.setAttribute("step", "0.1");
    // sensitivityInput.setAttribute("value", entry.sensitivity.value);
    td.appendChild(sensitivityInput);
    // HANDLER
    const eventHandler = (e) => {
      for (const entry of this.#variables) {
        entry.sensitivity.value = e.target.value;
      }
    };
    const disposableId = `sensitivity-input-override`;
    const disposableListener = new DisposableEventListener(sensitivityInput, "input", eventHandler);
    this.#disposables.dispose(disposableId);
    this.#disposables.add(disposableListener, disposableId);
    this.sensitivityAdjusters.appendChild(td);




    for (const entry of this.#variables) {
      const td = document.createElement("td");

      // INPUT
      const sensitivityInput = document.createElement("input");
      sensitivityInput.setAttribute("type", "number");
      sensitivityInput.setAttribute("min", "0");
      sensitivityInput.setAttribute("max", "1");
      sensitivityInput.setAttribute("step", "0.01");
      sensitivityInput.setAttribute("value", entry.sensitivity.value);
      td.appendChild(sensitivityInput);

      // FROM SIGNAL HANDLER FOR ALL
      const sensitivitySignalUpdateHandler = sensitivityValue => sensitivityInput.value = sensitivityValue;
      const fromSignalDisposableId = `sensitivity-signal-${entry.id}`;
      const fromSignalDisposableListener = new DisposableSinusoidalListener(entry.sensitivity, sensitivitySignalUpdateHandler);
      this.#disposables.dispose(fromSignalDisposableId);
      this.#disposables.add(fromSignalDisposableListener, fromSignalDisposableId);

      // HANDLER
      const eventHandler = (e) => entry.sensitivity.value = e.target.value;
      const disposableId = `sensitivity-input-${entry.id}`;
      const disposableListener = new DisposableEventListener(sensitivityInput, "input", eventHandler);
      this.#disposables.dispose(disposableId);
      this.#disposables.add(disposableListener, disposableId);

      this.sensitivityAdjusters.appendChild(td);
    }
  }




  renderTableRows() {
    this.tableBody.querySelectorAll("tr.color-row").forEach((row) => row.remove());

    for (const [rowIndex, { id: rowId }] of this.#levels.entries()) {
      const tr = document.createElement("tr");
      tr.setAttribute("class", "color-row");

      //ROW HEADER
      const th = document.createElement("th");
      th.setAttribute("scope", "row");
      th.textContent = rowId;
      tr.appendChild(th);
      //ROW HEADER

      for (const [colIndex, { id: colId }] of this.#variables.entries()) {
        const td = document.createElement("td");
        td.setAttribute('style', `background: var(--${rowId}-${colId});`)
        // td.classList.add(`${rowId}-${colId}`);

        // const sensitivitySignal = this.#variables[colIndex].sensitivity;

        // const sensitivitySignalUpdateHandler = sensitivity => {
        //   td.style.background =  this.calculateColor(this.#levels, rowIndex, sensitivity)
        // };
        // const disposableListener = new DisposableSinusoidalListener(sensitivitySignal, sensitivitySignalUpdateHandler);
        // this.#disposables.dispose(`${rowId}-${colId}`);
        // this.#disposables.add(disposableListener, `${rowId}-${colId}`);

        tr.appendChild(td);
      }

      this.tableBody.appendChild(tr);
    }
  }

  connectedCallback() {}

  disconnectedCallback() {
    this.#disposables.dispose();
  }

  static get observedAttributes() {
    return ["gradient-stops"];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name === "gradient-stops" && newValue) {
      try {
        this.#colorStops.splice(0, this.#colorStops.length, ...JSON.parse(newValue));
      } catch (e) {
        console.error("Invalid gradient-stops JSON:", e);
      }
    }
  }

  #internal() {
    this.dispatchEvent(new CustomEvent("something", { bubbles: true }));
  }






}

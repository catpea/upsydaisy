import { ContextRequestEvent } from "../util/ContextRequestEvent.js";

// we must use the template element as it only requires: shadow.appendChild(template.content.cloneNode(true));
const template = document.createElement('template');
template.innerHTML = `
  <link href="modules/epidermis/reset.css" rel="stylesheet">
  <link href="modules/epidermis/controls.css" rel="stylesheet">
  <link href="modules/epidermis/developer.css" rel="stylesheet">
  <style>
    :host {
      display: block;
      xx-padding: 20px;
      xx-border: 1px solid var(--l3-br);
      border-radius: 8px;
      // max-width: 600px;
      background: var(--l3-bg);
      font-family: system-ui, -apple-system, sans-serif;
    }

    .controls {
      margin-bottom: 20px;
      padding: 15px;
      background: var(--l4-bg);
      border-radius: 6px;
      box-shadow: 0 1px 3px var(--l4-sh);
    }

    .color-group {
    }

    label {
      font-size: 14px;
      color: #666;
      font-weight: 500;
    }

    input[type="color"] {
      width: 50px;
      height: 40px;
      border: 2px solid #ddd;
      border-radius: 4px;
      cursor: pointer;
      transition: border-color 0.2s;
    }

    input[type="color"]:hover {
      border-color: #999;
    }

    input[type="color"]:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    input[type="number"] {
      width: 80px;
      padding: 8px;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 14px;
    }

    button {
      padding: 8px 8px;
      background: #4CAF50;
      color: white;
      border: none;
      border-radius: 4px;
      font-size: 14px;
      cursor: pointer;
      transition: background 0.2s;
      opacity: .50;

    }

    button:hover {
      background: #45a049;
    }

    button.delete {
      background: #f44336;
    }

    button.delete:hover {
      background: #da190b;
    }

    button:disabled {
      background: #ccc;
      opacity: .15;
      cursor: not-allowed;
    }

    .gradient-container {
      background: var(--l4-bg);
      padding: 20px;
      border-radius: 6px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
      margin-bottom: 4px;

      display: grid;
      grid-template-columns: 25px 1fr ; /* Create three columns */
      gap: var(1rem); /* Set gap between items */
    }

    gradient-bar {
      margin-bottom: 10px;
      border-radius: 4px;
      overflow: hidden;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .info {
      margin-top: 15px;
      padding: 10px;
      background: var(--l4-bg);
      border-radius: 4px;
      font-size: 13px;
      color: #1976d2;
    }

    .stop-info {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 8px;
      background: var(--l4-bg);
      border-radius: 4px;
      font-size: 14px;
      margin-bottom: 4px;
    }

    .stop-info.no-selection {
      background: var(--l4-bg);
      color: #999;
    }
  </style>



    <div class="controls debug-message debug-visible"  data-debug="level-builder">

      <div class="color-group">
        <!-- <label for="colorInput">Color:</label> -->
        <input type="color" id="colorInput" disabled>
      </div>

      <div class="color-group">
        <!-- <label for="positionInput">Position:</label> -->
        <input type="number" id="positionInput" min="0" max="100" step="0.1" disabled>
        <span>%</span>
      </div>

    </div>

  <div class="gradient-container">
    <gradient-stops vertical width="25px" height="300px"></gradient-stops>
    <gradient-bar vertical width="64px" height="300px"></gradient-bar>
  </div>

  <div class="controls">
    <button id="addStop">
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-plus-square" viewBox="0 0 16 16">
      <path d="M14 1a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1zM2 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2z"/>
      <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4"/>
    </svg>
    </button>
    <button id="deleteStop" class="delete" disabled>
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-x-square" viewBox="0 0 16 16">
      <path d="M14 1a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1zM2 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2z"/>
      <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708"/>
    </svg>
    </button>
  </div>

  <div class="stop-info no-selection">
    <span id="stopInfoText"></span>
  </div>
  <div class="info">
    <strong></strong>
  </div>

`;

export class LevelBuilder extends HTMLElement {
  #colorStops = [];
  #selectedStopIndex = -1;

  constructor() {
    super();
    const shadow = this.attachShadow({ mode: 'open' });
    shadow.appendChild(template.content.cloneNode(true));

    // Get references to elements
    this.colorInput = shadow.querySelector('#colorInput');
    this.positionInput = shadow.querySelector('#positionInput');
    this.addStopBtn = shadow.querySelector('#addStop');
    this.deleteStopBtn = shadow.querySelector('#deleteStop');
    this.stopInfoText = shadow.querySelector('#stopInfoText');
    this.stopInfoContainer = shadow.querySelector('.stop-info');
    this.gradientStopsComponent = shadow.querySelector('gradient-stops');
    this.gradientBarComponent = shadow.querySelector('gradient-bar');

    // Initialize with default gradient
    // this.#colorStops = [
    //   { percentage: 0, color: '#03141C' },
    //   { percentage: 100, color: '#083145' }
    // ];

    // this.initializeComponents();
    this.setupEventListeners();
  }


  static get observedAttributes() {
    return ["gradient-stops"];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name === "gradient-stops" && newValue) {
      try {
        console.log(newValue);
        this.#colorStops = JSON.parse(newValue);
        this.initializeComponents();
      } catch (e) {
        console.error("Invalid gradient-stops JSON:", e);
      }
    }
  }

  connectedCallback() {
    this.dispatchEvent( new ContextRequestEvent(application => this.contextCallback(application)));
  }

  contextCallback(application){

    this.application = application;
    lo(this.constructor.name, 'Connected to Application', this.application);


  }

  initializeComponents() {
    const stopsJson = JSON.stringify(this.#colorStops);
    this.gradientBarComponent.setAttribute('gradient-stops', stopsJson);
    this.gradientStopsComponent.setAttribute('gradient-stops', stopsJson);
  }

  setupEventListeners() {
    // Listen for stop changes from the stops component
    this.gradientStopsComponent.addEventListener('stops-changed', (e) => {
      this.#colorStops = e.detail.stops;
      this.updateGradientBar();
      this.updateSelectedStop();
      this.emitChangeEvent();
    });

    // Listen for color selection from gradient bar (sampling)
    this.gradientBarComponent.addEventListener('color-selected', (e) => {
      const { percentage, color } = e.detail;

      // If a stop is selected, update it
      if (this.#selectedStopIndex >= 0) {
        this.colorInput.value = this.rgbToHex(color);
        this.updateStopColor(this.colorInput.value);
      } else {
        // Otherwise, just update the color input for reference
        this.colorInput.value = this.rgbToHex(color);
        this.stopInfoText.textContent = `Sampled color at ${percentage}%: ${color}`;
      }
    });

    // Listen for stop selection (you'll need to add this event to gradient-stops component)
    this.gradientStopsComponent.addEventListener('stop-selected', (e) => {
      this.selectStop(e.detail.index);
    });

    // Color input change
    this.colorInput.addEventListener('input', (e) => {
      this.updateStopColor(e.target.value);
    });

    // Position input change
    this.positionInput.addEventListener('input', (e) => {
      this.updateStopPosition(parseFloat(e.target.value));
    });

    // Add stop button
    this.addStopBtn.addEventListener('click', () => {
      this.addNewStop();
    });

    // Delete stop button
    this.deleteStopBtn.addEventListener('click', () => {
      this.deleteSelectedStop();
    });

    // Listen for clicks on the stops to select them
    this.shadowRoot.addEventListener('click', (e) => {
      // Check if click is on a stop element within gradient-stops
      const path = e.composedPath();
      const stopElement = path.find(el => el && el.classList && el.classList.contains('color-stop'));
      if (stopElement) {
        const index = parseInt(stopElement.getAttribute('data-index'));
        this.selectStop(index);
      }
    });
  }

  selectStop(index) {
    if (index < 0 || index >= this.#colorStops.length) {
      this.#selectedStopIndex = -1;
      this.disableControls();
      return;
    }

    this.#selectedStopIndex = index;
    const stop = this.#colorStops[index];

    // Enable and update controls
    this.colorInput.disabled = false;
    this.positionInput.disabled = false;
    this.deleteStopBtn.disabled = this.#colorStops.length <= 2;

    this.colorInput.value = this.ensureHexColor(stop.color);
    this.positionInput.value = stop.percentage.toFixed(1);

    // Update info text
    this.stopInfoContainer.classList.remove('no-selection');
    this.stopInfoText.textContent = `Selected stop #${index + 1} at ${stop.percentage.toFixed(1)}%`;

    this.application.userActivity.value = { id:'color-stop', detail:stop };

    // Highlight the selected stop visually
    this.highlightSelectedStop(index);
  }

  highlightSelectedStop(index) {
    // Add visual highlight to selected stop in gradient-stops component
    const stops = this.gradientStopsComponent.shadowRoot.querySelectorAll('.color-stop');
    stops.forEach((stop, i) => {
      if (i === index) {
        stop.style.filter = 'brightness(1.3) drop-shadow(0 0 8px rgba(0,123,255,0.8))';
        stop.style.zIndex = '10';
      } else {
        stop.style.filter = '';
        stop.style.zIndex = '';
      }
    });
  }

  disableControls() {
    this.colorInput.disabled = true;
    this.positionInput.disabled = true;
    this.deleteStopBtn.disabled = true;
    this.stopInfoContainer.classList.add('no-selection');
    this.stopInfoText.textContent = 'Click on a stop to select it, or double-click on the gradient to add a new stop';
  }

  updateStopColor(color) {
    if (this.#selectedStopIndex < 0) return;

    this.#colorStops[this.#selectedStopIndex].color = color;
    this.updateComponents();
  }

  updateStopPosition(percentage) {
    if (this.#selectedStopIndex < 0) return;

    percentage = Math.max(0, Math.min(100, percentage));
    this.#colorStops[this.#selectedStopIndex].percentage = percentage;
    this.updateComponents();
  }

  addNewStop() {
    // Add a new stop in the middle of the gradient
    // Add a new stop in the middle of the gradient
    const newPercentage = 50;
    const interpolatedColor = this.getColorAtPercentage(newPercentage);

    this.#colorStops.push({
      percentage: newPercentage,
      color: interpolatedColor
    });

    this.updateComponents();

    // Select the new stop
    this.selectStop(this.#colorStops.length - 1);
  }

  deleteSelectedStop() {
    if (this.#selectedStopIndex < 0 || this.#colorStops.length <= 2) return;

    this.#colorStops.splice(this.#selectedStopIndex, 1);
    this.updateComponents();
    this.disableControls();
    this.#selectedStopIndex = -1;
  }

  updateComponents() {
    const stopsJson = JSON.stringify(this.#colorStops);
    this.gradientBarComponent.setAttribute('gradient-stops', stopsJson);
    this.gradientStopsComponent.setAttribute('gradient-stops', stopsJson);
    this.emitChangeEvent();
  }

  updateGradientBar() {
    this.gradientBarComponent.setAttribute('gradient-stops', JSON.stringify(this.#colorStops));
  }

  updateSelectedStop() {
    // Re-select the stop if it still exists after changes
    if (this.#selectedStopIndex >= 0 && this.#selectedStopIndex < this.#colorStops.length) {
      this.selectStop(this.#selectedStopIndex);
    } else {
      this.disableControls();
    }
  }

  getColorAtPercentage(percentage) {
    // Simple interpolation for new stops
    const sorted = [...this.#colorStops].sort((a, b) => a.percentage - b.percentage);

    for (let i = 0; i < sorted.length - 1; i++) {
      if (sorted[i].percentage <= percentage && sorted[i + 1].percentage >= percentage) {
        const ratio = (percentage - sorted[i].percentage) /
                     (sorted[i + 1].percentage - sorted[i].percentage);
        return this.interpolateColors(sorted[i].color, sorted[i + 1].color, ratio);
      }
    }

    return sorted[sorted.length-1].color;
  }

  interpolateColors(color1, color2, ratio) {
    const c1 = this.hexToRgb(this.ensureHexColor(color1));
    const c2 = this.hexToRgb(this.ensureHexColor(color2));

    const r = Math.round(c1.r + (c2.r - c1.r) * ratio);
    const g = Math.round(c1.g + (c2.g - c1.g) * ratio);
    const b = Math.round(c1.b + (c2.b - c1.b) * ratio);

    return this.rgbToHex(`rgb(${r}, ${g}, ${b})`);
  }

  rgbToHex(rgb) {
    const match = rgb.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
    if (!match) return '#000000';

    const r = parseInt(match[1]).toString(16).padStart(2, '0');
    const g = parseInt(match[2]).toString(16).padStart(2, '0');
    const b = parseInt(match[3]).toString(16).padStart(2, '0');

    return `#${r}${g}${b}`;
  }

  hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : { r: 0, g: 0, b: 0 };
  }
  rgbStrToHex(rgb) {
    const match = rgb.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
    if (!match) return "#000000";

    const r = parseInt(match[1]).toString(16).padStart(2, "0");
    const g = parseInt(match[2]).toString(16).padStart(2, "0");
    const b = parseInt(match[3]).toString(16).padStart(2, "0");

    return `#${r}${g}${b}`;
  }
  ensureHexColor(color) {
    if (color.startsWith('#')) return color;
    if (color.startsWith('rgb')) return this.rgbStrToHex(color);
    return color;
  }

  emitChangeEvent() {
    const event = new CustomEvent('gradient-changed', {
      detail: {
        stops: this.#colorStops,
        css: this.generateCSSGradient()
      },
      bubbles: true,
      composed: true
    });
    this.dispatchEvent(event);
  }

  generateCSSGradient() {
    const sorted = [...this.#colorStops].sort((a, b) => a.percentage - b.percentage);
    const stops = sorted.map(stop => `${stop.color} ${stop.percentage}%`).join(', ');
    return `linear-gradient(90deg, ${stops})`;
  }




    // this.initializeComponents();



}

// Register the custom element
// customElements.define('gradient-builder', GradientBuilder);

// Example usage:
/*
const gradientBuilder = document.createElement('gradient-builder');

gradientBuilder.addEventListener('gradient-changed', (e) => {
  console.log('Gradient changed:', e.detail.css);
  // Use e.detail.css to apply the gradient elsewhere
  document.body.style.background = e.detail.css;
});

document.body.appendChild(gradientBuilder);
*/

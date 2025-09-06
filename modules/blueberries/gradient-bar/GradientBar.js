// we must use the template element as it only requires: shadow.appendChild(template.content.cloneNode(true));
const template = document.createElement('template');
template.innerHTML = `
  <style>
    :host {
      display: block;
      cursor: pointer;
    }

    canvas {
      width: 100%;
      height: 100%;
      display: block; /* Prevents layout issues */
    }
  </style>
  <canvas></canvas>
`;

export class GradientBar extends HTMLElement {
  #colorStops = [];
  #isVertical = false;
  #width = null;
  #height = null;

  constructor() {
    super();
    const shadow = this.attachShadow({ mode: 'open' });
    shadow.appendChild(template.content.cloneNode(true));
    this.canvas = shadow.querySelector('canvas');
    this.ctx = this.canvas.getContext('2d');
    this.canvas.addEventListener('click', this.onClick.bind(this));
  }

  static get observedAttributes() {
    return ['gradient-stops', 'vertical', 'width', 'height'];
  }

  connectedCallback() {
    // Apply dimensions
    this.updateDimensions();
    // Ensure canvas is sized properly when element is connected to DOM
    this.resizeCanvas();
    if (this.#colorStops.length > 0) {
      this.updateGradient();
    }
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name === 'gradient-stops' && newValue) {
      try {
        this.#colorStops = JSON.parse(newValue);
        this.updateGradient();
      } catch (e) {
        console.error('Invalid gradient-stops JSON:', e);
      }
    }

    if (name === 'vertical') {
      // Presence of attribute means vertical, regardless of value
      this.#isVertical = newValue !== null;
      this.updateDimensions();
      this.resizeCanvas();
      this.updateGradient();
    }

    if (name === 'width') {
      this.#width = newValue;
      this.updateDimensions();
      this.resizeCanvas();
      this.updateGradient();
    }

    if (name === 'height') {
      this.#height = newValue;
      this.updateDimensions();
      this.resizeCanvas();
      this.updateGradient();
    }
  }

  updateDimensions() {
    if (this.#isVertical) {
      // Vertical mode defaults
      const width = this.#width || '30px';
      const height = this.#height || '256px';
      this.style.width = width;
      this.style.height = height;
    } else {
      // Horizontal mode defaults
      const width = this.#width || '100%';
      const height = this.#height || '30px';
      this.style.width = width;
      this.style.height = height;
    }
  }

  resizeCanvas() {
    // Get actual pixel dimensions for sharp rendering
    const rect = this.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;

    // Set actual canvas size in pixels
    this.canvas.width = rect.width * dpr;
    this.canvas.height = rect.height * dpr;

    // Scale canvas back down using CSS
    this.canvas.style.width = rect.width + 'px';
    this.canvas.style.height = rect.height + 'px';

    // Scale drawing context to match device pixel ratio
    this.ctx.save();
    this.ctx.scale(dpr, dpr);
  }

  updateGradient() {
    if (this.#isVertical) {
      this.updateGradientVertical();
    } else {
      this.updateGradientHorizontal();
    }
  }

  updateGradientVertical() {
    if (!this.isConnected || this.#colorStops.length === 0) return;

    this.resizeCanvas();

    // Create gradient that spans the full canvas height
    // 0% is at the bottom, 100% is at the top
    const canvasWidth = this.canvas.width / (window.devicePixelRatio || 1);
    const canvasHeight = this.canvas.height / (window.devicePixelRatio || 1);
    const gradient = this.ctx.createLinearGradient(0, canvasHeight, 0, 0);

    // Sort stops by percentage to ensure proper gradient
    const sortedStops = [...this.#colorStops].sort((a, b) => a.percentage - b.percentage);

    sortedStops.forEach(stop => {
      const position = Math.max(0, Math.min(1, stop.percentage / 100));
      gradient.addColorStop(position, stop.color);
    });

    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(0, 0, canvasWidth, canvasHeight);
  }

  updateGradientHorizontal() {
    if (!this.isConnected || this.#colorStops.length === 0) return;

    this.resizeCanvas();

    // Create gradient that spans the full canvas width
    const canvasWidth = this.canvas.width / (window.devicePixelRatio || 1);
    const canvasHeight = this.canvas.height / (window.devicePixelRatio || 1);
    const gradient = this.ctx.createLinearGradient(0, 0, canvasWidth, 0);

    // Sort stops by percentage to ensure proper gradient
    const sortedStops = [...this.#colorStops].sort((a, b) => a.percentage - b.percentage);

    sortedStops.forEach(stop => {
      const position = Math.max(0, Math.min(1, stop.percentage / 100));
      gradient.addColorStop(position, stop.color);
    });

    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(0, 0, canvasWidth, canvasHeight);
  }

  onClick(event) {
    const rect = this.canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    let percentage, color;

    if (this.#isVertical) {
      // Vertical mode: calculate percentage from bottom to top
      const yPos = event.clientY - rect.top;
      // Invert the percentage so 0% is at bottom, 100% at top
      percentage = ((rect.height - yPos) / rect.height) * 100;

      // Get color from canvas at clicked position
      const canvasX = Math.floor((rect.width / 2) * dpr); // Middle of the bar
      const canvasY = Math.floor(yPos * dpr);

      const imageData = this.ctx.getImageData(canvasX, canvasY, 1, 1);
      color = `rgb(${imageData.data[0]}, ${imageData.data[1]}, ${imageData.data[2]})`;
    } else {
      // Horizontal mode
      const xPos = event.clientX - rect.left;
      percentage = (xPos / rect.width) * 100;

      // Get color from canvas at clicked position
      const canvasX = Math.floor(xPos * dpr);
      const canvasY = Math.floor((rect.height / 2) * dpr); // Middle of the bar

      const imageData = this.ctx.getImageData(canvasX, canvasY, 1, 1);
      color = `rgb(${imageData.data[0]}, ${imageData.data[1]}, ${imageData.data[2]})`;
    }

    const clickEvent = new CustomEvent('color-selected', {
      detail: {
        percentage: Math.max(0, Math.min(100, percentage)).toFixed(2),
        color: color,
        orientation: this.#isVertical ? 'vertical' : 'horizontal'
      },
      bubbles: true,
      composed: true
    });

    this.dispatchEvent(clickEvent);
  }

  // Public method to check orientation
  get isVertical() {
    return this.#isVertical;
  }

  // Public methods to get/set dimensions
  get width() {
    return this.#width;
  }

  set width(val) {
    this.setAttribute('width', val);
  }

  get height() {
    return this.#height;
  }

  set height(val) {
    this.setAttribute('height', val);
  }
}

// Register the custom element
// customElements.define('gradient-bar', GradientBar);

// Example usage:
/*
// Horizontal gradient bar with custom dimensions
const gradientBarH = document.createElement('gradient-bar');
gradientBarH.setAttribute('width', '400px');
gradientBarH.setAttribute('height', '50px');
gradientBarH.setAttribute('gradient-stops', JSON.stringify([
  { percentage: 0, color: '#ff0000' },
  { percentage: 50, color: '#00ff00' },
  { percentage: 100, color: '#0000ff' }
]));

// Vertical gradient bar with custom dimensions
const gradientBarV = document.createElement('gradient-bar');
gradientBarV.setAttribute('vertical', '');
gradientBarV.setAttribute('width', '40px');
gradientBarV.setAttribute('height', '300px');
gradientBarV.setAttribute('gradient-stops', JSON.stringify([
  { percentage: 0, color: '#000000' },   // Level 1 (bottom)
  { percentage: 25, color: '#1a1a1a' },  // Level 2
  { percentage: 50, color: '#333333' },  // Level 3
  { percentage: 75, color: '#666666' },  // Level 4
  { percentage: 100, color: '#999999' }  // Level 5 (top)
]));

// Using percentage for responsive design
const gradientBarResponsive = document.createElement('gradient-bar');
gradientBarResponsive.setAttribute('width', '80%');
gradientBarResponsive.setAttribute('height', '40px');
gradientBarResponsive.setAttribute('gradient-stops', JSON.stringify([
  { percentage: 0, color: 'hsl(0, 100%, 50%)' },
  { percentage: 100, color: 'hsl(360, 100%, 50%)' }
]));

document.body.appendChild(gradientBarH);
document.body.appendChild(gradientBarV);
document.body.appendChild(gradientBarResponsive);
*/

// we must use the template element as it only requires: shadow.appendChild(template.content.cloneNode(true));
const template = document.createElement('template');
template.innerHTML = `
  <style>
    :host {
      display: block;
      position: relative;
      user-select: none;
    }

    .stop-container {
      position: absolute;
      width: 100%;
      height: 100%;
    }

    .color-stop {
      position: absolute;
      cursor: grab;
      transition: filter 0.2s;
    }

    /* Horizontal positioning */
    :host(:not([vertical])) .color-stop {
      transform: translateX(-50%);
        top: 50% !important;
      transform-origin: center;    }

    /* Vertical positioning */
    :host([vertical]) .color-stop {
      transform: translateY(50%);
      left: 50% !important; /* move arrow to the right */
      transform-origin: center;
    }

    .color-stop:hover {
      filter: brightness(1.1);
    }

    .color-stop.dragging {
      cursor: grabbing;
      filter: brightness(1.2) drop-shadow(0 2px 4px rgba(0,0,0,0.3));
    }

    .color-stop.selected {
      filter: brightness(1.3) drop-shadow(0 0 8px rgba(0,123,255,0.8));
      z-index: 10;
    }

    .color-stop svg {
      display: block;
      overflow: visible;
    }

    .triangle {
      stroke: rgba(0,0,0,0.3);
      stroke-width: 1;
    }

    .delete-zone {
      position: absolute;
      padding: 5px 10px;
      background: #ff4444;
      color: white;
      border-radius: 4px;
      font-size: 12px;
      opacity: 0;
      transition: opacity 0.2s;
      pointer-events: none;
    }

    /* Horizontal delete zone */
    :host(:not([vertical])) .delete-zone {
      bottom: -40px;
      left: 50%;
      transform: translateX(-50%);
    }

    /* Vertical delete zone */
    :host([vertical]) .delete-zone {
      left: -80px;
      top: 50%;
      transform: translateY(-50%);
      background: rgb(255 0 0 / 0.6);
    }

    .delete-zone.active {
      opacity: 1;
    }
  </style>
  <div class="stop-container"></div>
  <div class="delete-zone">Drop to delete</div>
`;

export class GradientStops extends HTMLElement {
  #colorStops = [];
  #draggedStop = null;
  #draggedIndex = -1;
  #selectedIndex = -1;
  #isVertical = false;
  #width = null;
  #height = null;
  #deleteDragDistance = 10;

  constructor() {
    super();
    const shadow = this.attachShadow({ mode: 'open' });
    shadow.appendChild(template.content.cloneNode(true));
    this.container = shadow.querySelector('.stop-container');
    this.deleteZone = shadow.querySelector('.delete-zone');

    // Add double-click to create new stop
    this.addEventListener('dblclick', this.onDoubleClick.bind(this));
  }

  static get observedAttributes() {
    return ['gradient-stops', 'vertical', 'width', 'height'];
  }

  connectedCallback() {
    this.updateDimensions();
    if (this.#colorStops.length > 0) {
      this.renderColorStops();
    }
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name === 'gradient-stops' && newValue) {
      try {
        this.#colorStops = JSON.parse(newValue);
        this.renderColorStops();
      } catch (e) {
        console.error('Invalid gradient-stops JSON:', e);
      }
    }

    if (name === 'vertical') {
      this.#isVertical = newValue !== null;
      this.updateDimensions();
      this.renderColorStops();
    }

    if (name === 'width') {
      this.#width = newValue;
      this.updateDimensions();
    }

    if (name === 'height') {
      this.#height = newValue;
      this.updateDimensions();
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

  get gradientStops() {
    return JSON.stringify(this.#colorStops);
  }

  set gradientStops(val) {
    this.setAttribute('gradient-stops', val);
  }

  renderColorStops() {
    this.container.innerHTML = '';

    // Create elements for each stop WITHOUT sorting
    // We'll use the original indices to maintain consistency
    this.#colorStops.forEach((stop, index) => {
      const stopElement = this.createStopElement(stop, index);
      this.container.appendChild(stopElement);
    });

    // Re-apply selection if there was one
    if (this.#selectedIndex >= 0 && this.#selectedIndex < this.#colorStops.length) {
      const selectedElement = this.container.querySelector(`[data-index="${this.#selectedIndex}"]`);
      if (selectedElement) {
        selectedElement.classList.add('selected');
      }
    }
  }

  createStopElement(stop, index) {
    const stopDiv = document.createElement('div');
    stopDiv.className = 'color-stop';

    if (this.#isVertical) {
      // For vertical: 0% is at bottom, 100% at top
      // We need to invert the percentage for positioning
      stopDiv.style.bottom = `${stop.percentage}%`;
      stopDiv.style.left = '50%';
    } else {
      // For horizontal: standard left positioning
      stopDiv.style.left = `${stop.percentage}%`;
    }

    stopDiv.setAttribute('data-index', index);
    stopDiv.setAttribute('data-percentage', stop.percentage);

    // Create SVG triangle
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', '20');
    svg.setAttribute('height', '25');
    svg.setAttribute('viewBox', '0 0 20 20');

    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.classList.add('triangle');

    // For vertical mode, point the triangle to the left (towards the gradient)
    // For horizontal mode, point up (towards the gradient)
    if (this.#isVertical) {
      // Triangle pointing left
      // WARNING: changing shape of the icon requires updating SVG above: svg.setAttribute('viewBox', '0 0 20 20');
      path.setAttribute('d', 'M 20 10 L 5 0 L 5 5 L 0 10 L 5 15 L 5 20 Z');
    } else {
      // Triangle pointing up (original)
      // WARNING: changing shape of the icon requires updating SVG above: svg.setAttribute('viewBox', '0 0 20 20');
      path.setAttribute('d', 'M 10 0 L 0 15 L 5 15 L 10 20 L 15 15 L 20 15 Z');
    }

    path.setAttribute('fill', stop.color);

    svg.appendChild(path);
    stopDiv.appendChild(svg);

    // Add click to select
    stopDiv.addEventListener('click', (e) => {
      if (!this.#draggedStop) {
        e.stopPropagation();
        this.selectStop(index);
      }
    });

    // Add drag functionality
    stopDiv.addEventListener('mousedown', (e) => this.onDragStart(e, stopDiv, index));

    // Add right-click to change color
    stopDiv.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      this.onColorChange(index);
    });

    return stopDiv;
  }

  selectStop(index) {
    this.#selectedIndex = index;

    // Remove all selected classes
    this.container.querySelectorAll('.color-stop').forEach(el => {
      el.classList.remove('selected');
    });

    // Add selected class to the clicked stop
    const selectedElement = this.container.querySelector(`[data-index="${index}"]`);
    if (selectedElement) {
      selectedElement.classList.add('selected');
    }

    // Emit selection event
    const event = new CustomEvent('stop-selected', {
      detail: {
        index: index,
        stop: this.#colorStops[index]
      },
      bubbles: true,
      composed: true
    });
    this.dispatchEvent(event);
  }

  onDragStart(e, element, index) {
    e.preventDefault();
    e.stopPropagation();

    if (e.button !== 0) return; // Only left mouse button

    this.#draggedStop = element;
    this.#draggedIndex = index;
    element.classList.add('dragging');

    // Select the stop being dragged
    this.selectStop(index);

    const rect = this.getBoundingClientRect();
    const startPercentage = this.#colorStops[index].percentage;

    let startPos, dragThreshold;
    if (this.#isVertical) {
      startPos = e.clientY;
      dragThreshold = 60; // Distance to right for deletion
    } else {
      startPos = e.clientX;
      dragThreshold = 60; // Distance below for deletion
    }

    const onDragMove = (moveEvent) => {
      let deltaPercentage;

      if (this.#isVertical) {
        // Vertical: invert the delta because 0% is at bottom
        const delta = startPos - moveEvent.clientY;
        deltaPercentage = (delta / rect.height) * 100;
        const newPercentage = Math.max(0, Math.min(100, startPercentage + deltaPercentage));

        element.style.bottom = `${newPercentage}%`;
        element.setAttribute('data-percentage', newPercentage);
        this.#colorStops[index].percentage = newPercentage;

      } else {
        // Horizontal
        const delta = moveEvent.clientX - startPos;
        deltaPercentage = (delta / rect.width) * 100;
        const newPercentage = Math.max(0, Math.min(100, startPercentage + deltaPercentage));

        element.style.left = `${newPercentage}%`;
        element.setAttribute('data-percentage', newPercentage);
        this.#colorStops[index].percentage = newPercentage;

      }
      // console.log(rect.left, moveEvent.clientX, rect.left - moveEvent.clientX)
      if (this.shouldDragDelete(this.#isVertical?rect.left - moveEvent.clientX:moveEvent.clientY - rect.bottom)) {
        this.deleteZone.classList.add('active');
      } else {
        this.deleteZone.classList.remove('active');
      }

      // Emit change event
      this.emitChangeEvent();
    };

    const onDragEnd = (endEvent) => {
      element.classList.remove('dragging');
      this.deleteZone.classList.remove('active');

      // Check if should delete
      const rect = this.getBoundingClientRect();
      if (this.shouldDragDelete(this.#isVertical?rect.left - endEvent.clientX:endEvent.clientY - rect.bottom)) {
        this.#colorStops.splice(index, 1);
        this.#selectedIndex = -1; // Clear selection
        this.renderColorStops();
        this.emitChangeEvent();
      }


      this.#draggedStop = null;
      this.#draggedIndex = -1;

      document.removeEventListener('mousemove', onDragMove);
      document.removeEventListener('mouseup', onDragEnd);
    };

    document.addEventListener('mousemove', onDragMove);
    document.addEventListener('mouseup', onDragEnd);
  }

  onDoubleClick(e) {
    // Don't create if clicking on existing stop
    if (e.target.closest('.color-stop')) return;

    const rect = this.getBoundingClientRect();
    let percentage;

    if (this.#isVertical) {
      // Vertical: 0% at bottom, 100% at top
      percentage = ((rect.height - (e.clientY - rect.top)) / rect.height) * 100;
    } else {
      // Horizontal
      percentage = ((e.clientX - rect.left) / rect.width) * 100;
    }

    // Interpolate color at this position
    const color = this.interpolateColor(percentage);

    const newStop = {
      percentage: Math.round(percentage * 100) / 100,
      color: color
    };

    this.#colorStops.push(newStop);

    // Select the newly created stop
    const newIndex = this.#colorStops.length - 1;
    this.renderColorStops();
    this.selectStop(newIndex);
    this.emitChangeEvent();
  }

  shouldDragDelete(distance){
    // console.log(distance)
    const moreThanTwoStops = this.#colorStops.length > 2;
    const reachedDeleteZone = distance > this.#deleteDragDistance;
    if (moreThanTwoStops && reachedDeleteZone) return true;
  }

  interpolateColor(percentage) {
    // Sort stops by percentage for interpolation
    const sorted = [...this.#colorStops].sort((a, b) => a.percentage - b.percentage);

    // Find surrounding stops
    let before = sorted[0];
    let after = sorted[sorted.length - 1];

    for (let i = 0; i < sorted.length - 1; i++) {
      if (sorted[i].percentage <= percentage && sorted[i + 1].percentage >= percentage) {
        before = sorted[i];
        after = sorted[i + 1];
        break;
      }
    }

    if (percentage <= sorted[0].percentage) return sorted[0].color;
    if (percentage >= sorted[sorted.length - 1].percentage) return sorted[sorted.length - 1].color;

    // Linear interpolation between colors
    const ratio = (percentage - before.percentage) / (after.percentage - before.percentage);
    return this.mixColors(before.color, after.color, ratio);
  }

  mixColors(color1, color2, ratio) {
    // Simple color mixing (works with hex and rgb)
    const c1 = this.parseColor(color1);
    const c2 = this.parseColor(color2);

    const r = Math.round(c1.r + (c2.r - c1.r) * ratio);
    const g = Math.round(c1.g + (c2.g - c1.g) * ratio);
    const b = Math.round(c1.b + (c2.b - c1.b) * ratio);

    return `rgb(${r}, ${g}, ${b})`;
  }

  parseColor(color) {
    // Handle hex colors
    if (color.startsWith('#')) {
      const hex = color.slice(1);
      let r, g, b;

      if (hex.length === 3) {
        // Handle 3-character hex
        r = parseInt(hex[0] + hex[0], 16);
        g = parseInt(hex[1] + hex[1], 16);
        b = parseInt(hex[2] + hex[2], 16);
      } else {
        // Handle 6-character hex
        r = parseInt(hex.substr(0, 2), 16);
        g = parseInt(hex.substr(2, 2), 16);
        b = parseInt(hex.substr(4, 2), 16);
      }

      return { r, g, b };
    }

    // Handle rgb colors
    const match = color.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
    if (match) {
      return {
        r: parseInt(match[1]),
        g: parseInt(match[2]),
        b: parseInt(match[3])
      };
    }

    return { r: 0, g: 0, b: 0 };
  }

  onColorChange(index) {
    const input = document.createElement('input');
    input.type = 'color';
    const currentColor = this.#colorStops[index].color;

    // Convert rgb to hex if needed
    if (currentColor.startsWith('rgb')) {
      const c = this.parseColor(currentColor);
      input.value = '#' +
        c.r.toString(16).padStart(2, '0') +
        c.g.toString(16).padStart(2, '0') +
        c.b.toString(16).padStart(2, '0');
    } else {
      input.value = currentColor;
    }

    input.addEventListener('change', (e) => {
      this.#colorStops[index].color = e.target.value;
      this.renderColorStops();
      this.selectStop(index); // Keep the stop selected after color change
      this.emitChangeEvent();
    });
    input.click();
  }

  emitChangeEvent() {
    const event = new CustomEvent('stops-changed', {
      detail: {
        stops: this.#colorStops,
        orientation: this.#isVertical ? 'vertical' : 'horizontal'
      },
      bubbles: true,
      composed: true
    });
    this.dispatchEvent(event);
  }

  // Public method to clear selection
  clearSelection() {
    this.#selectedIndex = -1;
    this.container.querySelectorAll('.color-stop').forEach(el => {
      el.classList.remove('selected');
    });
  }

  // Public method to get selected stop
  getSelectedStop() {
    if (this.#selectedIndex >= 0 && this.#selectedIndex < this.#colorStops.length) {
      return {
        index: this.#selectedIndex,
        stop: this.#colorStops[this.#selectedIndex]
      };
    }
    return null;
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
// customElements.define('gradient-stops', GradientStops);

// Example usage:
/*
// Horizontal gradient stops with custom dimensions
const gradientStopsH = document.createElement('gradient-stops');
gradientStopsH.setAttribute('width', '400px');
gradientStopsH.setAttribute('height', '40px');
gradientStopsH.setAttribute('gradient-stops', JSON.stringify([
  { percentage: 0, color: '#ff0000' },
  { percentage: 50, color: '#00ff00' },
  { percentage: 100, color: '#0000ff' }
]));

// Vertical gradient stops for level selector with custom dimensions
const gradientStopsV = document.createElement('gradient-stops');
gradientStopsV.setAttribute('vertical', '');
gradientStopsV.setAttribute('width', '40px');
gradientStopsV.setAttribute('height', '300px');
gradientStopsV.setAttribute('gradient-stops', JSON.stringify([
  { percentage: 0, color: '#000000' },   // Level 1 - darkest (bottom)
  { percentage: 25, color: '#1a1a1a' },  // Level 2
  { percentage: 50, color: '#333333' },  // Level 3
  { percentage: 75, color: '#666666' },  // Level 4
  { percentage: 100, color: '#999999' }  // Level 5 - brightest (top)
]));

// Responsive gradient stops using percentages
const gradientStopsResponsive = document.createElement('gradient-stops');
gradientStopsResponsive.setAttribute('width', '80%');
gradientStopsResponsive.setAttribute('height', '35px');
gradientStopsResponsive.setAttribute('gradient-stops', JSON.stringify([
  { percentage: 0, color: 'hsl(0, 100%, 50%)' },
  { percentage: 100, color: 'hsl(360, 100%, 50%)' }
]));

document.body.appendChild(gradientStopsH);
document.body.appendChild(gradientStopsV);
document.body.appendChild(gradientStopsResponsive);
*/

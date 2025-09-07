/**
 * Simple and minimal, lightweight implementation of a horizontal web component.
 *
 * @example
 *  <body>
 *   <horizontal-view>
 *   <section>
 *   <div class="card" style="width: 18rem; height: 15rem; border-radius: 8px; background-color: teal;">
 *   Example
 *   </div>
 *   </section>
 *   <section>
 *   <div class="card" style="width: 18rem; height: 15rem; border-radius: 8px; background-color: Aquamarine;">
 *   Example
 *   </div>
 *   </section>
 *   <section>
 *   <div class="card" style="width: 18rem; height: 15rem; border-radius: 8px; background-color: CadetBlue;">
 *   Example
 *   </div>
 *   </section>
 *   <section>
 *   <div class="card" style="width: 18rem; height: 15rem; border-radius: 8px; background-color: DarkCyan;">
 *   Example
 *   </div>
 *   </section>
 *   <section>
 *   <div class="card" style="width: 18rem; height: 15rem; border-radius: 8px; background-color: LightSeaGreen;">
 *   Example
 *   </div>
 *   </section>
 *   </horizontal-view>
 *  </body>
 */
const template = document.createElement('template');
template.innerHTML = `

  <style>
    :host {
      display: block;
      position: relative;
      width: 100%;
      max-width: 100%;
      container-type: inline-size; /* Enable container queries */
      background: var(--up1-backdrop);
    }

    .scroll-viewport {
      position: relative;
      width: 100%;
      max-width: 100%;
      overflow-x: auto;
      overflow-y: hidden;
      box-sizing: border-box;
    }

    .scroll-container {
      display: flex;
      padding: 3rem;
      gap: 10px;
      width: max-content; /* Key: let content determine width */
      box-sizing: border-box;
    }

    ::slotted(section),
    .scroll-item {
      flex: 0 0 auto !important;
      display: block !important;
      text-align: center;
    }

    /* Scrollbar styling */
    .scroll-viewport::-webkit-scrollbar {
      height: 12px;
    }
    .scroll-viewport::-webkit-scrollbar-track {
      background: #f1f1f1;
      border-radius: 6px;
    }
    .scroll-viewport::-webkit-scrollbar-thumb {
      background: #888;
      border-radius: 6px;
    }
    .scroll-viewport::-webkit-scrollbar-thumb:hover {
      background: #555;
    }
  </style>
  <div class="scroll-viewport">
    <div class="scroll-container"></div>
  </div>
`;

export class HorizontalView extends HTMLElement {
  constructor() {
    super();
    const shadow = this.attachShadow({ mode: "open" });
    shadow.appendChild(template.content.cloneNode(true));
    this.scrollViewport = shadow.querySelector('.scroll-viewport');
    this.scrollContainer = shadow.querySelector('.scroll-container');
    this.resizeObserver = null;
  }

  connectedCallback() {
    this.renderView();
    this.setupResizeObserver();
  }

  disconnectedCallback() {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
      this.resizeObserver = null;
    }
  }

  renderView() {
    const sections = this.querySelectorAll('section');

    if (sections.length === 0) {
      console.warn('HorizontalView: No sections found');
      return;
    }

    // Clear existing content
    this.scrollContainer.innerHTML = '';

    sections.forEach((scrollItem, index) => {
      const scrollItemId = `panel-${this.generateId()}-${index}`;

      // Clone the section to avoid moving original DOM
      const clonedSection = scrollItem.cloneNode(true);

      // Setup section
      clonedSection.classList.add('scroll-item');
      clonedSection.setAttribute('id', scrollItemId);
      clonedSection.setAttribute('tabindex', '0');

      if (index === 0) {
        clonedSection.classList.add('active');
      }

      this.scrollContainer.appendChild(clonedSection);

      // Hide original section
      scrollItem.style.display = 'none';
    });
  }

  setupResizeObserver() {
    // Use ResizeObserver to ensure proper sizing
    this.resizeObserver = new ResizeObserver(entries => {
      for (let entry of entries) {
        // Force a reflow if needed
        const viewportWidth = this.scrollViewport.clientWidth;
        const contentWidth = this.scrollContainer.scrollWidth;

        // Log for debugging
        console.log(`Viewport: ${viewportWidth}px, Content: ${contentWidth}px`);

        // Ensure scrollbar appears when content exceeds viewport
        if (contentWidth > viewportWidth) {
          this.scrollViewport.style.overflowX = 'auto';
        } else {
          this.scrollViewport.style.overflowX = 'hidden';
        }
      }
    });

    // Observe both the component and the viewport
    this.resizeObserver.observe(this);
    this.resizeObserver.observe(this.scrollViewport);
  }

  // Generate unique ID for accessibility
  generateId() {
    return Math.random().toString(36).substring(2, 9);
  }
}

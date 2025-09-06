/**
 * Simple and minimal, lightweight implementation of a tab-panel web component.
 *
 * @example
 * <tab-panel>
 *   <section data-title="Tab Name">
 *     tab content
 *   </section>
 *   <section data-title="Second Tab Name">
 *     tab content
 *   </section>
 * </tab-panel>
 */

const template = document.createElement('template');
template.innerHTML = `
  <style>
    :host {
      display: block;
    }

    nav {
      display: flex;
      gap: 0.5rem;
      border-bottom: 2px solid var(--l2-br);
      margin-bottom: 1rem;
    }

    .nav-link {
      padding: 0.5rem 1rem;
      cursor: pointer;
      text-decoration: none;
      color: #6c757d;
      border-bottom: 2px solid transparent;
      margin-bottom: -2px;
      transition: color 0.2s, border-color 0.2s;
      user-select: none;
    }

    .nav-link:hover {
      color: #495057;
    }

    .nav-link.active {
      font-weight: 600;
      color: #007bff;
      border-bottom-color: #007bff;
    }

    .tab-content {
      padding: 1rem;
      border: 1px solid #dee2e6;
      border-radius: 0.25rem;
      background: var(--l2-bg);
      border-color: var(--l2-br);

    }

    .tab-pane {
      display: none;
    }

    .tab-pane.active {
      display: block;
    }

    /* Accessibility: Focus styles */
    .nav-link:focus-visible {
      outline: 2px solid #007bff;
      outline-offset: 2px;
      border-radius: 2px;
    }
  </style>
  <nav class="nav" role="tablist"></nav>
  <div class="tab-content"></div>
`;

export class TabPanel extends HTMLElement {
  constructor() {
    super();
    const shadow = this.attachShadow({ mode: "open" });
    shadow.appendChild(template.content.cloneNode(true));
    this.nav = shadow.querySelector('.nav');
    this.tabContent = shadow.querySelector('.tab-content');
    this.tabs = [];
  }

  connectedCallback() {
    this.renderTabs();
    this.addEventListeners();
  }

  renderTabs() {
    const sections = this.querySelectorAll('section[data-title]');

    if (sections.length === 0) {
      console.warn('TabPanel: No sections with data-title attribute found');
      return;
    }

    sections.forEach((section, index) => {
      const title = section.getAttribute('data-title') || `Tab ${index + 1}`;
      const tabId = `tab-${this.generateId()}-${index}`;
      const panelId = `panel-${this.generateId()}-${index}`;

      // Create nav link
      const navLink = document.createElement('a');
      navLink.className = 'nav-link';
      navLink.textContent = title;
      navLink.dataset.index = index;
      navLink.setAttribute('role', 'tab');
      navLink.setAttribute('id', tabId);
      navLink.setAttribute('aria-controls', panelId);
      navLink.setAttribute('aria-selected', 'false');
      navLink.setAttribute('tabindex', '-1');

      // Set first tab as active
      if (index === 0) {
        navLink.classList.add('active');
        navLink.setAttribute('aria-selected', 'true');
        navLink.setAttribute('tabindex', '0');
      }

      this.nav.appendChild(navLink);

      // Setup section
      section.classList.add('tab-pane');
      section.setAttribute('role', 'tabpanel');
      section.setAttribute('id', panelId);
      section.setAttribute('aria-labelledby', tabId);
      section.setAttribute('tabindex', '0');

      if (index === 0) {
        section.classList.add('active');
      }

      this.tabContent.appendChild(section);
      this.tabs.push({ link: navLink, panel: section });
    });
  }

  addEventListeners() {
    // Click event
    this.nav.addEventListener('click', (event) => {
      if (event.target.classList.contains('nav-link')) {
        event.preventDefault();
        this.selectTab(parseInt(event.target.dataset.index));
      }
    });

    // Keyboard navigation
    this.nav.addEventListener('keydown', (event) => {
      if (!event.target.classList.contains('nav-link')) return;

      const currentIndex = parseInt(event.target.dataset.index);
      let newIndex = currentIndex;

      switch (event.key) {
        case 'ArrowLeft':
        case 'ArrowUp':
          event.preventDefault();
          newIndex = currentIndex > 0 ? currentIndex - 1 : this.tabs.length - 1;
          break;
        case 'ArrowRight':
        case 'ArrowDown':
          event.preventDefault();
          newIndex = currentIndex < this.tabs.length - 1 ? currentIndex + 1 : 0;
          break;
        case 'Home':
          event.preventDefault();
          newIndex = 0;
          break;
        case 'End':
          event.preventDefault();
          newIndex = this.tabs.length - 1;
          break;
        case 'Enter':
        case ' ':
          event.preventDefault();
          this.selectTab(currentIndex);
          return;
        default:
          return;
      }

      this.selectTab(newIndex);
      this.tabs[newIndex].link.focus();
    });
  }

  selectTab(index) {
    if (index < 0 || index >= this.tabs.length) return;

    // Update all tabs
    this.tabs.forEach((tab, i) => {
      const isActive = i === index;

      // Update link
      tab.link.classList.toggle('active', isActive);
      tab.link.setAttribute('aria-selected', isActive ? 'true' : 'false');
      tab.link.setAttribute('tabindex', isActive ? '0' : '-1');

      // Update panel
      tab.panel.classList.toggle('active', isActive);
    });

    // Dispatch custom event
    this.dispatchEvent(new CustomEvent('tab-change', {
      detail: { index, tab: this.tabs[index] },
      bubbles: true
    }));
  }

  // Generate unique ID for accessibility
  generateId() {
    return Math.random().toString(36).substring(2, 9);
  }

  // Public API methods
  getActiveTab() {
    return this.tabs.findIndex(tab => tab.link.classList.contains('active'));
  }

  setActiveTab(index) {
    this.selectTab(index);
  }
}

// Register the custom element

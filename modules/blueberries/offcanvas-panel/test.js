import { OffcanvasComponent } from './offcanvas-component.js';

describe('OffcanvasComponent', () => {
  let offcanvas, toggleBtn, closeBtn;

  beforeEach(() => {
    document.body.innerHTML = `
      <offcanvas-component id="testcanvas">
        <div slot="header">
          Header <button id="close-btn" data-dismiss="offcanvas">×</button>
        </div>
        <p>Test content</p>
        <div slot="footer">Footer</div>
      </offcanvas-component>
      <button id="toggle-btn" data-offcanvas-toggle data-offcanvas-target="#testcanvas">Toggle</button>
    `;
    offcanvas = document.getElementById('testcanvas');
    toggleBtn = document.getElementById('toggle-btn');
    closeBtn = document.getElementById('close-btn');
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  test('should be hidden by default', () => {
    expect(offcanvas.open).toBe(false);
    expect(offcanvas.hasAttribute('open')).toBe(false);
  });

  test('show() adds open attribute and shows panel', () => {
    offcanvas.show();
    expect(offcanvas.open).toBe(true);
    expect(offcanvas.hasAttribute('open')).toBe(true);
  });

  test('hide() removes open attribute and hides panel', () => {
    offcanvas.show();
    offcanvas.hide();
    expect(offcanvas.open).toBe(false);
    expect(offcanvas.hasAttribute('open')).toBe(false);
  });

  test('toggle() toggles visibility', () => {
    offcanvas.toggle();
    expect(offcanvas.open).toBe(true);
    offcanvas.toggle();
    expect(offcanvas.open).toBe(false);
  });

  test('fires show/shown events on open', () => {
    const show = jest.fn();
    const shown = jest.fn();
    offcanvas.addEventListener('show', show);
    offcanvas.addEventListener('shown', shown);
    offcanvas.show();
    expect(show).toHaveBeenCalledTimes(1);
    expect(shown).toHaveBeenCalledTimes(1);
  });

  test('fires hide/hidden events on close', () => {
    const hide = jest.fn();
    const hidden = jest.fn();
    offcanvas.show();
    offcanvas.addEventListener('hide', hide);
    offcanvas.addEventListener('hidden', hidden);
    offcanvas.hide();
    expect(hide).toHaveBeenCalledTimes(1);
    expect(hidden).toHaveBeenCalledTimes(1);
  });

  test('data-offcanvas-toggle toggles panel', () => {
    toggleBtn.click();
    expect(offcanvas.open).toBe(true);
    toggleBtn.click();
    expect(offcanvas.open).toBe(false);
  });

  test('data-dismiss="offcanvas" closes panel', () => {
    offcanvas.show();
    closeBtn.click();
    expect(offcanvas.open).toBe(false);
  });

  test('backdrop click closes panel', () => {
    offcanvas.show();
    const backdrop = offcanvas.shadowRoot.getElementById('backdrop');
    backdrop.click();
    expect(offcanvas.open).toBe(false);
  });

  test('Escape key closes panel', () => {
    offcanvas.show();
    const event = new KeyboardEvent('keydown', { key: 'Escape' });
    offcanvas.dispatchEvent(event);
    expect(offcanvas.open).toBe(false);
  });

  test('focus is trapped inside panel', () => {
    offcanvas.show();
    const focusables = offcanvas.shadowRoot.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"]):not([disabled])'
    );
    // Tab from last focusable cycles to first
    focusables[focusables.length - 1].focus();
    const tabEvent = new KeyboardEvent('keydown', { key: 'Tab' });
    offcanvas.dispatchEvent(tabEvent);
    expect(document.activeElement === focusables[0] || offcanvas.shadowRoot.activeElement === focusables[0]).toBe(true);
  });

  test('only one offcanvas can be open at a time', () => {
    document.body.innerHTML += `
      <offcanvas-component id="second"></offcanvas-component>
    `;
    const second = document.getElementById('second');
    offcanvas.show();
    second.show();
    expect(offcanvas.open).toBe(false);
    expect(second.open).toBe(true);
  });

  test('body scrolling is locked when open', () => {
    offcanvas.show();
    expect(document.body.style.overflow).toBe('hidden');
    offcanvas.hide();
    expect(document.body.style.overflow).toBe('');
  });

  test('responsive: hides on window resize if not fixed', () => {
    offcanvas.show();
    // Simulate not fixed
    Object.defineProperty(window, 'getComputedStyle', {
      value: () => ({ position: 'absolute' }),
      configurable: true,
    });
    window.dispatchEvent(new Event('resize'));
    expect(offcanvas.open).toBe(false);
  });
});

# `<offcanvas-panel>`
_A modern, accessible, and extensible sliding panel web component_

```html

<page-cover dismissive></page-cover>

<offcanvas-panel id="sidebar" open esc focus scroll>
  <div slot="header" style="display: flex;">
    <span style="flex-grow: 1;">Sidebar</span>
    <button data-dismiss="offcanvas">×</button>
  </div>
  <p>Content inside the offcanvas.</p>
  <div slot="footer">
    <button data-dismiss="offcanvas">Close</button>
  </div>
</offcanvas-panel>

<!-- Toggle button -->
<button data-control="#sidebar">Open Sidebar</button>
```
---

## Overview

`<offcanvas-component>` is a custom HTML element that provides an accessible, animated sidebar or drawer. It is fully declarative and imperative, supports modular slots, custom events, keyboard/focus management, and is designed for modern web apps.

This documentation covers the **12 core features** and best-practice usage scenarios.

---

## 1. Declarative Show/Hide

- **Declarative:** Use the `open` attribute to show/hide the panel.
- **Imperative:** Call `.show()`, `.hide()`, or `.toggle()` methods.

```html
<offcanvas-component open>
  <p>Visible by default</p>
</offcanvas-component>
```

```js
const panel = document.querySelector('offcanvas-component');
panel.show();    // Opens
panel.hide();    // Closes
panel.toggle();  // Toggles
```

---

## 2. Accessibility

- Uses `role="dialog"`, `aria-modal="true"`, and manages `aria-hidden`.
- Keyboard navigation: Escape closes, focus is trapped inside.
- Focus is restored to the triggering element when closed.

```html
<offcanvas-component>
  <button slot="header" data-dismiss="offcanvas">×</button>
  <p>Accessible content</p>
</offcanvas-component>
```

---

## 3. Backdrop Management

- A backdrop is automatically added/removed when the panel is open/closed.
- Clicking the backdrop closes the panel (unless `data-backdrop-static` is set).

```html
<offcanvas-component></offcanvas-component>
<!-- Backdrop is handled automatically. -->
```

---

## 4. Scroll and Body Management

- Prevents background scrolling when open by setting `body { overflow: hidden; }`.
- Restores scroll when closed.

---

## 5. Event Lifecycle and Custom Events

Fires custom events you can listen to:

- `show`, `shown`, `hide`, `hidden`

```js
panel.addEventListener('show',  () => console.log('Opening'));
panel.addEventListener('shown', () => console.log('Opened'));
panel.addEventListener('hide',  () => console.log('Closing'));
panel.addEventListener('hidden',() => console.log('Closed'));
```

---

## 6. Data API and Declarative Markup

- Toggle via `[data-offcanvas-toggle]` with a target selector.

```html
<button data-offcanvas-toggle data-offcanvas-target="#sidebar">Open Sidebar</button>
<offcanvas-component id="sidebar"></offcanvas-component>
```

---

## 7. Animation and Transitions

- Smooth slide-in/out with CSS transitions.
- Easily customizable via CSS variables:

```css
offcanvas-component {
  --offcanvas-width: 400px;
  --offcanvas-bg: #222;
  --offcanvas-transition: transform 0.5s cubic-bezier(.4,0,.2,1);
}
```

---

## 8. Multi-instance Safety

- Only one offcanvas can be open at a time; opening another automatically closes the previous.

```html
<offcanvas-component id="left"></offcanvas-component>
<offcanvas-component id="right"></offcanvas-component>
<!-- Only one will be open at any moment. -->
```

---

## 9. Responsiveness

- Automatically closes when the panel is no longer `position: fixed` (e.g., on large screens or orientation changes).

---

## 10. Dismiss Triggers

- Any element inside with `[data-dismiss="offcanvas"]` will close the panel when clicked.

```html
<button data-dismiss="offcanvas">Close</button>
```

---

## 11. No jQuery Required

- 100% web standard API and DOM events.
- Works in all modern browsers, no dependencies.

---

## 12. Modular, Extensible Architecture

- Uses Shadow DOM for encapsulation.
- Slots for `header`, `footer`, and main content.
- Customizable via CSS variables and `::part` selectors.

```html
<offcanvas-component>
  <div slot="header">My Sidebar <button data-dismiss="offcanvas">×</button></div>
  <p>Main content here</p>
  <div slot="footer">Footer info</div>
</offcanvas-component>
```

---

## Usage Scenarios

### Basic Sidebar

```html
<offcanvas-component id="mainSidebar">
  <div slot="header">Menu <button data-dismiss="offcanvas">Close</button></div>
  <ul>
    <li>Item 1</li><li>Item 2</li>
  </ul>
</offcanvas-component>

<button data-offcanvas-toggle data-offcanvas-target="#mainSidebar">Open</button>
```

### Programmatic Control

```js
const sidebar = document.querySelector('#mainSidebar');
sidebar.show();
// ...later
sidebar.hide();
```

### Customizing Appearance

```css
offcanvas-component {
  --offcanvas-width: 350px;
  --offcanvas-bg: #333;
  color: #fff;
}
```

### Multiple Panels

```html
<offcanvas-component id="leftPanel"></offcanvas-component>
<offcanvas-component id="rightPanel"></offcanvas-component>
<button data-offcanvas-toggle data-offcanvas-target="#leftPanel">Left</button>
<button data-offcanvas-toggle data-offcanvas-target="#rightPanel">Right</button>
```

---

## Advanced: Slots & Shadow Parts

- Use `<slot name="header">` and `<slot name="footer">` for custom header/footer.
- Style with `::part(backdrop)` or `::part(dismiss)` for advanced theming.

```css
offcanvas-component::part(backdrop) { background: rgba(0,0,0,0.9); }
```

---

## Accessibility & Best Practices

- Always provide a keyboard-accessible close button.
- Use unique IDs for each offcanvas when using the data API.
- Listen for custom events to coordinate UI state.

---

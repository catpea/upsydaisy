# ContextRequestEvent

The **`ContextRequestEvent`** is a custom event that allows a deeply nested Web Component to request a shared dependency (called *context*) from one of its ancestor elements.

Think of it as a way for a child to “ask up the family tree” without having to know exactly who its parent is. This makes components more **reusable** and **decoupled**.

---

## Why use this pattern?

When building applications with Web Components, you often want to give all components access to some **shared state** or **services**. For example:

* The application container instance (`<web-application>`)
* A router or navigation system
* A theme or localization object

Instead of passing these objects manually down through every layer of components (called *prop drilling*), a child component can simply dispatch a `ContextRequestEvent`. An ancestor higher in the DOM tree listens and responds by providing the requested context.

---

## How it works

1. **The child asks for context** by dispatching a `ContextRequestEvent`.
2. **The ancestor provides context** by listening for `context-request` events and responding.
3. **The child receives the context** via the callback passed into the event.

This pattern makes context access **implicit**: children don’t need to know which ancestor provides it, only that *someone will*.

---

## Example: Application Container

The application container listens for `context-request` events and provides itself (`this`) as the context.

```js
export class WebApplication extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });

    this.addEventListener("context-request", event => {
      event.stopImmediatePropagation();
      event.callback(this); // provide the application instance
    });
  }
}
customElements.define("web-application", WebApplication);
```

---

## Example: ContextRequestEvent Class

The event itself is just a custom `Event` with a `callback` function property.

```js
export class ContextRequestEvent extends Event {
  constructor(callback) {
    super("context-request", {
      bubbles: true,    // allows the event to bubble up the DOM
      composed: true    // crosses shadow DOM boundaries
    });

    this.callback = callback;
  }
}
```

---

## Example: Child Component Requesting Context

A child component that needs the application instance:

```js
import { ContextRequestEvent } from "./ContextRequestEvent.js";

export class MyWidget extends HTMLElement {
  connectedCallback() {
    this.dispatchEvent(
      new ContextRequestEvent(app => this.contextCallback(app))
    );
  }

  contextCallback(application) {
    this.application = application;
    console.log("Got context:", application);
  }
}
customElements.define("my-widget", MyWidget);
```

---

## Step-by-Step Flow

1. `<my-widget>` connects to the DOM.
2. It dispatches a `ContextRequestEvent`.
3. The event bubbles up the DOM tree.
4. `<web-application>` listens for it, stops further propagation, and calls the event’s `callback`, passing in itself.
5. `<my-widget>` receives the application instance and stores it.

---

## Benefits

* **No prop drilling**: you don’t need to pass context through every intermediate component.
* **Loose coupling**: children don’t need to know which ancestor provides the context.
* **Shadow DOM safe**: works across shadow DOM boundaries with `composed: true`.
* **Scalable**: can be extended to support multiple kinds of context (e.g., by adding a `contextKey` property).

---

## When to use

* Shared application container
* Router / navigation manager
* Theme or style manager
* Internationalization / localization service
* Any “singleton” dependency needed across the component tree

---

🔑 **In short:**
The `ContextRequestEvent` is a clean way for Web Components to **ask for dependencies** without hardcoding their parent relationships, making your application architecture simpler and more flexible.

---

## Complete ContextRequestEvent Source

```js
/**
 * A custom event used by child components to request a dependency
 * (context) from an ancestor in the DOM tree.
 *
 * Usage:
 *   this.dispatchEvent(new ContextRequestEvent(app => this.useApp(app)));
 */
export class ContextRequestEvent extends Event {
  /**
   * @param {Function} callback - A function to call with the resolved context.
   *                              Receives the requested context object.
   * @param {Object} [options] - Event options.
   */
  constructor(callback, options = {}) {
    super('context-request', {
      bubbles: true,
      composed: true, // allows passing through shadow DOM boundaries
      ...options,
    });

    if (typeof callback !== 'function') {
      throw new TypeError('ContextRequestEvent requires a callback function.');
    }

    /** @type {Function} */
    this.callback = callback;
  }
}

```

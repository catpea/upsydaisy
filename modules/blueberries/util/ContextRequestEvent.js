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

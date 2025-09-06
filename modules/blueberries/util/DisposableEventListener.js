export class DisposableEventListener {
    constructor(element, event, handler, options) {
        this.element = element;
        this.event = event;
        this.handler = handler;
        this.options = options;
        this.isDisposed = false;

        // Add the event listener
        this.element.addEventListener(this.event, this.handler, this.options);
    }

    dispose() {
        if (this.isDisposed) {
            console.warn("Event listener already disposed.");
            return;
        }
        // Remove the event listener
        this.element.removeEventListener(this.event, this.handler, this.options);
        this.isDisposed = true;
        console.log(`Event listener for ${this.event} disposed.`);
    }
}

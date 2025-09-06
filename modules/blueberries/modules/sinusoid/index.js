export class Signal {
  #id;
  #value;
  #subscribers;
  #disposables;
  #onRead;
  #schedule;

  constructor(value, config) {
    const defaults = { label: "unlabeled", schedule: false, onRead: false };

    const options = Object.assign(defaults, config);

    this.#id = options.id ?? ( (typeof crypto !== "undefined" && typeof crypto.randomUUID == "function") ? crypto.randomUUID() : Math.random().toString(36).substr(2));
    this.label = options.label;
    this.#schedule = options.schedule; // scheduler support
    this.#onRead = options.onRead; // scheduler support
    this.#value = value;
    this.#subscribers = new Set();
    this.#disposables = new Set();
    this.readonly = () => ({ get value() { return this.value; } }); // Expose signals only as read-only to consumers when mutation is not allowed.

  }
  get id() {
    return this.#id;
  }

  // Support for "Untracked" Reads -  Sometimes you want to read a signal’s value without registering a dependency.
  peek() {
    return this.#value;
  }
  get value() {
    if (this.#onRead) this.#onRead(this);
    return this.#value;
  }

  set value(newValue) {
    if (Object.is(newValue, this.#value)) return; // IMPORTANT FEATURE: if value is the same, exit early, don't disturb if you don't need to
    this.#value = newValue;
    this.notify(); // all observers
  }

  subscribe(subscriber, autorun = true) {
    if (typeof subscriber != "function") throw new Error("Subscriber must be a function");
    if (autorun && this.#value != null) subscriber(this.#value); // IMPORTANT FEATURE: instant notification (initialization on subscribe), but don't notify on null/undefined, predicate functions will look simpler, less error prone
    this.#subscribers.add(subscriber);
    return () => this.unsubscribe(subscriber); // IMPORTANT FEATURE: return unsubscribe function, execute this to stop getting notifications.
  }

  unsubscribe(subscriber) {
    this.#subscribers.delete(subscriber);
  }

  // Scheduling
  #scheduleQueue = new Set();
  #schedulePending = false;

  scheduler(subscriber) { // unfortunately untested, sorry, no time
    this.#scheduleQueue.add(subscriber);
    if (!this.#schedulePending) {
      this.#schedulePending = true;
      queueMicrotask(() => {
        for (const f of this.#scheduleQueue) f(this.#value);
        this.#scheduleQueue.clear();
        this.#schedulePending = false;
      });
    }
  }

  notify() {
    if (this.#schedule) {
      for (const subscriber of this.#subscribers) this.scheduler(subscriber);
    } else {
      for (const subscriber of this.#subscribers) subscriber(this.#value);
    }
  }

  terminate() {
    // shutdown procedure
    this.#subscribers.clear(); // destroy subscribers
    this.#disposables.forEach((disposable) => disposable());
    this.#disposables.clear(); // execute and clear disposables
  }

  // add related trash that makes sense to clean when the signal is shutdown
  addDisposable(...input) {
    [input].flat(Infinity).forEach((disposable) => this.#disposables.add(disposable));
  }

  static filter(parent, test) {
    const child = new Signal();
    const subscription = parent.subscribe((v) => { if (test(v)) { child.value = v; } });
    child.addDisposable(subscription);
    return child;
  }

  static map(parent, map) {
    const child = new Signal();
    const subscription = parent.subscribe((v) => (child.value = map(v)));
    child.addDisposable(subscription);
    return child;
  }

  static combineLatest(...parents) {
    const child = new Signal();
    const updateCombinedValue = () => {
      const values = [...parents.map((signal) => signal.value)];
      const nullish = values.some((value) => value == null);
      if (!nullish) child.value = values;
    };
    const subscriptions = parents.map((signal) => signal.subscribe(updateCombinedValue));
    child.addDisposable(subscriptions);
    return child;
  }

// debounce: Creates a debounced function that delays invoking func until after wait milliseconds have elapsed since the last time the debounced function was invoked.
  static debounce(parent, wait) {
    const child = new Signal();
    let timeoutId = null;

    const subscription = parent.subscribe((v) => {
      if (timeoutId !== null) {
        clearTimeout(timeoutId);
      }
      timeoutId = setTimeout(() => {
        child.value = v;
        timeoutId = null;
      }, wait);
    });

    child.addDisposable(subscription);
    child.addDisposable(() => {
      if (timeoutId !== null) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }
    });

    return child;
  }


// defer: Defers invoking the func until the current call stack has cleared.

  static defer(parent) {
    const child = new Signal();

    const subscription = parent.subscribe((v) => {
      setTimeout(() => {
        child.value = v;
      }, 0);
    });

    child.addDisposable(subscription);
    return child;
  }

// throttle: Creates a throttled function that only invokes func at most once per every wait milliseconds.
  static throttle(parent, wait) {
    const child = new Signal();
    let lastCallTime = 0;
    let timeoutId = null;

    const subscription = parent.subscribe((v) => {
      const now = Date.now();
      const timeSinceLastCall = now - lastCallTime;

      if (timeSinceLastCall >= wait) {
        // Execute immediately
        child.value = v;
        lastCallTime = now;
      } else {
        // Schedule execution for the remaining time
        if (timeoutId !== null) {
          clearTimeout(timeoutId);
        }
        timeoutId = setTimeout(() => {
          child.value = v;
          lastCallTime = Date.now();
          timeoutId = null;
        }, wait - timeSinceLastCall);
      }
    });

    child.addDisposable(subscription);
    child.addDisposable(() => {
      if (timeoutId !== null) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }
    });

    return child;
  }





  [Symbol.toPrimitive](hint) {
    if (hint === "string") {
      return String(this.value);
    } else if (hint === "number") {
      return Number(this.value);
    }
    return this.value; // default case
  }
}

export class DisposableSinusoidalListener {
  #unsubscribe;

  constructor( signal, handler, options ) {
    this.signal = signal;
    this.handler = handler;
    this.options = options;
    this.isDisposed = false;

    // Add the listener
    this.#unsubscribe = this.signal.subscribe(this.#listener.bind(this));
  }

  #listener(v) {
    this.handler(v);
  }

  dispose() {
    if (this.isDisposed) {
      console.warn("Event listener already disposed.");
      return;
    }
    // Remove the event listener
    this.#unsubscribe();
    this.isDisposed = true;
    console.log(`Event listener for ${this.event} disposed.`);
  }
}

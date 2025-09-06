let finalizationRegistry;
if (typeof FinalizationRegistry !== "undefined") {
  finalizationRegistry = new FinalizationRegistry((heldValue) => {
    console.info('FinalizationRegistry executed heldValue')
    heldValue();
  });
}



const effectStack = [];

// Dependency tracking stack for nested effects
class Effect {
  #fn; // function to execute
  #dependencies; // signals involved in the effect, pruned by #operationals
  #operationals; // signals active i this run
  #unsubscribes; // unsubscriptions of #dependencies executed by pruning as dictaded by #operationals
  #running = false; // Infinite Recursion / Effect Reentrancy protection - If an effect triggers itself (directly or indirectly), it can cause a stack overflow or infinite loop.

  constructor(fn) {
    this.#dependencies = new Set();
    this.#operationals = new Set();
    this.#unsubscribes = new Map();

    this.#fn = fn;

    this.pending = false;
    this.queue = new Set();
    this.schedule(this.run);

  }


   schedule(fn, cb) {
    if(this.queue.has(fn)) console.info('skip!')
    this.queue.add(fn);

    if (!this.pending) {
      this.pending = true;
      queueMicrotask(() => {
        for (const f of this.queue) f.bind(this)();
        this.queue.clear();
        this.pending = false;
      });
    }
  }

  addDependency(signal){
    this.#operationals.add(signal); // NOTE: this line states that the signal is used in the current run, current run means something has caused the effect to re-*run*
    if (!this.#dependencies.has(signal)) {
      const unsubscribe = signal.subscribe((v) => this.schedule(this.run) , false); // whenever the value of the signal changes, schedule the effect to re-run
      /* ensure */ if(!this.#unsubscribes.has(signal)) this.#unsubscribes.set(signal, new Set());
      this.#unsubscribes.get(signal).add(unsubscribe);
      this.#dependencies.add(signal);
    }
  }

  async run() {

    if (this.#running) return console.error('protect against recursion');
    this.#running = true;
    this.#operationals.clear(); // we will now clear operationals, and re-dicvover what signals will be read during this operation, Signal taps into active effect for this.


    try {
      effectStack.push(this);
      await this.#fn();
    }catch(e){
      console.error(e)
    } finally {
      effectStack.pop();
      this.#running = false;
      this.removeUnusedDependencies();
    }

    // console.log('RESET! #reclaimables POST', this.#operationals.size)
    // if(this.#operationals.size != 3) console.error('must be 3');
  }


  removeUnusedDependencies() {
    this.#unsubscribes.forEach((unsubscribesSet, signal)=>{
      if(!this.#operationals.has(signal)){
        this.#unsubscribes.get(signal).forEach(bye=>bye());
        this.#unsubscribes.get(signal).clear();
        this.#dependencies.delete(signal);
      }
    });
  }

  terminate() {
    this.removeUnusedDependencies();
    this.#fn = undefined;
  }
}

// Scheduling

let pending = false;
const queue = new Set();

function schedule(fn) {
  queue.add(fn);
  if (!pending) {
    pending = true;
    queueMicrotask(() => {
      for (const f of queue) f();
      queue.clear();
      pending = false;
    });
  }
}

export class Signal {
  #id;
  #value;
  #subscribers;
  #disposables;

  constructor(value, { id, label, schedule } = { label: "unlabeled", schedule: false }) {
    this.#id = id ?? (typeof crypto !== "undefined" ? crypto.randomUUID() : Math.random().toString(36).substr(2));
    this.schedule = schedule; // scheduler support
    this.#value = value;
    this.#subscribers = new Set();
    this.#disposables = new Set();
    this.readonly = () => ({ get value() { return this.value; } }); // Expose signals only as read-only to consumers when mutation is not allowed.

    if (finalizationRegistry) finalizationRegistry.register(this, () => this.terminate());

  }
  get id() {
    return this.#id;
  }



  // Support for "Untracked" Reads -  Sometimes you want to read a signal’s value without registering a dependency.
  peek() {
    return this.#value;
  }
  get value() {

    ////////////// DEPENDENCY ///////////
    const currentEffect = effectStack[effectStack.length - 1];
    // when this signal changes, the currentEffect function will be re-ran
    if (currentEffect)  currentEffect.addDependency(this);
    ///////////// DEPENDENCY ///////////

    return this.#value;
  }

  set value(newValue) {
    if (Object.is(newValue, this.#value)) return; // IMPORTANT FEATURE: if value is the same, exit early, don't disturb if you don't need to
    this.#value = newValue;
    this.notify(); // all observers
  }

  subscribe(subscriber, autorun = true) {
    if (typeof subscriber != "function") throw new Error("Subscriber must be a function");
    if (autorun && (this.#value != null)) subscriber(this.#value); // IMPORTANT FEATURE: instant notification (initialization on subscribe), but don't notify on null/undefined, predicate functions will look simpler, less error prone
    this.#subscribers.add(subscriber);
    return () => this.unsubscribe(subscriber); // IMPORTANT FEATURE: return unsubscribe function, execute this to stop getting notifications.
  }

  unsubscribe(subscriber) {
    this.#subscribers.delete(subscriber);
  }

  notify() {
    if(this.schedule){
      for (const subscriber of this.#subscribers) schedule(() => subscriber(this.#value));
    }else{
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

  [Symbol.toPrimitive](hint) {
    if (hint === "string") {
      return String(this.value);
    } else if (hint === "number") {
      return Number(this.value);
    }
    return this.value; // default case
  }
}

// Effect implementation with nested support - Run code when dependencies change (side effects)
export function effect(fn) {
  return new Effect(fn);
}

// Create a value that tracks dependencies
export function derived(fn) {
  const signal = new Signal(fn());
  const myEffect = effect(() =>  signal.value = fn());
  signal.addDisposable(() => myEffect.terminate());
  return signal;
}

// Web Functions //

export function fromEvent(el, eventType, options = {}, valueAccessor = e => e.target.value) {
  const child = new Signal();
  const handler = (event) => (child.value = valueAccessor(event));
  el.addEventListener(eventType, handler, options);
  child.addDisposable(() => el.removeEventListener(eventType, handler, options));
  return child;
}

export function fromInput(el, eventType, options = {}) {
  const child = new Signal(el.value); // from input initializes by reading the .value (from event does not do that)
  const handler = (event) => (child.value = event.target.value);
  el.addEventListener(eventType, handler, options);
  child.addDisposable(() => el.removeEventListener(eventType, handler, options));
  return child;
}

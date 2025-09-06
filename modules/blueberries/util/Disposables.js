export class Disposables {
  #disposables = new Map();
  constructor(){}

  add(disposable, key = "this") {
    if (typeof disposable?.dispose !== "function") throw new TypeError("This is for SomeDisposable.dispose() only.");
    if (!this.#disposables.has(key)) this.#disposables.set(key, new Set());
    this.#disposables.get(key).add(disposable);
  }
  has(key = "this") {
    const set = this.#disposables.get(key);
    return !!(set && set.size > 0);
  }
  dispose(key = "this") {
    const set = this.#disposables.get(key);
    if (!set || set.size === 0) return;
    const disposables = Array.from(set);
    set.clear();
    this.#disposables.delete(key);
    disposables.map((o) => o.dispose());
  }

}

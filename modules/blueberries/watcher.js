#!/usr/bin/env node
import { readdirSync, statSync, readlinkSync, watch } from "fs";
import { resolve, extname, basename } from "path";
import { exec } from "child_process";

class Watcher {
  #timeoutId;

  constructor(options = {}) {

    this.options = {
      recentFiles: 86400 * 3,
      rules: [],
      followSymlinks: true,
      maxDepth: 5,
      debounce: 600,
      change: file => console.log("Changed:", file),
      ...options,
    };

    // normalize rules (default true for dir/name/ext)
    this.options.rules = this.options.rules.map(r =>
      Object.assign({ dir: true, name: true, ext: true }, r)
    );

    this.watched = new Map(); // filepath → fs.FSWatcher
    this.pending = new Set(); // files waiting to trigger change
  }

  normalizeExt(file) {
    const ext = extname(file).slice(1);
    return ext || null;
  }

  applyRules(filePath, stats, depth) {
    const name = basename(filePath);
    const ext = this.normalizeExt(filePath);
    const dir = filePath;

    for (const rule of this.options.rules) {
      const checks = {
        dir:
          rule.dir === true ||
          (typeof rule.dir === "function"
            ? rule.dir(dir)
            : rule.dir instanceof RegExp
            ? rule.dir.test(dir)
            : rule.dir === dir),
        name:
          rule.name === true ||
          (typeof rule.name === "function"
            ? rule.name(name)
            : rule.name instanceof RegExp
            ? rule.name.test(name)
            : rule.name === name),
        ext:
          rule.ext === true ||
          (typeof rule.ext === "function"
            ? rule.ext(ext)
            : rule.ext instanceof RegExp
            ? rule.ext.test(ext)
            : rule.ext === ext),
      };

      if (checks.dir && checks.name && checks.ext) {
        if (rule.action === "break") return "break";
        if (rule.action === "continue") return "continue";
      }
    }
    return null;
  }

  async scanDir(dir, depth = 0, visited = new Set()) {
    if (depth > this.options.maxDepth) return;

    let entries;
    try {
      entries = readdirSync(dir, { withFileTypes: true });
    } catch {
      return;
    }

    for (const entry of entries) {
      if (entry.name.startsWith(".")) continue;

      let fullPath = resolve(dir, entry.name);

      if (entry.isSymbolicLink() && this.options.followSymlinks) {
        try {
          // fullPath = resolve(dir, readlinkSync(fullPath));
          if (visited.has(fullPath)) continue;
          visited.add(fullPath);
        } catch {
          continue;
        }
      }

      let stats;
      try {
        stats = statSync(fullPath);
      } catch {
        continue;
      }

      if (stats.isDirectory()) {
        const ruleResult = this.applyRules(fullPath, stats, depth);
        if (ruleResult === "break") continue;
        await this.scanDir(fullPath, depth + 1, visited);
      } else if (stats.isFile()) {



        const ruleResult = this.applyRules(fullPath, stats, depth);

        const ageSeconds = (Date.now() - stats.mtimeMs) / 1000;

        if (ruleResult && ageSeconds > this.options.recentFiles) {
          console.log('\x1b[33mfile too old:\x1b[0m', fullPath)
          continue;
        }

        if (ruleResult === "break") continue;
        if (ruleResult === "continue") {
          this.addWatcher(fullPath);
        }
      }
    }
  }

  addWatcher(filePath) {
    if (this.watched.has(filePath)) return;

    try {
      const watcher = watch(filePath, eventType => {
        if (eventType === "change") {

          // de-dupe using Set + microtask
          this.pending.add(filePath);

          if(this.#timeoutId) clearTimeout(this.#timeoutId);
          this.timeoutId = setTimeout(() => {
             if(this.pending.size) this.options.change([...this.pending]);
             this.pending.clear();
          }, this.options.debounce);

        }
      });

      watcher.on("error", err => {
        console.error("Watcher error:", err.message);
      });

      this.watched.set(filePath, watcher);
      console.log("Now watching:", filePath);
    } catch (err) {
      console.error("Failed to watch:", filePath, err.message);
    }
  }

  async start(rootDir = process.cwd()) {
    await this.scanDir(rootDir);
  }

  stop() {
    for (const [, watcher] of this.watched) watcher.close();
    this.watched.clear();
    this.pending.clear();
  }
}


// --- Example usage ---
let regExp = new RegExp(`^${resolve(process.cwd())}/node_modules/.+`);
const watcher = new Watcher({
  recentFiles: 86400 * 30,
  rules: [
    { action: "break", dir: v => /\/_unused$|\/dist$/.test(v)},
    { action: "continue", dir: v => regExp.test(v), ext: v => /js|html|css/.test(v) },
    // { action: "continue", name: "bork", ext: v => /xml|x/.test(v) },
  ],
  change: files => {
    console.log(`[${Date.now()}] changed`, files);
    exec("rsync -avL --exclude='.*' --exclude='_unused' ./node_modules/* ./modules/", (error, stdout, stderr) => {
        if (error) {
            console.log(`error: ${error.message}`);
            return;
        }
        if (stderr) {
            console.log(`stderr: ${stderr}`);
            return;
        }
        console.log(`stdout: ${stdout}`);
    });
  },
});

watcher.start();

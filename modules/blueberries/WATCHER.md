# selective-watcher

A minimal file watcher for Node.js that watches only the files you *really* care about.

Unlike traditional watchers that track entire directories and flood you with events
for renames, deletes, or hidden files, **selective-watcher** uses a simple selection
mechanism to decide **what to watch** and then attaches `fs.watch` to those files.

---

## Features

- **Rule-based selection**: decide which files matter, which should be ignored, and which directories should be skipped entirely.
- **Recent files filter**: only watch files changed within the last N seconds (default: 3 days). If you want to include a file, just `touch` it.
- **Hidden files skipped**: files starting with `.` are ignored automatically (`.git`, `.DS_Store`, etc.).
- **Symlink following**: follows symbolic links (configurable), limited by a max depth.
- **Extension handling**: `ext` is normalized (`txt`, not `.txt`).
- **Event deduplication**: multiple `"change"` events from the OS are batched and debounced into one callback.
- **Colorful logging**: optional notifications when files match rules but are skipped for being too old.

---

## Installation

```bash
npm install selective-watcher
```

---

## Usage

```js
#!/usr/bin/env node
import Watcher from "selective-watcher";
import { spawn } from "child_process";

const watcher = new Watcher({
  recentFiles: 86400 * 3, // 3 days
  debounce: 100,          // debounce in ms for batching changes
  rules: [
    { action: "break", dir: v => /node_modules|_unused/.test(v) },
    { action: "break", ext: "gif" },
    { action: "break", ext: /zip|tar/ },
    { action: "continue", ext: v => /js|html|css/.test(v) },
    { action: "continue", name: "bork", ext: v => /xml|x/.test(v) },
  ],
  change: files => {
    console.log("Files changed:", files);
    const cmd = spawn("rsync", [
      "-avL",
      "--exclude='.*'",
      "--exclude='_unused'",
      "./node_modules/*",
      "./modules/",
    ]);
    cmd.stderr.on("data", data => console.error(`stderr: ${data}`));
  },
});

// Start watching from current working directory
watcher.start();
```

---

## How selection works

Think of the watcher as having two stages:

### 1. Selection (before watching)

When you start, the watcher **scans your project folder**:

* If a file is **hidden** (starts with `.`), it’s skipped automatically.
* If a file is **too old** (older than `recentFiles` seconds), it’s skipped (but you get a yellow notification if it matched rules).
* Then your **rules** are applied:

  * A rule has three parts: `dir`, `name`, and `ext`.
  * Each part can be:

    * `true` → always matches
    * a string → exact match
    * a RegExp → pattern match
    * a function → custom test

  * If all three match:

    * `break`: stop and skip this file/dir (and for directories, don’t descend further).
    * `continue`: accept this file (it will be watched), then stop checking further rules.

This means your rules are like **filters in order**, where `break` acts as “ignore this and stop” and `continue` means “yes, include this file”.

> Example:
> `{ action:"break", dir:/node_modules/ }` → skip anything inside `node_modules`.
> `{ action:"continue", ext:/js|css/ }` → accept `.js` and `.css` files.

### 2. Watching

Only the files that passed selection are handed off to Node’s built-in `fs.watch`.

Whenever those files change:

* Events are **deduplicated** (no more double “change” per save).
* Events are **batched** if multiple files change in a short time window.
* The final callback `options.change(files)` receives a list of changed files.

---

## Options

| Option           | Type       | Default              | Description                                                                                                                      |
| ---------------- | ---------- | -------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| `recentFiles`    | `number`   | `86400 * 3` (3 days) | Only watch files modified within the last N seconds.                                                                             |
| `debounce`       | `number`   | `50` ms              | Batch delay for multiple file changes.                                                                                           |
| `rules`          | `Array`    | `[]`                 | Array of rules (`break` or `continue`). Each rule can specify `dir`, `name`, `ext`. Defaults to `{dir:true,name:true,ext:true}`. |
| `followSymlinks` | `boolean`  | `true`               | Follow symbolic links when scanning.                                                                                             |
| `maxDepth`       | `number`   | `5`                  | Maximum recursion depth.                                                                                                         |
| `change`         | `Function` | logs the file(s)     | Called with an array of changed file paths.                                                                                      |

---

## Example rules

```js
rules: [
  { action:"break", dir:/node_modules/ },        // skip node_modules completely
  { action:"break", ext:"gif" },                 // skip all GIF files
  { action:"continue", ext:/js|html|css/ },      // accept JS, HTML, CSS
  { action:"continue", name:"bork", ext:/xml/ }, // accept bork.xml
]
```

---

## Why this watcher?

Most Node.js watchers (like `chokidar`) try to simulate a full filesystem index:

* They tell you about renames, deletes, and events you might not care about.
* They depend on platform-specific APIs and have edge cases.

**selective-watcher** takes a simpler view:

* You choose what matters (recent + rules).
* It watches *only those files*.
* It’s portable, deterministic, and minimal (uses only Node’s built-ins).

---

## License

MIT

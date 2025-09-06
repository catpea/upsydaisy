# blueberries
Dark, modern, powerful, extensible, and feature-packed website theme.

## NOTE
we use cdn links in the index.html (UI demo) because node_modules uses yokel which makes symlinks that are rejected by git (no worries about using npmignore, lol) esbuild was tested it did not honor node's import map and it did not concat, listing separate files was nonsese too. CDN in demo index.html is the only way to make gh pages work, the only thing that could have worked was `npm i` via gh actions, lol.

---
"@dennation/typebook": patch
---

Fix cards written into `outDir` (e.g. `dist/`) being silently wiped in production builds. The plugin emitted at `buildStart`, before the bundler empties `outDir`. It now emits at `writeBundle` in `build` (after the output dir is cleared and the bundle written) while keeping `buildStart` + watcher in `dev`.

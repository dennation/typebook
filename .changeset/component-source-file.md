---
"@dennation/typebook": minor
---

`ComponentInfo` gains `sourceFile` — the scanned module a component was found in (the glob-matched file), distinct from `file` (its declaration). For a re-exported third-party component (`export { Toaster } from "sonner"`) `file` points into `node_modules` while `sourceFile` stays your module, so `out`/`importFrom` can derive paths reliably and re-exports are detectable (`file` outside your project, `sourceFile` inside it). The co-located `out` recipe now uses `doc.sourceFile`.

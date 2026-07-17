---
"@dennation/typebook": minor
---

`llmInstructions`: add `emitToOutDir?: boolean | string` (default `false`) — also write a published copy of the docs into the bundler's output directory. The main `entryPath`/`indexPath` output stays your committed-in-source copy (for review); `emitToOutDir: true` writes a flat copy (`{Name}.md` + `index.md`, same content) to the output dir's root, a string to a subdirectory of it. `build` only (ignored in dev), written at `writeBundle` so it survives `emptyOutDir`; if the output dir is unknown (a non-Vite bundler) it warns and skips (fails with `failOnError`).

`GenerateCtx` gains `outDir?: string` — the resolved output directory, populated in `build` when the bundler exposes it (Vite).

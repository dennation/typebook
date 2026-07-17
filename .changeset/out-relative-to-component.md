---
"@dennation/typebook": minor
---

`llmInstructions`: a card's path now resolves **relative to the component's own folder** (the directory of its `sourceFile`), not the project root. So co-locating a card next to its component is just `entryPath: "."` (`components/Button.tsx` → `components/Button.md`) — no `sourceFile.replace(...)` function needed. A string is a subdirectory relative to the component (`"__llms__"` → a sibling folder); a function's relative return resolves the same way, an absolute path is used as-is.

Renamed the two output options for a consistent pair: `out` → **`entryPath`** (per-component, relative to the component's folder) and `indexFile` → **`indexPath`** (the index, relative to the project root; `false` to skip).

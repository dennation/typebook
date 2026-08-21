---
"@dennation/typebook": patch
---

`llm-instructions:generate` now deletes cards it no longer produces, and `:check` reports them as out of date. Previously a removed component left its card behind forever, and `check` stayed green.

---
"@dennation/typebook": patch
---

Nested unions in prop types (e.g. `Omit<Props, "a" | "b">`) print in a stable order and in full, so scanning an unrelated component no longer changes another component's generated docs.

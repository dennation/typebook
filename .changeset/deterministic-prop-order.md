---
"@dennation/typebook": patch
---

Scanner: emit props — and each prop's literal-union values — in a stable, build-independent order. The checker renders both property order (`Type.getProperties()`) and union member order (`Type.types` / `typeToString`) from its internal member/type-id tables, whose order for mapped/utility types (`Omit`, `Pick`, `Partial`), merged intersections and unions depends on the warm program's cache state — which shifts with the scan order between builds. That reshuffled props and their allowed values in the generated instruction docs on every build even when nothing changed.

Props are now sorted by their declaration site (source file, then position, own API before inherited). A literal union's values keep their **authored** source order (recovered from the declaration, following one level of type alias), with a deterministic alphabetical fallback for derived unions (`Extract`/`Exclude`, template-literal and enum unions) that have no source order to read. Same input now always yields the same order.

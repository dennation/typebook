---
"@dennation/typebook": patch
---

Scanner: emit props in a stable, build-independent order. `Type.getProperties()` walks the checker's member tables, whose order for mapped/utility-type props (`Omit`, `Pick`, `Partial`) and merged intersections depends on the warm program's cache state — which shifts with the scan order between builds. That reordered props in the generated instruction docs on every build even when nothing changed. Props are now sorted by their declaration site (source file, then position, own API before inherited), so the same input always yields the same order.

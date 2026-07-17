---
"@dennation/typebook": minor
---

`filterProps` becomes a **map** (`Record<string, boolean>`) keyed by group or prop name — `true` keeps, `false` hides, a prop name wins over its group, anything unlisted is kept — overridable by object spread (`{ ...DEFAULT_PROP_FILTER, formEncType: true }`). A predicate `(prop, component) => boolean` is still accepted for arbitrary logic. `hideGroups(groups)` now returns such a map (its `except` option is gone — spread the kept names instead), and `DEFAULT_KEPT_PROPS` is a map (`{ children: true, … }`).

New `keepOwnProps` option (default `true`): a component's own props always show; set `false` to filter them by group too. To make this possible, the scanner now classifies a `group` for **every** prop (own props included); `inheritedFrom` remains the own/inherited signal.

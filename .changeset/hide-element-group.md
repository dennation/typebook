---
"@dennation/typebook": minor
---

Default prop filter: hide the `element` group (per-tag native attributes) too, so an inherited card no longer lists DOM noise like `formEncType`/`popoverTarget`. The broadly useful natives — `disabled`, `type`, `name`, `value`, `placeholder`, `required`, `readOnly`, `checked`, `href`, `htmlFor` — are rescued via `DEFAULT_KEPT_PROPS`. A component's own props are unaffected (they're ungrouped, always kept).

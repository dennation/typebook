---
"@dennation/typebook": patch
---

`paramDefaults` reads destructuring defaults through `forwardRef` / `memo` wrappers, so a wrapped component's defaults no longer go missing from the generated docs.

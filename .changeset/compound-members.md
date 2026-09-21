---
"@dennation/typebook": minor
---

The scan reads compound exports: each component member of `export const Tabs = { Tab, … }`, `Object.assign(Root, { Tab })` or `Tabs.Tab = Tab` becomes a `Tabs.Tab` component with `parent: "Tabs"`, and its `llm-instructions` card imports the parent (`import { Tabs }`).

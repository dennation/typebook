## form

Native form with a field grid.

Two columns. `Form.Input` spans both; any other child takes one — give it `col-span-full`.

```tsx
import { Form } from "@acme/ui/form";
```

**Example**

```tsx
<Form.Root>
	<Form.Input label="Email" />
</Form.Root>
```

```tsx
<Form.Root size="md" />
```

### Form.Root

Native form and the grid container for `Form.Field`.

| Prop | Type | Default | Required | Description |
|---|---|---|---|---|
| `size` | `"sm" \| "md"` | `"sm"` | – | Size of the fields inside. |
| `children` | `ReactNode` | – | – | – |

### Form.Input

Input with a label and an error.

| Prop | Type | Default | Required | Description |
|---|---|---|---|---|
| `label` | `ReactNode` | – | – | Label text. |

### Form.Grid

A free grid area.

> ⚠️ **Deprecated:** Use `Form.Root` columns.

| Prop | Type | Default | Required | Description |
|---|---|---|---|---|
| `children` | `ReactNode` | – | – | – |

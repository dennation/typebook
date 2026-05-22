# Button Guide

The `<Button>` component is the primary interactive element in the design system.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Controls button height and font size |
| `variant` | `'solid' \| 'outline' \| 'ghost'` | `'solid'` | Visual style of the button |
| `color` | `'primary' \| 'secondary' \| 'danger'` | `'primary'` | Color theme |
| `disabled` | `boolean` | `false` | Disables interaction and applies muted styles |
| `children` | `ReactNode` | — | Button label content |

## Usage guidelines

- Use **solid** variant for primary actions (submit, save, confirm)
- Use **outline** for secondary actions (cancel, back)
- Use **ghost** for tertiary or inline actions (links, toolbar buttons)
- Use **danger** color only for destructive actions (delete, remove)

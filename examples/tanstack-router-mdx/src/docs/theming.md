# Theming

UI Studio supports light and dark themes out of the box. The theme toggle is available in the sidebar header.

## How it works

The `<Studio>` component accepts an optional `theme` prop:

```tsx
<Studio registry={registry} theme="dark" />
```

When no `theme` is provided, it defaults to the system preference and can be toggled via the sidebar button.

## Customizing component styles

Components render inside the Studio preview area. To ensure your components respond to Studio's theme:

1. Use CSS custom properties that adapt to the theme context
2. Or read the `data-theme` attribute on the root Studio element

## Isolation mode

For components that may conflict with Studio's styles (modals, portals, dropdowns), add `isolate: true` to the story:

```ts
export const Modal = dialog.single({
  props: { open: true },
  isolate: true,
})
```

This renders the component inside an `<iframe>` for full CSS/JS isolation.

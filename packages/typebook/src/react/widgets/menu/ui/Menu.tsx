import { Fragment, useState } from 'react'
import type { ComponentType, ReactNode } from 'react'
import type { Menu as MenuModel, MenuItem } from '@/types.js'

/** The single outer shell wrapping the whole menu (the consumer's `<nav>`/`<ul>`). */
export interface MenuContainerProps {
	children: ReactNode
}

/** Fields every rendered entry receives, collapsible or not. */
interface MenuItemPropsBase {
	item: MenuItem
	/** Nesting depth of this item: `0` at the top, `+1` per level down. */
	level: number
}

/**
 * A **collapsible section** — an item with children and `collapsible !== false`.
 * Only this variant carries the disclosure state: `open` and `toggle` are
 * present and **required**, alongside the already-rendered nested level as
 * `children`. The consumer still owns the link/icon/active state (its router).
 */
export interface CollapsibleMenuItemProps extends MenuItemPropsBase {
	collapsible: true
	/** This section's expanded state. */
	open: boolean
	/** Flip this section's expanded state. */
	toggle: () => void
	/** The rendered nested level. */
	children: ReactNode
}

/**
 * A **non-collapsible entry** — a leaf link (no `children`) or an always-open
 * group header (`collapsible: false`, `children` present and always shown).
 * There is nothing to toggle, so `open`/`toggle` are absent from the type.
 */
export interface StaticMenuItemProps extends MenuItemPropsBase {
	collapsible: false
	/** The rendered nested level for an always-open group; absent for a leaf. */
	children?: ReactNode
}

/** Discriminated on `collapsible`: only the collapsible variant has `open`/`toggle`. */
export type MenuItemProps = CollapsibleMenuItemProps | StaticMenuItemProps

export interface MenuProps {
	menu: MenuModel
	Container: ComponentType<MenuContainerProps>
	Item: ComponentType<MenuItemProps>
}

/**
 * Router-agnostic sidebar/nav renderer. Owns the open/closed state of
 * collapsible sections, the recursion, and the `before`/`after` slots (rendered
 * as the `Item`'s direct siblings, no wrapper). It knows nothing about the
 * current path or active state — that lives entirely in the consumer's `Item`
 * (which asks its own router).
 *
 * `Container` is the single outer shell wrapping the whole menu; nested levels
 * are rendered as a bare list of `Item`s and handed to the parent `Item` as
 * `children`, so the per-level wrapper (e.g. a nested `<ul>`) is the `Item`'s
 * own concern.
 *
 * Collapsibility is data-driven: an item with children is collapsible unless it
 * sets `collapsible: false` (an always-open group). The `Item` is handed the
 * matching prop variant, so `open`/`toggle` only exist where they mean something.
 */
export function Menu({ menu, Container, Item }: MenuProps) {
	const [overrides, setOverrides] = useState<Record<string, boolean>>({})

	function renderItems(items: MenuModel, prefix: string, level: number): ReactNode {
		return items.map((item, i) => {
			const key = `${prefix}${i}`
			const hasItems = !!item.items?.length
			const collapsible = hasItems && item.collapsible !== false
			const children = hasItems
				? renderItems(item.items as MenuModel, `${key}.`, level + 1)
				: undefined
			// Slot state: a collapsible section follows its toggle; a static
			// group is always open; a leaf has nothing to open.
			const open = collapsible ? (overrides[key] ?? item.defaultOpen ?? true) : hasItems
			const state = { open, level }
			return (
				<Fragment key={key}>
					{item.before?.(item, state)}
					{collapsible ? (
						<Item
							collapsible
							item={item}
							level={level}
							open={open}
							toggle={() =>
								setOverrides((o) => ({
									...o,
									[key]: !(o[key] ?? item.defaultOpen ?? true),
								}))
							}
						>
							{children}
						</Item>
					) : (
						<Item collapsible={false} item={item} level={level}>
							{children}
						</Item>
					)}
					{item.after?.(item, state)}
				</Fragment>
			)
		})
	}

	return <Container>{renderItems(menu, '', 0)}</Container>
}

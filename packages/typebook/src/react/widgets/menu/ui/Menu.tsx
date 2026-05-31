import { useState } from 'react'
import type { ComponentType, ReactNode } from 'react'
import type { Menu as MenuModel, MenuItem } from '@/types.js'

/** Wraps one nesting level. Rendered once per depth (the consumer's `<ul>`/`<nav>`). */
export interface MenuContainerProps {
	children: ReactNode
}

/**
 * One entry. The consumer owns the link, the icon, and — crucially — the
 * active state (it knows its own router). `<Menu>` only tells it whether its
 * section is `open` and hands it the `toggle` and the already-rendered nested
 * level as `children` (present only for a section).
 */
export interface MenuItemProps {
	item: MenuItem
	/** This section's expanded state. `false` for a leaf link. */
	open: boolean
	/** Flip this section's expanded state. No-op for a leaf link. */
	toggle: () => void
	/** The rendered nested level — present only when `item` is a section. */
	children?: ReactNode
}

export interface MenuProps {
	menu: MenuModel
	Container: ComponentType<MenuContainerProps>
	Item: ComponentType<MenuItemProps>
}

const noop = () => {}

/**
 * Router-agnostic sidebar/nav renderer. Owns **only** the open/closed state of
 * collapsible sections and the recursion; it knows nothing about the current
 * path or active state — that lives entirely in the consumer's `Item` (which
 * asks its own router). Render slots are the `Container`/`Item` components.
 */
export function Menu({ menu, Container, Item }: MenuProps) {
	const [overrides, setOverrides] = useState<Record<string, boolean>>({})

	function renderLevel(items: MenuModel, prefix: string): ReactNode {
		return (
			<Container>
				{items.map((item, i) => {
					const key = `${prefix}${i}`
					const isSection = !!item.items?.length
					if (!isSection) {
						return <Item key={key} item={item} open={false} toggle={noop} />
					}
					const open = overrides[key] ?? item.defaultOpen ?? true
					const toggle = () =>
						setOverrides((o) => ({ ...o, [key]: !(o[key] ?? item.defaultOpen ?? true) }))
					return (
						<Item key={key} item={item} open={open} toggle={toggle}>
							{renderLevel(item.items as MenuModel, `${key}.`)}
						</Item>
					)
				})}
			</Container>
		)
	}

	return renderLevel(menu, '')
}

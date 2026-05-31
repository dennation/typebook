import { Fragment, useState } from 'react'
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
 * Router-agnostic sidebar/nav renderer. Owns the open/closed state of
 * collapsible sections, the recursion, and the `before`/`after` slots (rendered
 * as the `Item`'s direct siblings, no wrapper). It knows nothing about the
 * current path or active state — that lives entirely in the consumer's `Item`
 * (which asks its own router). Render shells are the `Container`/`Item`.
 */
export function Menu({ menu, Container, Item }: MenuProps) {
	const [overrides, setOverrides] = useState<Record<string, boolean>>({})

	function renderLevel(items: MenuModel, prefix: string): ReactNode {
		return (
			<Container>
				{items.map((item, i) => {
					const key = `${prefix}${i}`
					const isSection = !!item.items?.length
					const open = isSection ? (overrides[key] ?? item.defaultOpen ?? true) : false
					const toggle = isSection
						? () => setOverrides((o) => ({ ...o, [key]: !(o[key] ?? item.defaultOpen ?? true) }))
						: noop
					const state = { open }
					return (
						<Fragment key={key}>
							{item.before?.(item, state)}
							<Item item={item} open={open} toggle={toggle}>
								{isSection ? renderLevel(item.items as MenuModel, `${key}.`) : undefined}
							</Item>
							{item.after?.(item, state)}
						</Fragment>
					)
				})}
			</Container>
		)
	}

	return renderLevel(menu, '')
}

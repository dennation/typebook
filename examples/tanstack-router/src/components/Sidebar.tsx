import { defineMenu } from '@dennation/menu'
import {
	Menu,
	type MenuContainerProps,
	type MenuItemProps,
} from '@dennation/menu/react'
import { menuFromRouteTree } from '@dennation/menu/tanstack-router'
import { Link, useLocation } from '@tanstack/react-router'
import { useMemo } from 'react'
import { routeTree } from '../route-tree.gen'

/** The single outer shell wrapping the whole menu. */
function Container({ children }: MenuContainerProps) {
	return (
		<nav className="st:p-4 st:border-r st:border-border st:flex st:flex-col st:gap-1 st:overflow-y-auto">
			{children}
		</nav>
	)
}

/**
 * One entry. The renderer is router-agnostic, so active-state matching lives
 * here — this is where we talk to TanStack Router.
 */
function Item(props: MenuItemProps) {
	const { item, level } = props
	const { pathname } = useLocation()
	const active = item.href != null && pathname === item.href

	return (
		<>
			<Link
				to={item.href ?? '.'}
				className="st:text-sm st:hover:underline st:data-[active=true]:font-semibold"
				data-active={active}
				style={{ paddingLeft: `${level * 0.75}rem` }}
			>
				{item.title}
			</Link>
			{props.children}
		</>
	)
}

export function Sidebar() {
	// Build the nav tree straight from the router. Each route's `title`/`order`
	// come from its `staticData.menu.meta`; `defineMenu` resolves the keyed
	// input (parent → tree, sorted by order) and lets us tweak entries by key.
	// Built here (not at module load) to avoid the route-tree ⇄ Sidebar import cycle.
	const menu = useMemo(() => defineMenu(menuFromRouteTree(routeTree)), [])

	return <Menu menu={menu} components={{ Container, Item }} />
}

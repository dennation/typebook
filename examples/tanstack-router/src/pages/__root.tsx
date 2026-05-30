import { Layout } from '@dennation/typebook/react'
import { createRootRoute, Link, Outlet } from '@tanstack/react-router'

export const Route = createRootRoute({
	component: RootComponent,
})

function RootComponent() {
	return (
		<Layout
			sidebar={
				<nav className="st:p-4 st:border-r st:border-border st:flex st:flex-col st:gap-2 st:overflow-y-auto">
					<Link to="/" className="st:text-sm st:hover:underline">
						Home
					</Link>
					<Link to="/about" className="st:text-sm st:hover:underline">
						About
					</Link>
					<Link to="/button" className="st:text-sm st:hover:underline">
						Button
					</Link>
				</nav>
			}
		>
			<Outlet />
		</Layout>
	)
}

import { RegistryProvider } from '@dennation/typebook/react'
import { createHashHistory, createRouter, RouterProvider } from '@tanstack/react-router'
import { routeTree } from './route-tree.gen'
import { uiRegistry } from './ui-registry.gen'

const router = createRouter({
	routeTree,
	history: createHashHistory(),
	defaultPreload: 'intent',
})

export default function App() {
	return (
		<RegistryProvider registry={uiRegistry}>
			<RouterProvider router={router} />
		</RegistryProvider>
	)
}

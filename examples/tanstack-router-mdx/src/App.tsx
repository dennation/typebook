import { TypebookProvider } from '@dennation/typebook/react'
import { createHashHistory, createRouter, RouterProvider } from '@tanstack/react-router'
import { routeTree } from './route-tree.gen'

const router = createRouter({
	routeTree,
	history: createHashHistory(),
	defaultPreload: 'intent',
})

export default function App() {
	return (
		<TypebookProvider>
			<RouterProvider router={router} />
		</TypebookProvider>
	)
}

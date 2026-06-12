import { TypebookProvider } from "@dennation/typebook/react";
import {
	createHashHistory,
	createRouter,
	RouterProvider,
} from "@tanstack/react-router";
import { routeTree } from "./route-tree.gen";
import { snippets } from "./snippets.gen";
import { uiRegistry } from "./ui-registry.gen";

const router = createRouter({
	routeTree,
	history: createHashHistory(),
	defaultPreload: "intent",
});

export default function App() {
	return (
		<TypebookProvider registry={uiRegistry} snippets={snippets}>
			<RouterProvider router={router} />
		</TypebookProvider>
	);
}

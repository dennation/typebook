import { TypebookProvider } from "@dennation/typebook/react";
import { createRouter, RouterProvider } from "@tanstack/react-router";
import { routeTree } from "./route-tree.gen.js";
import { snippets } from "./snippets.gen.js";

const router = createRouter({
	routeTree,
	// GitHub Pages serves the site from /<repo>/ — Vite injects the base.
	basepath: import.meta.env.BASE_URL,
	defaultPreload: "intent",
});

declare module "@tanstack/react-router" {
	interface Register {
		router: typeof router;
	}
}

export default function App() {
	// Serves the build-extracted snippet sources to the docs pages' <Snippet>
	// "show source" toggles. No registry — the site documents the library, it
	// doesn't register components of its own.
	return (
		<TypebookProvider snippets={snippets}>
			<RouterProvider router={router} />
		</TypebookProvider>
	);
}

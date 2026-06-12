import { createRootRoute } from "@tanstack/react-router";
import { RootLayout } from "../widgets/layout/RootLayout.js";

export const Route = createRootRoute({
	component: RootLayout,
});

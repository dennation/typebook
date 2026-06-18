import { createRootRoute } from "@tanstack/react-router";
import { RootLayout } from "../widgets/layout/RootLayout";

export const Route = createRootRoute({
	component: RootLayout,
});

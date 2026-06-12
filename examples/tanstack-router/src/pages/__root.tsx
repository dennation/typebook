import { Layout } from "@dennation/typebook/react";
import { createRootRoute, Outlet } from "@tanstack/react-router";
import { Sidebar } from "../components/Sidebar";

export const Route = createRootRoute({
	component: RootComponent,
});

function RootComponent() {
	return (
		<Layout sidebar={<Sidebar />}>
			<Outlet />
		</Layout>
	);
}

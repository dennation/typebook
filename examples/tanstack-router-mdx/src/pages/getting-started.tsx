import { createFileRoute } from "@tanstack/react-router";
import Content from "./getting-started.mdx";

export const Route = createFileRoute("/getting-started")({
	component: Content,
});

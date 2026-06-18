import { createFileRoute } from "@tanstack/react-router";
import { DocsShell } from "../widgets/docs/DocsShell.js";

export const Route = createFileRoute("/docs")({
	component: DocsShell,
});

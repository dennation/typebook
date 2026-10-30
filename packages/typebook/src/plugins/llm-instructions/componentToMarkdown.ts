import type { ComponentInfo, PropInfo } from "../../types";
import { formatPropType } from "./formatPropType";

/**
 * Render a scanned {@link ComponentInfo} as one part of its module's card — heading, description,
 * usage guidance (`@remarks`), deprecation note, and a props table.
 *
 * Renders exactly the props it's given — which props to surface (the `filterProps` policy) is
 * decided upstream, so a part just presents the already-filtered set.
 */
export function componentToMarkdown(component: ComponentInfo): string {
	const props = component.props;

	const parts = [`### ${component.name}`];
	if (component.description) parts.push(component.description);
	if (component.remarks) parts.push(`**Usage**\n\n${component.remarks}`);
	if (component.deprecated !== undefined)
		parts.push(deprecationNote(component.deprecated));
	parts.push(props.length ? propsTable(props) : "_No documented props._");

	return parts.join("\n\n");
}

function deprecationNote(deprecated: boolean | string): string {
	return typeof deprecated === "string"
		? `> ⚠️ **Deprecated:** ${deprecated}`
		: "> ⚠️ **Deprecated.**";
}

function propsTable(props: PropInfo[]): string {
	const header = "| Prop | Type | Default | Required | Description |";
	const divider = "|---|---|---|---|---|";
	const rows = props.map((p) => {
		const cells = [
			`\`${p.name}\``,
			`\`${escapeCell(formatPropType(p))}\``,
			p.defaultValue ? `\`${escapeCell(p.defaultValue)}\`` : "–",
			p.optional ? "–" : "✔",
			propDescription(p),
		];
		return `| ${cells.join(" | ")} |`;
	});
	return [header, divider, ...rows].join("\n");
}

function propDescription(p: PropInfo): string {
	const notes = [];
	if (p.description) notes.push(escapeCell(p.description));
	if (p.deprecated !== undefined)
		notes.push(
			typeof p.deprecated === "string"
				? `⚠️ deprecated: ${escapeCell(p.deprecated)}`
				: "⚠️ deprecated",
		);
	return notes.join(" ") || "–";
}

/** Keep table cells on one row: escape pipes and collapse newlines. */
function escapeCell(text: string): string {
	return text.replace(/\|/g, "\\|").replace(/\s*\n\s*/g, " ");
}

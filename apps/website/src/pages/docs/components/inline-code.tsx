import { C, CodeBlock, Heading, Lead } from "@dennation/typebook/react";
import { IconBrandReact } from "@tabler/icons-react";
import { createFileRoute } from "@tanstack/react-router";
import { DocsFooter } from "../../../widgets/docs/DocsFooter";

function PageInlineCode() {
	return (
		<>
			<Lead>
				<C>C</C> renders inline code — short monospace fragments inside running
				text, like <C>useDocHeadings()</C> or <C>--accent</C>. It applies the{" "}
				<C>.inline-code</C> theme class.
			</Lead>

			<Heading level={2}>Why a component, not a bare tag</Heading>
			<p>
				Unlike paragraphs and lists, <C>C</C> is used <strong>outside</strong>{" "}
				the <C>.doc-prose</C> layer too — inside callouts, tables, tabs and
				cards. A descendant CSS rule like <C>.doc-prose code</C> wouldn't reach
				those places, so the styling rides on the explicit <C>.inline-code</C>{" "}
				class the component applies.
			</p>

			<Heading level={2}>Usage</Heading>
			<CodeBlock.Root>
				<CodeBlock.Tab
					file="page.tsx"
					icon={<IconBrandReact size={14} />}
					lang="tsx"
				>
					{`import { C } from "@dennation/typebook/react";

<p>Read the value from <C>import.meta.env</C>.</p>`}
				</CodeBlock.Tab>
			</CodeBlock.Root>

			<DocsFooter
				prev={{ to: "/docs/components/lead", title: "Lead" }}
				next={{ to: "/docs/components/link", title: "Link" }}
			/>
		</>
	);
}

export const Route = createFileRoute("/docs/components/inline-code")({
	component: PageInlineCode,
});

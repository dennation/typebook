import {
	C,
	CodeBlock,
	CopyCommand,
	H2,
	Icon,
	Lead,
	PropsTable,
} from "@dennation/typebook/react";

export function PageCopyCommand() {
	return (
		<>
			<Lead>
				<C>CopyCommand</C> is the copy-able install-command pill from the
				landing hero: a <C>$</C> prompt, the command in monospace, and a copy
				button with a brief confirmation state.
			</Lead>

			<H2>Example</H2>
			<CopyCommand cmd="pnpm add @dennation/typebook" />

			<H2>Usage</H2>
			<CodeBlock
				file="page.tsx"
				icon={<Icon.react size={14} />}
				lang="tsx"
				code={`import { CopyCommand } from "@dennation/typebook/react";

<CopyCommand cmd="pnpm add @dennation/typebook" />`}
			/>

			<H2>Props</H2>
			<PropsTable
				props={[
					{
						name: "cmd",
						type: "string",
						required: true,
						desc: "The shell command to display and copy to the clipboard.",
					},
				]}
			/>
		</>
	);
}

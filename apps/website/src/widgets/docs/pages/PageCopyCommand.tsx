import {
	C,
	CopyCommand,
	H2,
	Lead,
	PropsTable,
	Snippet,
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
			<Snippet name="copy-command-example">
				{() => <CopyCommand cmd="pnpm add @dennation/typebook" />}
			</Snippet>

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

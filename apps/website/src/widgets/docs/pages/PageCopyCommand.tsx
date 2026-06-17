import { registerComponent } from "@dennation/typebook";
import {
	C,
	CopyCommand,
	H2,
	Lead,
	PropsReference,
	propsToRows,
	Snippet,
} from "@dennation/typebook/react";

const copyCommand = registerComponent(CopyCommand);

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
			<PropsReference props={propsToRows(copyCommand.props)} />
		</>
	);
}

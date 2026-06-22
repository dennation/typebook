import type { CSSProperties, ReactNode } from "react";
import { tv } from "tailwind-variants";
import type { CodeTab } from "../lib/tabsFromChildren";
import { useTokens } from "../lib/useTokens";

const ITALIC = 1; // shiki FontStyle.Italic bit

const line = tv({
	base: "block px-1",
	variants: {
		highlighted: {
			true: "bg-[color-mix(in_oklch,var(--accent)_12%,transparent)] shadow-[inset_2px_0_0_var(--accent)] -mx-4.5 px-4.5",
		},
	},
});

/** The scrollable code area: Shiki-tokenized lines with optional gutter + highlights. */
export function CodeView({ tab }: { tab: CodeTab }) {
	const tokens = useTokens(tab.code, tab.lang);
	const plainLines = tab.code.replace(/\n+$/, "").split("\n");
	const lineCount = tokens?.length ?? plainLines.length;

	const renderLine = (k: number): ReactNode => {
		const lineTokens = tokens?.[k];
		if (!lineTokens || lineTokens.length === 0) {
			return plainLines[k] || " ";
		}
		return lineTokens.map((t, i) => {
			const fontStyle = t.variants.light?.fontStyle ?? 0;
			return (
				<span
					// biome-ignore lint/suspicious/noArrayIndexKey: tokens are positional
					key={i}
					className="tb-tok"
					style={
						{
							"--tk-l": t.variants.light?.color,
							"--tk-d": t.variants.dark?.color,
							fontStyle: fontStyle & ITALIC ? "italic" : undefined,
						} as CSSProperties
					}
				>
					{t.content}
				</span>
			);
		});
	};

	return (
		<div className="overflow-x-auto">
			<pre className="m-0 px-4.5 py-4 font-mono text-[13px] leading-[1.65]">
				<code className="font-mono">
					{Array.from({ length: lineCount }, (_, k) => {
						const hl = tab.highlightLines.includes(k + 1);
						return (
							<span
								// biome-ignore lint/suspicious/noArrayIndexKey: lines are positional
								key={k}
								className={line({ highlighted: hl })}
							>
								{tab.showLineNumbers && (
									<span className="inline-block w-[1.6em] mr-4 text-right text-fg-subtle opacity-55 select-none">
										{k + 1}
									</span>
								)}
								{renderLine(k)}
							</span>
						);
					})}
				</code>
			</pre>
		</div>
	);
}

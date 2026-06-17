import { cx } from "@react/shared/lib/cx.js";
import { Icon } from "@react/shared/ui/icon/index.js";
import { type ReactNode, useEffect, useState } from "react";
import { type ThemedToken, tokenize } from "../lib/tokenize.js";

export interface CodeTab {
	label: string;
	code: string;
	lang?: string;
	file?: string;
	icon?: ReactNode;
}

export interface CodeBlockProps {
	/** Tabbed variants: { label, code, lang?, file?, icon? }. */
	tabs?: CodeTab[];
	/** The snippet source (single-snippet form; ignored when tabs is set). */
	code?: string;
	/**
	 * Any Shiki language id (tsx, css, yaml, python, …). Grammars load on demand;
	 * unknown ids fall back to plain text.
	 * @default "tsx"
	 */
	lang?: string;
	/** Filename shown in the header bar (single-snippet form). */
	file?: string;
	/** Small icon rendered next to the filename. */
	icon?: ReactNode;
	/** Render a line-number gutter. */
	showLineNumbers?: boolean;
	/**
	 * 1-based line numbers to tint with the accent color.
	 * @default []
	 */
	highlightLines?: number[];
}

const ITALIC = 1; // shiki FontStyle.Italic bit

/** Docs code block — filename header OR tabs, copy button, line numbers. */
export function CodeBlock({
	tabs,
	code,
	lang = "tsx",
	file,
	icon,
	showLineNumbers,
	highlightLines = [],
}: CodeBlockProps) {
	const items: CodeTab[] = tabs ?? [
		{ label: file || lang, lang, code: code ?? "", file, icon },
	];
	const [active, setActive] = useState(0);
	const [copied, setCopied] = useState(false);
	const cur = items[active] ?? (items[0] as CodeTab);

	// Shiki is async — render plain lines until the tokens arrive.
	const [tokens, setTokens] = useState<ThemedToken[][] | null>(null);
	useEffect(() => {
		let cancelled = false;
		setTokens(null);
		tokenize(cur.code, cur.lang || "tsx")
			.then((t) => {
				if (!cancelled) setTokens(t);
			})
			.catch(() => {});
		return () => {
			cancelled = true;
		};
	}, [cur.code, cur.lang]);

	const plainLines = cur.code.replace(/\n+$/, "").split("\n");
	const lineCount = tokens?.length ?? plainLines.length;

	const doCopy = () => {
		navigator.clipboard
			?.writeText(cur.code.replace(/\n+$/, ""))
			.catch(() => {});
		setCopied(true);
		setTimeout(() => setCopied(false), 1600);
	};

	const copyBtnClass = cx(
		"w-7 h-7 rounded-[7px] shrink-0 grid place-items-center bg-transparent border border-transparent transition-all duration-130 hover:text-fg hover:bg-bg-tertiary hover:border-border",
		copied ? "text-[oklch(0.6_0.14_155)]" : "text-fg-subtle",
	);
	const CopyBtn = ({ extra = "" }: { extra?: string }) => (
		<button
			type="button"
			className={cx(copyBtnClass, extra)}
			onClick={doCopy}
			aria-label="Copy code"
			title="Copy"
		>
			{copied ? <Icon.check size={15} /> : <Icon.copy size={15} />}
		</button>
	);

	const hasTabs = !!tabs;
	const hasHead = !hasTabs && !!file;

	const renderLine = (k: number): ReactNode => {
		const lineTokens = tokens?.[k];
		if (!lineTokens || lineTokens.length === 0) {
			return plainLines[k] || " ";
		}
		return lineTokens.map((t, i) => (
			<span
				// biome-ignore lint/suspicious/noArrayIndexKey: tokens are positional
				key={i}
				style={{
					color: t.color,
					fontStyle: t.fontStyle && t.fontStyle & ITALIC ? "italic" : undefined,
				}}
			>
				{t.content}
			</span>
		));
	};

	return (
		<div
			className={cx(
				"border border-border rounded-(--radius-token) overflow-hidden bg-code-bg",
				!hasTabs && !hasHead && "relative",
			)}
		>
			{hasTabs && (
				<div className="flex items-center gap-0.5 pt-1.5 px-2 bg-bg-secondary border-b border-border">
					{items.map((t, k) => {
						const on = k === active;
						return (
							<button
								key={t.label}
								type="button"
								className={cx(
									"relative font-mono text-[12.5px] pt-1.75 px-3 pb-2.25 border-none bg-transparent rounded-t-[6px] transition-colors duration-130",
									on ? "text-fg" : "text-fg-subtle hover:text-fg-muted",
								)}
								onClick={() => setActive(k)}
							>
								{t.icon && (
									<span className="inline-flex mr-1.5 opacity-80 [vertical-align:-2px]">
										{t.icon}
									</span>
								)}
								{t.label}
								{on && (
									<span className="absolute left-2 right-2 -bottom-px h-0.5 bg-accent rounded-[2px]" />
								)}
							</button>
						);
					})}
					<div className="ml-auto">
						<CopyBtn />
					</div>
				</div>
			)}
			{hasHead && (
				<div className="flex items-center gap-2 pt-2 pr-2.5 pb-2 pl-3.5 bg-bg-secondary border-b border-border font-mono text-[12.5px] text-fg-muted">
					<span className="flex items-center gap-1.75">
						{icon}
						{file}
					</span>
					<span className="ml-auto text-[11px] uppercase tracking-[0.04em] text-fg-subtle">
						{cur.lang}
					</span>
					<CopyBtn extra="ml-2" />
				</div>
			)}
			{!hasTabs && !hasHead && (
				<CopyBtn extra="absolute top-2.25 right-2.25 z-2 bg-[color-mix(in_oklch,var(--code-bg)_80%,transparent)]" />
			)}
			<div className="overflow-x-auto">
				<pre className="m-0 px-4.5 py-4 font-mono text-[13px] leading-[1.65]">
					<code className="font-mono">
						{Array.from({ length: lineCount }, (_, k) => {
							const hl = highlightLines.includes(k + 1);
							return (
								<span
									// biome-ignore lint/suspicious/noArrayIndexKey: lines are positional
									key={k}
									className={cx(
										"block px-1",
										hl &&
											"bg-[color-mix(in_oklch,var(--accent)_12%,transparent)] shadow-[inset_2px_0_0_var(--accent)] -mx-4.5 px-4.5",
									)}
								>
									{showLineNumbers && (
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
		</div>
	);
}

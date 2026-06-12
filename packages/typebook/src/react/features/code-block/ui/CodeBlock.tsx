import { cx } from "@react/shared/lib/cx.js";
import { Icon } from "@react/shared/ui/icon/index.js";
import { type ReactNode, useMemo, useState } from "react";
import { highlight } from "../lib/highlight.js";

export interface CodeTab {
	label: string;
	code: string;
	lang?: string;
	file?: string;
	icon?: ReactNode;
}

export interface CodeBlockProps {
	/** Multiple variants rendered as tabs (npm/pnpm/yarn, …). */
	tabs?: CodeTab[];
	/** Single-snippet form. */
	code?: string;
	lang?: string;
	/** Filename shown in the header bar. */
	file?: string;
	icon?: ReactNode;
	showLineNumbers?: boolean;
	/** 1-based line numbers to highlight. */
	highlightLines?: number[];
}

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
	const lines = useMemo(
		() => highlight(cur.code, cur.lang || "tsx"),
		[cur.code, cur.lang],
	);

	const doCopy = () => {
		navigator.clipboard
			?.writeText(cur.code.replace(/\n+$/, ""))
			.catch(() => {});
		setCopied(true);
		setTimeout(() => setCopied(false), 1600);
	};

	const copyBtnClass = cx(
		"w-[28px] h-[28px] rounded-[7px] shrink-0 grid place-items-center bg-transparent border border-transparent transition-all duration-[130ms] hover:text-fg hover:bg-bg-tertiary hover:border-border",
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

	return (
		<div
			className={cx(
				"border border-border rounded-[var(--radius-token)] overflow-hidden bg-code-bg",
				!hasTabs && !hasHead && "relative",
			)}
		>
			{hasTabs && (
				<div className="flex items-center gap-[2px] pt-[6px] px-[8px] bg-bg-secondary border-b border-border">
					{items.map((t, k) => {
						const on = k === active;
						return (
							<button
								key={t.label}
								type="button"
								className={cx(
									"relative font-mono text-[12.5px] pt-[7px] px-[12px] pb-[9px] border-none bg-transparent rounded-t-[6px] transition-colors duration-[130ms]",
									on ? "text-fg" : "text-fg-subtle hover:text-fg-muted",
								)}
								onClick={() => setActive(k)}
							>
								{t.icon && (
									<span className="inline-flex mr-[6px] opacity-80 [vertical-align:-2px]">
										{t.icon}
									</span>
								)}
								{t.label}
								{on && (
									<span className="absolute left-[8px] right-[8px] bottom-[-1px] h-[2px] bg-accent rounded-[2px]" />
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
				<div className="flex items-center gap-[8px] pt-[8px] pr-[10px] pb-[8px] pl-[14px] bg-bg-secondary border-b border-border font-mono text-[12.5px] text-fg-muted">
					<span className="flex items-center gap-[7px]">
						{icon}
						{file}
					</span>
					<span className="ml-auto text-[11px] uppercase tracking-[0.04em] text-fg-subtle">
						{cur.lang}
					</span>
					<CopyBtn extra="ml-[8px]" />
				</div>
			)}
			{!hasTabs && !hasHead && (
				<CopyBtn extra="absolute top-[9px] right-[9px] z-[2] bg-[color-mix(in_oklch,var(--code-bg)_80%,transparent)]" />
			)}
			<div className="overflow-x-auto">
				<pre className="m-0 px-[18px] py-[16px] font-mono text-[13px] leading-[1.65]">
					<code className="font-mono">
						{lines.map((html, k) => {
							const hl = highlightLines.includes(k + 1);
							return (
								<span
									// biome-ignore lint/suspicious/noArrayIndexKey: lines are positional
									key={k}
									className={cx(
										"block px-[4px]",
										hl &&
											"bg-[color-mix(in_oklch,var(--accent)_12%,transparent)] shadow-[inset_2px_0_0_var(--accent)] mx-[-18px] px-[18px]",
									)}
								>
									{showLineNumbers && (
										<span className="inline-block w-[1.6em] mr-[16px] text-right text-fg-subtle opacity-55 select-none">
											{k + 1}
										</span>
									)}
									<span
										// biome-ignore lint/security/noDangerouslySetInnerHtml: highlighter escapes its input
										dangerouslySetInnerHTML={{ __html: html || "&nbsp;" }}
									/>
								</span>
							);
						})}
					</code>
				</pre>
			</div>
		</div>
	);
}

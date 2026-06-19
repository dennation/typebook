import { Icon } from "@react/shared/ui/icon/index";
import { useCallback, useState } from "react";
import { tv } from "tailwind-variants";

export interface CopyCommandProps {
	/** The shell command to display and copy. */
	cmd: string;
}

const copyButton = tv({
	base: "w-8.5 h-8.5 rounded-lg flex-none ml-0.5 grid place-items-center bg-bg border border-border transition-all duration-130",
	variants: {
		copied: {
			true: "text-[oklch(0.6_0.14_155)]",
			false: "text-fg-subtle hover:text-fg hover:border-border-strong",
		},
	},
});

/** A copy-able command pill (e.g. `npx create-typebok@latest`). */
export function CopyCommand({ cmd }: CopyCommandProps) {
	const [copied, setCopied] = useState(false);

	const copy = useCallback(() => {
		navigator.clipboard?.writeText(cmd).catch(() => {});
		setCopied(true);
		setTimeout(() => setCopied(false), 1500);
	}, [cmd]);

	return (
		<div className="inline-flex items-center gap-3 whitespace-nowrap h-12.5 pl-4.5 pr-2 bg-code-bg border border-border rounded-[calc(var(--radius-token)+2px)] font-mono text-[14px] text-fg shadow-sm">
			<span className="text-accent select-none">$</span>
			<span>{cmd}</span>
			<button
				type="button"
				className={copyButton({ copied })}
				onClick={copy}
				aria-label="Copy command"
			>
				{copied ? <Icon.check size={15} /> : <Icon.copy size={15} />}
			</button>
		</div>
	);
}

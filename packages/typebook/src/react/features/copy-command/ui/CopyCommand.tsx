import { cx } from "@react/shared/lib/cx.js";
import { Icon } from "@react/shared/ui/icon/index.js";
import { useCallback, useState } from "react";

export interface CopyCommandProps {
	/** The shell command to display and copy. */
	cmd: string;
}

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
				className={cx(
					"w-8.5 h-8.5 rounded-[8px] flex-none ml-0.5 grid place-items-center bg-bg border border-border transition-all duration-130",
					copied
						? "text-[oklch(0.6_0.14_155)]"
						: "text-fg-subtle hover:text-fg hover:border-border-strong",
				)}
				onClick={copy}
				aria-label="Copy command"
			>
				{copied ? <Icon.check size={15} /> : <Icon.copy size={15} />}
			</button>
		</div>
	);
}

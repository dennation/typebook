import { Check, Copy } from "lucide-react";
import { tv } from "tailwind-variants";
import { useCopy } from "../../../shared/lib/useCopy";

const copyButton = tv({
	base: "w-7 h-7 rounded-[7px] shrink-0 grid place-items-center bg-transparent border border-transparent transition-all duration-130 hover:text-fg hover:bg-bg-tertiary hover:border-border",
	variants: {
		copied: {
			true: "text-[oklch(0.6_0.14_155)]",
			false: "text-fg-subtle",
		},
	},
});

/** Copy-to-clipboard button. Trailing blank lines are stripped before copying. */
export function CopyButton({
	code,
	className,
}: {
	code: string;
	className?: string;
}) {
	const { copied, copy } = useCopy();
	return (
		<button
			type="button"
			className={copyButton({ copied, className })}
			onClick={() => copy(code.replace(/\n+$/, ""))}
			aria-label="Copy code"
			title="Copy"
		>
			{copied ? <Check size={15} /> : <Copy size={15} />}
		</button>
	);
}

/** Hatched placeholder used where the docs would show a screenshot. */
export function ImagePlaceholder({
	label = "screenshot",
	height,
}: {
	label?: string;
	height?: number;
}) {
	return (
		<div
			className="border border-border rounded-(--radius-token) bg-bg-secondary bg-[repeating-linear-gradient(135deg,transparent_0_11px,color-mix(in_oklch,var(--border)_55%,transparent)_11px_12px)] h-55 grid place-items-center"
			style={height ? { height } : undefined}
		>
			<span className="font-mono text-[12px] text-fg-subtle bg-bg px-2.75 py-1.25 rounded-[99px] border border-border">
				{label}
			</span>
		</div>
	);
}

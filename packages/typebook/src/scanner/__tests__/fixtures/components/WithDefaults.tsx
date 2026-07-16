export interface WithDefaultsProps {
	size?: "sm" | "md" | "lg";
	count?: number;
	/** Default surfaced via a JSDoc tag (survives into `.d.ts`). @default "solid" */
	variant?: "solid" | "ghost";
}

export function WithDefaults({ size = "md", count = 3 }: WithDefaultsProps) {
	return (
		<div>
			{size}
			{count}
		</div>
	);
}

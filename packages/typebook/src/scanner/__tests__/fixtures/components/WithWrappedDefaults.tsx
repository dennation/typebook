import { forwardRef, memo } from "react";

export interface WithWrappedDefaultsProps {
	size?: "sm" | "md" | "lg";
	count?: number;
}

/** `forwardRef(fn)` — the declaration's initializer is a call, not the render function. */
export const WithWrappedDefaults = forwardRef<
	HTMLDivElement,
	WithWrappedDefaultsProps
>(({ size = "md", count = 3 }, ref) => (
	<div ref={ref}>
		{size}
		{count}
	</div>
));

/** `memo(forwardRef(fn))` — two nested calls to unwrap before the render function. */
export const WithMemoWrappedDefaults = memo(
	forwardRef<HTMLDivElement, WithWrappedDefaultsProps>(
		({ size = "md", count = 3 }, ref) => (
			<div ref={ref}>
				{size}
				{count}
			</div>
		),
	),
);

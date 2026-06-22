import type { ReactNode } from "react";

export interface StepsRootProps {
	/** One or more `<Steps.Step>` elements. */
	children?: ReactNode;
}

/**
 * Numbered procedure — counters and connector line live in the theme layer.
 * Wraps one or more `<Steps.Step>` children.
 */
export function StepsRoot({ children }: StepsRootProps) {
	return <div className="steps">{children}</div>;
}
StepsRoot.displayName = "Steps.Root";

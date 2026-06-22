import type { ReactNode } from "react";

export interface StepProps {
	/** Optional bold heading next to the step number. */
	title?: string;
	/** Step body; consecutive blocks get vertical rhythm automatically. */
	children?: ReactNode;
}

/** One step inside `<Steps.Root>`. */
export function Step({ title, children }: StepProps) {
	return (
		<div className="step">
			{title && <div className="step-title">{title}</div>}
			{children}
		</div>
	);
}
Step.displayName = "Steps.Step";

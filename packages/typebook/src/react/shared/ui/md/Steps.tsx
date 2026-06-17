import type { ReactNode } from "react";

/** Numbered procedure — counters and connector line live in the theme layer. */
export const Steps = ({ children }: { children: ReactNode }) => (
	<div className="steps">{children}</div>
);

export interface StepProps {
	/** Optional bold heading next to the step number. */
	title?: string;
	/** Step body; consecutive blocks get vertical rhythm automatically. */
	children?: ReactNode;
}

export const Step = ({ title, children }: StepProps) => (
	<div className="step">
		{title && <div className="step-title">{title}</div>}
		{children}
	</div>
);

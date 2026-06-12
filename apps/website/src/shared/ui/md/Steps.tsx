import type { ReactNode } from "react";

/** Numbered procedure — counters and connector line live in the theme layer. */
export const Steps = ({ children }: { children: ReactNode }) => (
	<div className="steps">{children}</div>
);

export interface StepProps {
	title?: string;
	children?: ReactNode;
}

export const Step = ({ title, children }: StepProps) => (
	<div className="step">
		{title && <div className="step-title">{title}</div>}
		{children}
	</div>
);

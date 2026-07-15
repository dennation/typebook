export interface WithComponentDocProps {
	/** The visual size of the control. */
	size: "sm" | "md" | "lg";
	label?: string;
}

/**
 * A primary call-to-action button.
 * @deprecated use `Action` instead
 */
export function WithComponentDoc(props: WithComponentDocProps) {
	return <div>{props.label}</div>;
}

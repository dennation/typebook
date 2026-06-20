interface WithJsDocProps {
	/** The visual size of the control. */
	size: "sm" | "md" | "lg";
	/**
	 * Legacy color name.
	 * @deprecated use `tone` instead
	 */
	color?: string;
	/** @deprecated */
	legacy?: boolean;
	tone?: "neutral" | "brand";
}

export function WithJsDoc(props: WithJsDocProps) {
	return <div>{props.size}</div>;
}

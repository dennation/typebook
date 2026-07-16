import type { ComponentPropsWithoutRef } from "react";

export interface WithHtmlAttrsProps extends ComponentPropsWithoutRef<"button"> {
	/** Own prop declared in this file. */
	variant: "primary" | "secondary";
}

export function WithHtmlAttrs(props: WithHtmlAttrsProps) {
	return <button className={props.className}>{props.variant}</button>;
}

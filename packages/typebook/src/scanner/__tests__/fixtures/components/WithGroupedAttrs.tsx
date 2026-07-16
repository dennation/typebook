import type { ComponentPropsWithoutRef } from "react";

export interface WithGroupedAttrsProps
	extends ComponentPropsWithoutRef<"button"> {
	/** Own prop — shares a name with the HTML `size` attribute but is declared here. */
	size: "sm" | "md";
	/** Own custom callback — matches `on*` but isn't a DOM event. */
	onValueChange: (v: string) => void;
}

export function WithGroupedAttrs(props: WithGroupedAttrsProps) {
	return <button className={props.className}>{props.size}</button>;
}

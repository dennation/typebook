import type { MouseEvent, ReactElement, ReactNode } from "react";

export interface WithChildrenProps {
	children: ReactNode;
	icon?: ReactElement;
	onClick?: (e: MouseEvent) => void;
	renderFooter?: () => ReactNode;
	/** A composite that merely CONTAINS a node — must not be read as a node itself. */
	slots?: Record<string, ReactNode>;
}

export function WithChildren(props: WithChildrenProps) {
	return <div>{props.children}</div>;
}

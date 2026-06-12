import type { MouseEvent, ReactElement, ReactNode } from "react";

interface WithChildrenProps {
	children: ReactNode;
	icon?: ReactElement;
	onClick?: (e: MouseEvent) => void;
	renderFooter?: () => ReactNode;
}

export function WithChildren(props: WithChildrenProps) {
	return <div>{props.children}</div>;
}

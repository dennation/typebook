import { Component, type ReactNode } from "react";

/** A class component — deliberately unsupported; the scan must ignore it. */
export class ClassComponent extends Component<{ label: string }> {
	render(): ReactNode {
		return <div>{this.props.label}</div>;
	}
}

import { Preview } from "@react/shared/ui/preview/index.js";
import type { ComponentMeta } from "@react/types.js";
import { createElement, useCallback, useState } from "react";
import { PropsTable } from "./PropsTable.js";

export interface PlaygroundProps {
	of: ComponentMeta<any>;
}

export function Playground({ of }: PlaygroundProps) {
	const Component = of.component;
	const allProps = of.props;

	const [controlProps, setControlProps] = useState<Record<string, unknown>>(
		of.defaultProps,
	);

	const handleChange = useCallback((propName: string, value: unknown) => {
		setControlProps((prev) => ({ ...prev, [propName]: value }));
	}, []);

	const render = useCallback(
		(p: any) => createElement(Component, p),
		[Component],
	);

	return (
		<div className="rounded-lg border border-border overflow-hidden mb-6">
			<div className="bg-bg-secondary">
				<Preview props={controlProps} render={render} />
			</div>
			<PropsTable
				props={allProps}
				values={controlProps}
				onChange={handleChange}
			/>
		</div>
	);
}

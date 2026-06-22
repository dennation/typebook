import type { ReactNode } from "react";
import { memo } from "react";
import { Disclosure } from "./Disclosure";
import { Preview } from "./Preview";
import { SourceToggle } from "./SourceToggle";

export interface PreviewFrameProps {
	label: string;
	props: Record<string, unknown>;
	render: (props: any) => ReactNode;
	isolate?: boolean;
	/**
	 * The revealed source. Pass a node (or `null`) to show the "show source" toggle; omit it
	 * (leave `undefined`) for a cell with no source row.
	 */
	source?: ReactNode | null;
	/** An interactive controls panel; pass a node to show the "show controls" toggle. */
	controls?: ReactNode;
}

export const PreviewFrame = memo(function PreviewFrame({
	label,
	props,
	render,
	isolate,
	source,
	controls,
}: PreviewFrameProps) {
	return (
		<div className="relative bg-bg-secondary rounded-lg overflow-hidden">
			<span className="absolute top-1 left-1 text-[10px] text-fg-muted bg-bg px-1.5 py-px rounded-full z-10">
				{label}
			</span>
			<Preview props={props} render={render} isolate={isolate} />
			{source !== undefined && <SourceToggle source={source} />}
			{controls !== undefined && (
				<Disclosure label="controls">{controls}</Disclosure>
			)}
		</div>
	);
});

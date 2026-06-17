import type { ReactNode } from "react";
import { memo } from "react";
import { Preview } from "./Preview";

export interface PreviewFrameProps {
	label: string;
	props: Record<string, unknown>;
	render: (props: any) => ReactNode;
	isolate?: boolean;
}

export const PreviewFrame = memo(function PreviewFrame({
	label,
	props,
	render,
	isolate,
}: PreviewFrameProps) {
	return (
		<div className="relative bg-bg-secondary rounded-lg overflow-hidden">
			<span className="absolute top-1 left-1 text-[10px] text-fg-muted bg-bg px-1.5 py-px rounded-full z-10">
				{label}
			</span>
			<Preview props={props} render={render} isolate={isolate} />
		</div>
	);
});

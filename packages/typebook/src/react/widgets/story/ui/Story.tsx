import { SourceBlock } from "@react/features/code-block/index";
import { InteractivePreview } from "@react/features/prop-input/index";
import { componentSource } from "@react/shared/lib/componentSource";
import { Preview, PreviewCard } from "@react/shared/ui/preview/index";
import type { ComponentMeta } from "@react/types";
import { createElement, useCallback } from "react";
import type { MissingProps } from "@/types";

export type StoryProps<Props extends object, Defaulted extends keyof Props> = {
	of: ComponentMeta<Props, Defaulted>;
	isolate?: boolean;
	/** Optional title shown as a header above the preview. */
	title?: string;
	/** Show a "show source" toggle revealing the serialized component usage (on by default). */
	showSource?: boolean;
	/** Make the props editable in place via a "show controls" panel. */
	interactive?: boolean;
} & (keyof MissingProps<Props, Defaulted> extends never
	? { props?: Partial<Props> }
	: { props: Partial<Props> & MissingProps<Props, Defaulted> });

export function Story<
	Props extends object,
	Defaulted extends keyof Props = never,
>({
	of,
	props,
	isolate,
	title,
	showSource = true,
	interactive,
}: StoryProps<Props, Defaulted>) {
	const Component = of.component;

	const merged: Record<string, unknown> = {
		...of.defaultProps,
		...(props as Record<string, unknown> | undefined),
	};

	const render = useCallback(
		(p: any) => createElement(Component, p),
		[Component],
	);

	if (interactive) {
		return (
			<InteractivePreview
				card
				title={title}
				component={Component}
				propInfos={of.props}
				initialProps={merged}
				isolate={isolate}
				showSource={showSource}
			/>
		);
	}

	const preview = <Preview props={merged} render={render} isolate={isolate} />;

	// No header and no source → the bare centered preview.
	if (!title && !showSource) return preview;

	const source = showSource ? (
		<SourceBlock code={componentSource(Component, merged)} name={title} />
	) : undefined;

	return <PreviewCard preview={preview} source={source} label={title} />;
}

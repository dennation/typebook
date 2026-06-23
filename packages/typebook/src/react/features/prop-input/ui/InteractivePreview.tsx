import { SourceBlock } from "@react/features/code-block/index";
import { componentSource } from "@react/shared/lib/componentSource";
import {
	Preview,
	PreviewCard,
	PreviewFrame,
} from "@react/shared/ui/preview/index";
import {
	type ComponentType,
	createElement,
	useCallback,
	useState,
} from "react";
import type { PropInfo } from "@/types";
import { PropsTable } from "./PropsTable";

export interface InteractivePreviewProps {
	component: ComponentType<any>;
	propInfos: PropInfo[];
	/** Starting props for this instance (merged defaults + variant/cell props). */
	initialProps: Record<string, unknown>;
	isolate?: boolean;
	/** Show the (live) "show source" toggle reflecting the edited props. */
	showSource?: boolean;
	/** Use the card chrome (Story) instead of the frame chrome (Variants/Matrix cell). */
	card?: boolean;
	/** Title for the card chrome. */
	title?: string;
	/** Badge label for the frame chrome. */
	badge?: string;
}

/**
 * A single preview whose props are editable in place. Owns its own state, so each cell of a grid
 * or matrix is independently interactive. The "show source" panel is live — it reflects the
 * currently edited props.
 */
export function InteractivePreview({
	component,
	propInfos,
	initialProps,
	isolate,
	showSource = true,
	card,
	title,
	badge = "",
}: InteractivePreviewProps) {
	const [values, setValues] = useState<Record<string, unknown>>(initialProps);

	const onChange = useCallback((name: string, value: unknown) => {
		setValues((prev) => ({ ...prev, [name]: value }));
	}, []);

	const render = useCallback(
		(p: any) => createElement(component, p),
		[component],
	);

	const source = showSource ? (
		<SourceBlock code={componentSource(component, values)} />
	) : undefined;

	const controls = (
		<PropsTable props={propInfos} values={values} onChange={onChange} />
	);

	if (card) {
		return (
			<PreviewCard
				preview={<Preview props={values} render={render} isolate={isolate} />}
				source={source}
				controls={controls}
				label={title}
			/>
		);
	}

	return (
		<PreviewFrame
			label={badge}
			props={values}
			render={render}
			isolate={isolate}
			source={source}
			controls={controls}
		/>
	);
}

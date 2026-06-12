import { PropInput } from "@react/features/prop-input/index.js";
import type { PropInfo } from "@/types.js";
import { formatPropType, isControllable } from "../lib/formatPropType.js";

export interface PropRowProps {
	prop: PropInfo;
	value: unknown;
	onChange: (value: unknown) => void;
}

export function PropRow({ prop, value, onChange }: PropRowProps) {
	const typeText = formatPropType(prop);
	return (
		<tr className="border-b border-border last:border-b-0">
			<td
				className={`py-2.5 px-4 font-mono whitespace-nowrap ${prop.inherited ? "text-fg-muted" : "text-fg"}`}
			>
				{prop.name}
				{!prop.optional && <span className="text-red-400 ml-0.5">*</span>}
			</td>
			<td
				className="py-2.5 px-4 font-mono text-fg-muted max-w-50 truncate"
				title={typeText}
			>
				{typeText}
			</td>
			<td className="py-2.5 px-4">
				{isControllable(prop) ? (
					<PropInput prop={prop} value={value} onChange={onChange} />
				) : (
					<span className="text-fg-muted">—</span>
				)}
			</td>
		</tr>
	);
}

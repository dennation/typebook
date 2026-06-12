import { memo } from "react";
import type { PropInfo } from "@/types.js";

const INPUT_CLASS =
	"w-full text-xs bg-transparent border border-border rounded-md px-2 py-1.5 text-fg outline-none focus:border-accent transition-colors";

export interface PropInputProps {
	prop: PropInfo;
	value: unknown;
	onChange: (value: unknown) => void;
}

export const PropInput = memo(function PropInput({
	prop,
	value,
	onChange,
}: PropInputProps) {
	const { type } = prop;

	if (type.kind === "literal") {
		return (
			<select
				className={`${INPUT_CLASS} cursor-pointer`}
				value={String(value ?? "")}
				onChange={(e) => onChange(e.target.value)}
			>
				{type.values.map((v) => (
					<option key={v} value={v}>
						{v}
					</option>
				))}
			</select>
		);
	}

	if (type.kind === "boolean") {
		const checked = Boolean(value);
		return (
			<button
				type="button"
				className={`text-xs px-2.5 py-1.5 rounded-md border cursor-pointer transition-colors ${
					checked
						? "bg-accent text-bg border-accent"
						: "bg-transparent text-fg-muted border-border hover:border-accent"
				}`}
				onClick={() => onChange(!checked)}
			>
				{checked ? "true" : "false"}
			</button>
		);
	}

	if (type.kind === "string" || type.kind === "node") {
		return (
			<input
				type="text"
				className={INPUT_CLASS}
				value={String(value ?? "")}
				onChange={(e) => onChange(e.target.value)}
			/>
		);
	}

	if (type.kind === "number") {
		return (
			<input
				type="number"
				className={INPUT_CLASS}
				value={Number(value ?? 0)}
				onChange={(e) => onChange(Number(e.target.value))}
			/>
		);
	}

	return null;
});

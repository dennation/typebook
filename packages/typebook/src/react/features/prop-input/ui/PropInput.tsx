import { memo } from "react";
import { tv } from "tailwind-variants";
import type { PropInfo } from "@/types.js";

const field = tv({
	base: "w-full text-xs bg-transparent border border-border rounded-md px-2 py-1.5 text-fg outline-none focus:border-accent transition-colors",
	variants: {
		select: { true: "cursor-pointer" },
	},
});

const toggle = tv({
	base: "text-xs px-2.5 py-1.5 rounded-md border cursor-pointer transition-colors",
	variants: {
		checked: {
			true: "bg-accent text-bg border-accent",
			false:
				"bg-transparent text-fg-muted border-border hover:border-accent",
		},
	},
});

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
				className={field({ select: true })}
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
				className={toggle({ checked })}
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
				className={field()}
				value={String(value ?? "")}
				onChange={(e) => onChange(e.target.value)}
			/>
		);
	}

	if (type.kind === "number") {
		return (
			<input
				type="number"
				className={field()}
				value={Number(value ?? 0)}
				onChange={(e) => onChange(Number(e.target.value))}
			/>
		);
	}

	return null;
});

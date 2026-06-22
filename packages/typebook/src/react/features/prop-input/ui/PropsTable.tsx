import { useMemo, useState } from "react";
import type { PropInfo } from "@/types";
import { PropRow } from "./PropRow";

export interface PropsTableProps {
	props: PropInfo[];
	values: Record<string, unknown>;
	onChange: (propName: string, value: unknown) => void;
}

export function PropsTable({ props, values, onChange }: PropsTableProps) {
	const [search, setSearch] = useState("");
	const [showInherited, setShowInherited] = useState(false);

	const hasInherited = useMemo(() => props.some((p) => p.inherited), [props]);
	const filtered = useMemo(() => {
		return props
			.filter((p) => {
				if (!showInherited && p.inherited) return false;
				if (search && !p.name.toLowerCase().includes(search.toLowerCase()))
					return false;
				return true;
			})
			.sort((a, b) => a.name.localeCompare(b.name));
	}, [props, search, showInherited]);

	return (
		<>
			{props.length > 0 && (
				<div className="border-t border-border flex items-center gap-3 px-4 py-2">
					<input
						type="text"
						placeholder="Search props..."
						value={search}
						onChange={(e) => setSearch(e.target.value)}
						className="flex-1 bg-transparent border border-border rounded px-2.5 py-1.5 text-xs text-fg placeholder-fg-muted outline-none focus:border-fg-muted"
					/>
					{hasInherited && (
						<label className="flex items-center gap-1.5 text-xs text-fg-muted whitespace-nowrap cursor-pointer select-none">
							<input
								type="checkbox"
								checked={showInherited}
								onChange={(e) => setShowInherited(e.target.checked)}
								className="accent-fg-muted"
							/>
							Show inherited
						</label>
					)}
				</div>
			)}

			<div className="border-t border-border">
				{filtered.length === 0 ? (
					<p className="text-xs text-fg-muted p-3">
						{props.length === 0 ? "No props" : "No matching props"}
					</p>
				) : (
					<table className="w-full text-xs">
						<thead>
							<tr className="border-b border-border">
								<th className="text-left py-2.5 px-4 font-medium text-fg-muted">
									Prop
								</th>
								<th className="text-left py-2.5 px-4 font-medium text-fg-muted">
									Type
								</th>
								<th className="text-left py-2.5 px-4 font-medium text-fg-muted">
									Control
								</th>
							</tr>
						</thead>
						<tbody>
							{filtered.map((prop) => (
								<PropRow
									key={prop.name}
									prop={prop}
									value={values[prop.name]}
									onChange={(value) => onChange(prop.name, value)}
								/>
							))}
						</tbody>
					</table>
				)}
			</div>
		</>
	);
}

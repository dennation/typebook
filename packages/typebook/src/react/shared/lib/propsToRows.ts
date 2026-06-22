import type { PropRowData } from "@react/shared/ui/props-reference/index";
import type { PropInfo } from "@/types";
import { formatPropType } from "./formatPropType";

/**
 * Map a registered component's extracted `PropInfo[]` (from `handle.props`) into
 * the row shape `PropsReference` renders — so a docs props table can be sourced
 * from the component's types instead of hand-written. Inherited props (framework
 * types like `React.HTMLAttributes`) are dropped unless `includeInherited` is set.
 */
export function propsToRows(
	props: PropInfo[],
	includeInherited = false,
): PropRowData[] {
	return props
		.filter((p) => includeInherited || !p.inherited)
		.map((p) => ({
			name: p.name,
			type: formatPropType(p),
			required: !p.optional,
			default: p.defaultValue,
			deprecated: p.deprecated,
			desc: p.description ?? "",
		}));
}

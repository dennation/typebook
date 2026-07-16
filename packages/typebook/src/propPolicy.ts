import type { PropGroup, PropInfo } from "./types";

/**
 * Groups hidden by default: ARIA, React internals (`ref`/`key`/…), capture-phase events, microdata,
 * RDFa, `data-*`, and every event category except the common interaction ones (mouse/keyboard/
 * focus/form). Shown by default: `global`, `element`, `svg`, those interaction events, and a
 * component's own props (no group). Override per project (global) or per component.
 */
export const DEFAULT_HIDDEN_GROUPS: PropGroup[] = [
	"aria",
	"react",
	"capture",
	"microdata",
	"rdfa",
	"data",
	"event:pointer",
	"event:touch",
	"event:drag",
	"event:wheel",
	"event:scroll",
	"event:clipboard",
	"event:composition",
	"event:selection",
	"event:media",
	"event:image",
	"event:animation",
	"event:transition",
	"event:toggle",
];

export interface PropPolicy {
	/** Groups to hide. Defaults to {@link DEFAULT_HIDDEN_GROUPS} when omitted. */
	hiddenGroups?: PropGroup[];
	/** Prop names to always hide, whatever their group. */
	omit?: string[];
	/** Prop names to always show, even if their group is hidden. */
	pick?: string[];
}

/**
 * Filter a component's props to those that should be documented. `omit` wins over everything;
 * `pick` rescues a prop from a hidden group; otherwise a prop is dropped only when its group is
 * hidden (a prop with no group — the component's own API — is always kept).
 */
export function visibleProps(
	props: PropInfo[],
	policy: PropPolicy = {},
): PropInfo[] {
	const hidden = new Set(policy.hiddenGroups ?? DEFAULT_HIDDEN_GROUPS);
	const omit = new Set(policy.omit);
	const pick = new Set(policy.pick);
	return props.filter((p) => {
		if (omit.has(p.name)) return false;
		if (pick.has(p.name)) return true;
		return !(p.group && hidden.has(p.group));
	});
}

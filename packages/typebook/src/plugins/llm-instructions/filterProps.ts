import type { ComponentInfo, PropGroup, PropInfo } from "../../types";

/** Decides whether a prop appears in a component's card. `true` keeps it. */
export type PropFilter = (prop: PropInfo, component: ComponentInfo) => boolean;

/**
 * Groups hidden by the default filter — everything except `element` (per-tag attributes like
 * `disabled`/`type`/`placeholder`, the real component API). So `global` attributes, every event,
 * ARIA, React internals (`ref`/`key`/…), SVG presentation attributes, microdata/RDFa/`data-*` all
 * drop out. A component's own props (no group) are always kept; single names are rescued with
 * `except` (see {@link DEFAULT_KEPT_PROPS} — `children` lives there). Spread to adjust:
 * `hideGroups([...DEFAULT_HIDDEN_GROUPS])`.
 */
export const DEFAULT_HIDDEN_GROUPS: PropGroup[] = [
	"global",
	"aria",
	"react",
	"svg",
	"capture",
	"microdata",
	"rdfa",
	"data",
	"event:mouse",
	"event:keyboard",
	"event:focus",
	"event:form",
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

/**
 * Names kept even when their group is hidden — the standard attributes still worth documenting:
 * `children` (the content, in the hidden `react` group), `className`/`style` (styling) and `id`.
 */
export const DEFAULT_KEPT_PROPS: string[] = [
	"children",
	"className",
	"style",
	"id",
];

/**
 * A {@link PropFilter} that drops props in `groups`. Own props (no group) are always kept, as are
 * any names in `except` — the second level over groups (e.g. keep `className` out of hidden `global`).
 */
export const hideGroups =
	(groups: PropGroup[], options?: { except?: string[] }): PropFilter =>
	(prop) =>
		prop.group == null ||
		!groups.includes(prop.group) ||
		(options?.except?.includes(prop.name) ?? false);

/** The filter applied when `llmInstructions` gets no `filterProps`. */
export const DEFAULT_PROP_FILTER = hideGroups(DEFAULT_HIDDEN_GROUPS, {
	except: DEFAULT_KEPT_PROPS,
});

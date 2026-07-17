import type { ComponentInfo, PropGroup, PropInfo } from "../../types";

/** Decides whether a prop appears in a component's card. `true` keeps it. */
export type PropFilter = (prop: PropInfo, component: ComponentInfo) => boolean;

/**
 * Groups hidden by the default filter — **every** standard-attribute group, including `element`
 * (per-tag natives, mostly noise in a card: `formEncType`, `popoverTarget`, …). Only a component's
 * **own** props survive by default — they're ungrouped, since `group` is assigned to inherited
 * attributes only — plus the handful of broadly useful native names rescued via `except` (see
 * {@link DEFAULT_KEPT_PROPS}). Spread to adjust: `hideGroups([...DEFAULT_HIDDEN_GROUPS])`.
 */
export const DEFAULT_HIDDEN_GROUPS: PropGroup[] = [
	"global",
	"element",
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
 * the essentials (`children` content, `className`/`style` styling, `id`) and the broadly useful
 * native attributes of form controls, links and labels (a component that forwards them wants them
 * documented). The rare `element` natives (`formEncType`, `popoverTarget`, …) stay hidden.
 */
export const DEFAULT_KEPT_PROPS: string[] = [
	"children",
	"className",
	"style",
	"id",
	"disabled",
	"type",
	"name",
	"value",
	"placeholder",
	"required",
	"readOnly",
	"checked",
	"href",
	"htmlFor",
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

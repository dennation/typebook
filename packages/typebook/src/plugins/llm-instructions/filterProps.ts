import type { ComponentInfo, PropGroup, PropInfo } from "../../types";

/**
 * A prop filter as a **map** — keys are group names ({@link PropGroup}) or prop names, `true` keeps,
 * `false` hides. A prop name wins over its group; an unlisted prop is kept. Merge with object spread
 * to override: `{ ...DEFAULT_PROP_FILTER, formEncType: true, onClick: false }`.
 */
export type PropFilterMap = Record<string, boolean>;

/** A prop filter as a **predicate** — arbitrary per-prop logic. `true` keeps. */
export type PropFilterFn = (
	prop: PropInfo,
	component: ComponentInfo,
) => boolean;

/** Which props a card surfaces — the ergonomic {@link PropFilterMap}, or a {@link PropFilterFn}. */
export type PropFilter = PropFilterMap | PropFilterFn;

/**
 * Groups hidden by the default filter — **every** standard-attribute group, including `element`
 * (per-tag natives, mostly noise in a card: `formEncType`, `popoverTarget`, …). Combined with
 * {@link DEFAULT_KEPT_PROPS}, the default keeps a component's own props plus a handful of broadly
 * useful native names. Spread into a map to adjust: `{ ...hideGroups(DEFAULT_HIDDEN_GROUPS) }`.
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
export const DEFAULT_KEPT_PROPS: PropFilterMap = {
	children: true,
	className: true,
	style: true,
	id: true,
	disabled: true,
	type: true,
	name: true,
	value: true,
	placeholder: true,
	required: true,
	readOnly: true,
	checked: true,
	href: true,
	htmlFor: true,
};

/** Map entries that hide each of `groups`: `hideGroups(["aria"])` → `{ aria: false }`. */
export const hideGroups = (groups: PropGroup[]): PropFilterMap =>
	Object.fromEntries(groups.map((group) => [group, false]));

/** The filter applied when `llmInstructions` gets no `filterProps`. */
export const DEFAULT_PROP_FILTER: PropFilterMap = {
	...hideGroups(DEFAULT_HIDDEN_GROUPS),
	...DEFAULT_KEPT_PROPS,
};

/** Turn a {@link PropFilter} (map or predicate) into a predicate. */
export const asPropFilterFn = (filter: PropFilter): PropFilterFn =>
	typeof filter === "function"
		? filter
		: (prop) =>
				filter[prop.name] ??
				(prop.group != null ? filter[prop.group] : undefined) ??
				true;

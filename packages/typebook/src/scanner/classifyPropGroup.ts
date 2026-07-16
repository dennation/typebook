import type { PropGroup } from "../types";
import {
	ELEMENT,
	EVENT_CATEGORY,
	GLOBAL,
	MICRODATA,
	RDFA,
	REACT,
	SVG,
} from "./propGroups.data";

/**
 * Classify a prop by its NAME into a standard attribute/event group (see {@link PropGroup}), or
 * `undefined` when the name isn't a recognised standard attribute (the component's own API prop).
 * Checked hide-first so an attribute that appears in several specs lands in the more specific one.
 */
export function classifyPropGroup(name: string): PropGroup | undefined {
	if (/^on[A-Z]/.test(name)) {
		const category = EVENT_CATEGORY[name];
		if (category) return category;
		// A `<event>Capture` twin (capture phase) of a known event → the cross-cutting `capture` group.
		if (
			name.endsWith("Capture") &&
			EVENT_CATEGORY[name.slice(0, -"Capture".length)]
		)
			return "capture";
		return undefined;
	}
	if (name === "role" || name.startsWith("aria-")) return "aria";
	if (name.startsWith("data-")) return "data";
	if (REACT.has(name)) return "react";
	if (MICRODATA.has(name)) return "microdata";
	if (RDFA.has(name)) return "rdfa";
	if (GLOBAL.has(name)) return "global";
	if (ELEMENT.has(name)) return "element";
	if (SVG.has(name)) return "svg";
	return undefined;
}

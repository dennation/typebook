import type { Bar } from "./UnionOrderTarget";

export interface UnionOrderUnrelatedProps {
	mode: "disabled" | "other";
	step: 3;
	bar: Bar;
	letter: "yankee" | "kilo";
}

/** Mentions members of `UnionOrderTarget`'s unions, so scanning it first creates their types first. */
export function UnionOrderUnrelated(props: UnionOrderUnrelatedProps) {
	return <div>{props.mode}</div>;
}

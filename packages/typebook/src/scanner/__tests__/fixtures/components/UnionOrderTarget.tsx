interface FieldProps {
	label: string;
	error: string;
	disabled: boolean;
}

export interface Foo {
	foo: string;
}

export interface Bar {
	bar: string;
}

export interface UnionOrderTargetProps {
	/** String literals nested in a utility type. */
	fieldProps?: Omit<FieldProps, "error" | "disabled"> & { extra?: string };
	/** Number literals nested in an array. */
	steps?: Array<1 | 3>;
	/** Object types nested in an array. */
	items?: Array<Foo | Bar>;
	/** Long enough for the checker to elide its middle members by default. */
	letters?: Array<
		| "alfa"
		| "bravo"
		| "charlie"
		| "delta"
		| "echo"
		| "foxtrot"
		| "golf"
		| "hotel"
		| "india"
		| "juliett"
		| "kilo"
		| "lima"
		| "mike"
		| "november"
		| "oscar"
		| "papa"
		| "quebec"
		| "romeo"
		| "sierra"
		| "tango"
		| "uniform"
		| "victor"
		| "whiskey"
		| "xray"
		| "yankee"
		| "zulu"
	>;
}

export function UnionOrderTarget(props: UnionOrderTargetProps) {
	return <div>{props.steps?.length}</div>;
}

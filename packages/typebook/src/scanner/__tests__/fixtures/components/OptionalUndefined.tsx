type Formatter = (value: string) => string;

export interface OptionalUndefinedProps {
	/** Optional alias union — the trailing `| undefined` is redundant with `optional`. */
	format?: Formatter;
	/** Nested `| undefined` (inside the function's return) must be preserved. */
	parse?: (value: string) => string | undefined;
	/** Explicit `null` member stays; only `undefined` is stripped. */
	value?: string | null;
	/** Mixed union (falls through to the raw string) — trailing `| undefined` is dropped. */
	token?: string | number | (() => void);
	/** REQUIRED but explicitly undefinable — `undefined` is meaningful here, must be KEPT. */
	requiredUndefinable: string | undefined;
	/** REQUIRED mixed union with undefined — kept, since the prop is required. */
	requiredMixed: string | number | undefined;
	/** REQUIRED callback unioned with `undefined` — kind is still `function`. */
	requiredCallback: (() => void) | undefined;
}

export function OptionalUndefined(props: OptionalUndefinedProps) {
	return <div>{props.value}</div>;
}

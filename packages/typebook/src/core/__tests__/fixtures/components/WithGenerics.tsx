interface SelectProps<T extends string> {
	value: T;
	options: T[];
	onChange: (value: T) => void;
	placeholder?: string;
}

export function Select<T extends string>(props: SelectProps<T>) {
	return <div>{props.value}</div>;
}

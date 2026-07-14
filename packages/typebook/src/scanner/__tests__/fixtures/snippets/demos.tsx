// Example components referenced by `<Snippet source={…}>` from another module.

export const ButtonDemo = () => <button type="button">Click</button>;

export function Counter() {
	const n = 1;
	return <span>{n}</span>;
}

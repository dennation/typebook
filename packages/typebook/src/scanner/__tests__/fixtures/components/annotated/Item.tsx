/**
 * One list item.
 * @remarks Put it inside a list.
 */
export function Item({
	selected = false,
	label,
}: {
	selected?: boolean;
	label: string;
}) {
	return <li data-selected={selected}>{label}</li>;
}

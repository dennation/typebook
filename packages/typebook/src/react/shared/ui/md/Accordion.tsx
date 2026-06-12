import { Icon } from "@react/shared/ui/icon/index.js";
import { type ReactNode, useEffect, useRef, useState } from "react";

export interface AccordionItem {
	q: string;
	a: ReactNode;
}

export interface AccordionProps {
	items: AccordionItem[];
}

/** Single-open FAQ accordion with animated height. */
export function Accordion({ items }: AccordionProps) {
	const [open, setOpen] = useState<number | null>(null);
	return (
		<div className="border border-border rounded-[var(--radius-token)] overflow-hidden">
			{items.map((it, i) => (
				<AccItem
					key={it.q}
					item={it}
					open={open === i}
					onToggle={() => setOpen(open === i ? null : i)}
				/>
			))}
		</div>
	);
}

function AccItem({
	item,
	open,
	onToggle,
}: {
	item: AccordionItem;
	open: boolean;
	onToggle: () => void;
}) {
	const ref = useRef<HTMLDivElement>(null);
	const [h, setH] = useState(0);
	useEffect(() => {
		setH(open && ref.current ? ref.current.scrollHeight : 0);
	}, [open]);
	return (
		<div className="border-b border-border last:border-b-0">
			<button
				type="button"
				className="flex items-center gap-[12px] w-full px-[17px] py-[15px] bg-transparent border-none text-left text-[14.5px] font-medium text-fg transition-colors duration-[130ms] hover:bg-bg-secondary"
				onClick={onToggle}
				aria-expanded={open}
			>
				{item.q}
				<span
					className={`ml-auto text-fg-subtle transition-transform duration-[200ms] ${open ? "rotate-90" : ""}`}
				>
					<Icon.chevR size={16} />
				</span>
			</button>
			<div
				className="overflow-hidden transition-[height] duration-[220ms] ease-[ease]"
				style={{ height: h }}
			>
				<div
					className="px-[17px] pb-[16px] text-[14.5px] leading-[1.6] text-fg-muted"
					ref={ref}
				>
					{item.a}
				</div>
			</div>
		</div>
	);
}

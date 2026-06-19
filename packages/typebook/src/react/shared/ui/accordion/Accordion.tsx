import { ChevronRight } from "lucide-react";
import { type ReactNode, useEffect, useRef, useState } from "react";
import { tv } from "tailwind-variants";

const chevronCls = tv({
	base: "ml-auto text-fg-subtle transition-transform duration-200",
	variants: {
		open: { true: "rotate-90" },
	},
});

export interface AccordionItem {
	q: string;
	a: ReactNode;
}

export interface AccordionProps {
	/** The questions and answers: { q: string, a: ReactNode }. Questions double as keys, so keep them unique. */
	items: AccordionItem[];
	/** Indicator icon (rotates when open). @default <ChevronRight size={16} /> */
	chevron?: ReactNode;
}

/** Single-open FAQ accordion with animated height. */
export function Accordion({
	items,
	chevron = <ChevronRight size={16} />,
}: AccordionProps) {
	const [open, setOpen] = useState<number | null>(null);
	return (
		<div className="border border-border rounded-(--radius-token) overflow-hidden">
			{items.map((it, i) => (
				<AccItem
					key={it.q}
					item={it}
					chevron={chevron}
					open={open === i}
					onToggle={() => setOpen(open === i ? null : i)}
				/>
			))}
		</div>
	);
}

function AccItem({
	item,
	chevron,
	open,
	onToggle,
}: {
	item: AccordionItem;
	chevron: ReactNode;
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
				className="flex items-center gap-3 w-full px-4.25 py-3.75 bg-transparent border-none text-left text-[14.5px] font-medium text-fg transition-colors duration-130 hover:bg-bg-secondary"
				onClick={onToggle}
				aria-expanded={open}
			>
				{item.q}
				<span className={chevronCls({ open })}>{chevron}</span>
			</button>
			<div
				className="overflow-hidden transition-[height] duration-220 ease-[ease]"
				style={{ height: h }}
			>
				<div
					className="px-4.25 pb-4 text-[14.5px] leading-[1.6] text-fg-muted"
					ref={ref}
				>
					{item.a}
				</div>
			</div>
		</div>
	);
}

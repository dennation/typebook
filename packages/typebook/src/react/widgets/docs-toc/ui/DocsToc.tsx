import { Icon } from "@react/shared/ui/icon/index.js";
import { tv } from "tailwind-variants";
import type { DocsHeading } from "../lib/useDocHeadings.js";

export interface DocsTocProps {
	headings: DocsHeading[];
	activeId: string | null;
	onJump: (id: string) => void;
	editHref?: string;
	issueHref?: string;
}

const docsToc = tv({
	slots: {
		aside:
			"sticky top-14 h-[calc(100vh-56px)] overflow-y-auto pt-10 pr-5.5 pb-15 pl-2 max-[1100px]:hidden",
		link: "text-[13px] px-3 py-1.25 -ml-px border-0 border-l-2 bg-transparent text-left transition-colors duration-130 leading-[1.4]",
	},
	variants: {
		level: {
			3: { link: "pl-6 text-[12.5px]" },
		},
		active: {
			true: { link: "text-accent border-accent font-medium" },
			false: { link: "text-fg-muted border-transparent hover:text-fg" },
		},
	},
});

/** Right-hand "On this page" outline with scrollspy highlight. */
export function DocsToc({
	headings,
	activeId,
	onJump,
	editHref,
	issueHref,
}: DocsTocProps) {
	const { aside, link } = docsToc();
	if (!headings.length) return <aside className={aside()} />;
	return (
		<aside className={aside()}>
			<div className="text-[11px] font-semibold tracking-[0.06em] uppercase text-fg-subtle mb-3 flex items-center gap-2">
				<Icon.hash size={13} /> On this page
			</div>
			<div className="flex flex-col gap-px border-l border-border">
				{headings.map((h) => (
					<button
						key={h.id}
						type="button"
						className={link({
							level: h.level === 3 ? 3 : undefined,
							active: h.id === activeId,
						})}
						onClick={() => onJump(h.id)}
					>
						{h.text}
					</button>
				))}
			</div>
			<div className="mt-6 pt-4.5 border-t border-border flex flex-col gap-2">
				<a
					href={editHref ?? "#"}
					className="text-[12.5px] text-fg-subtle inline-flex items-center gap-2 transition-colors duration-130 hover:text-accent"
					onClick={(e) => !editHref && e.preventDefault()}
				>
					<Icon.edit size={13} /> Edit this page
				</a>
				<a
					href={issueHref ?? "#"}
					className="text-[12.5px] text-fg-subtle inline-flex items-center gap-2 transition-colors duration-130 hover:text-accent"
					onClick={(e) => !issueHref && e.preventDefault()}
				>
					<Icon.github size={13} /> Report an issue
				</a>
			</div>
		</aside>
	);
}

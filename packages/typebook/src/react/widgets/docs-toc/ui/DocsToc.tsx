import { cx } from "@react/shared/lib/cx.js";
import { Icon } from "@react/shared/ui/icon/index.js";
import type { DocsHeading } from "../lib/useDocHeadings.js";

export interface DocsTocProps {
	headings: DocsHeading[];
	activeId: string | null;
	onJump: (id: string) => void;
	editHref?: string;
	issueHref?: string;
}

/** Right-hand "On this page" outline with scrollspy highlight. */
export function DocsToc({
	headings,
	activeId,
	onJump,
	editHref,
	issueHref,
}: DocsTocProps) {
	const base =
		"sticky top-[56px] h-[calc(100vh-56px)] overflow-y-auto pt-[40px] pr-[22px] pb-[60px] pl-[8px] max-[1100px]:hidden";
	if (!headings.length) return <aside className={base} />;
	return (
		<aside className={base}>
			<div className="text-[11px] font-semibold tracking-[0.06em] uppercase text-fg-subtle mb-[12px] flex items-center gap-[8px]">
				<Icon.hash size={13} /> On this page
			</div>
			<div className="flex flex-col gap-[1px] border-l border-border">
				{headings.map((h) => {
					const active = h.id === activeId;
					return (
						<button
							key={h.id}
							type="button"
							className={cx(
								"text-[13px] px-[12px] py-[5px] -ml-px border-0 border-l-2 bg-transparent text-left transition-colors duration-[130ms] leading-[1.4]",
								h.level === 3 && "pl-[24px] text-[12.5px]",
								active
									? "text-accent border-accent font-medium"
									: "text-fg-muted border-transparent hover:text-fg",
							)}
							onClick={() => onJump(h.id)}
						>
							{h.text}
						</button>
					);
				})}
			</div>
			<div className="mt-[24px] pt-[18px] border-t border-border flex flex-col gap-[8px]">
				<a
					href={editHref ?? "#"}
					className="text-[12.5px] text-fg-subtle inline-flex items-center gap-[8px] transition-colors duration-[130ms] hover:text-accent"
					onClick={(e) => !editHref && e.preventDefault()}
				>
					<Icon.edit size={13} /> Edit this page
				</a>
				<a
					href={issueHref ?? "#"}
					className="text-[12.5px] text-fg-subtle inline-flex items-center gap-[8px] transition-colors duration-[130ms] hover:text-accent"
					onClick={(e) => !issueHref && e.preventDefault()}
				>
					<Icon.github size={13} /> Report an issue
				</a>
			</div>
		</aside>
	);
}

import {
	ChevronsUpDown,
	CornerDownLeft,
	FileText,
	Hash,
	Search,
} from "lucide-react";
import { type ReactNode, useEffect, useMemo, useRef, useState } from "react";
import { tv } from "tailwind-variants";
import type { SearchEntry } from "./types";

export interface SearchPaletteProps {
	/** The search index to query. */
	index: SearchEntry[];
	/** Called on Escape, backdrop click or after choosing a result. */
	onClose: () => void;
	/** Navigation callback — the palette knows nothing about your router. */
	onNavigate: (slug: string, heading?: string) => void;
	/** Icon in the search input. @default <Search size={19} /> */
	searchIcon?: ReactNode;
	/** Icon for a heading result. @default <Hash size={16} /> */
	headingIcon?: ReactNode;
	/** Icon for a page result. @default <FileText size={16} /> */
	pageIcon?: ReactNode;
	/** Icon in the per-result "enter" hint. @default <CornerDownLeft size={15} /> */
	enterIcon?: ReactNode;
	/** Icon in the footer "navigate" hint. @default <ChevronsUpDown size={11} /> */
	navIcon?: ReactNode;
}

interface ScoredEntry extends SearchEntry {
	score: number;
}

interface ResultGroup {
	section: string;
	items: ScoredEntry[];
}

const kbd = tv({
	base: "font-mono text-[10px] bg-bg border border-border rounded-sm px-1.25 py-px min-w-4.5 text-center",
});

const result = tv({
	slots: {
		row: "flex items-center gap-3 w-full px-3 py-2.5 rounded-[9px] text-left bg-transparent border-none transition-colors duration-100",
		icon: "shrink-0 inline-flex",
		title: "text-[14px] font-medium flex items-center gap-1.75",
		enter: "inline-flex",
	},
	variants: {
		active: {
			true: {
				row: "bg-accent-soft text-accent",
				icon: "text-accent",
				title: "text-accent",
				enter: "opacity-100 text-accent",
			},
			false: {
				row: "text-fg-muted",
				icon: "text-fg-subtle",
				title: "text-fg",
				enter: "opacity-0 text-fg-subtle",
			},
		},
	},
});

/** ⌘K command palette: fuzzy page/heading search with keyboard navigation. */
export function SearchPalette({
	index,
	onClose,
	onNavigate,
	searchIcon = <Search size={19} />,
	headingIcon = <Hash size={16} />,
	pageIcon = <FileText size={16} />,
	enterIcon = <CornerDownLeft size={15} />,
	navIcon = <ChevronsUpDown size={11} />,
}: SearchPaletteProps) {
	const [q, setQ] = useState("");
	const [active, setActive] = useState(0);
	const inputRef = useRef<HTMLInputElement>(null);
	const listRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		inputRef.current?.focus();
	}, []);

	const results = useMemo<ScoredEntry[]>(() => {
		const term = q.trim().toLowerCase();
		if (!term) return index.map((r) => ({ ...r, score: 0 }));
		return index
			.map((r) => {
				const hay = `${r.title} ${r.section} ${r.desc}`.toLowerCase();
				let score = 0;
				if (r.title.toLowerCase().startsWith(term)) score += 10;
				if (r.title.toLowerCase().includes(term)) score += 5;
				if (hay.includes(term)) score += 2;
				return { ...r, score };
			})
			.filter((r) => r.score > 0)
			.sort((a, b) => b.score - a.score);
	}, [q, index]);

	// biome-ignore lint/correctness/useExhaustiveDependencies: reset selection on new query
	useEffect(() => {
		setActive(0);
	}, [q]);

	const choose = (r: SearchEntry) => {
		onNavigate(r.slug, r.heading);
		onClose();
	};

	const onKey = (e: React.KeyboardEvent) => {
		if (e.key === "ArrowDown") {
			e.preventDefault();
			setActive((a) => Math.min(a + 1, results.length - 1));
		} else if (e.key === "ArrowUp") {
			e.preventDefault();
			setActive((a) => Math.max(a - 1, 0));
		} else if (e.key === "Enter") {
			e.preventDefault();
			const r = results[active];
			if (r) choose(r);
		}
	};

	// biome-ignore lint/correctness/useExhaustiveDependencies: re-run when the selection moves
	useEffect(() => {
		const el = listRef.current?.querySelector("[data-cmdk-active]");
		el?.scrollIntoView?.({ block: "nearest" });
	}, [active]);

	// group by section, preserving sorted order
	const groups: ResultGroup[] = [];
	for (const r of results) {
		const g = groups.find((x) => x.section === r.section);
		if (g) g.items.push(r);
		else groups.push({ section: r.section, items: [r] });
	}
	let flatIdx = -1;

	const highlightText = (text: string): ReactNode => {
		const term = q.trim();
		if (!term) return text;
		const i = text.toLowerCase().indexOf(term.toLowerCase());
		if (i < 0) return text;
		return (
			<>
				{text.slice(0, i)}
				<span className="text-accent font-semibold bg-accent-soft rounded-[3px] px-px">
					{text.slice(i, i + term.length)}
				</span>
				{text.slice(i + term.length)}
			</>
		);
	};

	return (
		// biome-ignore lint/a11y/noStaticElementInteractions: backdrop click-to-close; Escape handles keyboard
		<div
			className="fixed inset-0 z-100 bg-[color-mix(in_oklch,var(--bg)_30%,oklch(0.2_0.02_270/0.5))] backdrop-blur-[3px] flex justify-center items-start pt-[13vh] opacity-0 animate-[cmdkIn_.14s_ease_forwards]"
			onMouseDown={(e) => e.target === e.currentTarget && onClose()}
		>
			<div
				className="w-[min(620px,calc(100vw-32px))] bg-bg border border-border-strong rounded-[14px] shadow-lg overflow-hidden scale-[0.98] animate-[cmdkPop_.16s_ease_forwards]"
				onKeyDown={onKey}
				role="dialog"
				aria-label="Search documentation"
			>
				<div className="flex items-center gap-2.75 px-4.5 py-3.75 border-b border-border">
					<span className="text-fg-subtle shrink-0 inline-flex">
						{searchIcon}
					</span>
					<input
						ref={inputRef}
						className="flex-1 border-none outline-none bg-transparent font-[inherit] text-[16px] text-fg placeholder:text-fg-subtle"
						placeholder="Search documentation…"
						value={q}
						onChange={(e) => setQ(e.target.value)}
					/>
					<span className="font-mono text-[11px] text-fg-muted border border-border rounded-[5px] px-1.5 py-0.5">
						ESC
					</span>
				</div>
				<div className="max-h-[52vh] overflow-y-auto p-2" ref={listRef}>
					{results.length === 0 && (
						<div className="px-5 py-11 text-center text-fg-subtle text-[14px]">
							No results for <span className="text-fg font-medium">"{q}"</span>
						</div>
					)}
					{groups.map((g) => (
						<div key={g.section}>
							<div className="text-[11px] font-semibold tracking-[0.05em] uppercase text-fg-subtle px-3 pt-2.5 pb-1.25">
								{g.section}
							</div>
							{g.items.map((r) => {
								flatIdx++;
								const idx = flatIdx;
								const isActive = idx === active;
								const styles = result({ active: isActive });
								return (
									<button
										key={r.slug + (r.heading ?? "")}
										type="button"
										data-cmdk-active={isActive ? "" : undefined}
										className={styles.row()}
										onMouseEnter={() => setActive(idx)}
										onClick={() => choose(r)}
									>
										<span className={styles.icon()}>
											{r.heading ? headingIcon : pageIcon}
										</span>
										<span className="min-w-0 flex-1">
											<span className={styles.title()}>
												{highlightText(r.title)}
											</span>
											{r.desc && (
												<span className="text-[12px] text-fg-subtle mt-px block">
													{r.desc}
												</span>
											)}
										</span>
										<span className={styles.enter()}>{enterIcon}</span>
									</button>
								);
							})}
						</div>
					))}
				</div>
				<div className="flex items-center gap-4 px-4 py-2.5 border-t border-border bg-bg-secondary text-[12px] text-fg-subtle">
					<span className="flex items-center gap-1.5">
						<kbd className={kbd({ className: "inline-flex justify-center" })}>
							{navIcon}
						</kbd>{" "}
						navigate
					</span>
					<span className="flex items-center gap-1.5">
						<kbd className={kbd({ className: "inline-block" })}>↵</kbd> open
					</span>
					<span className="flex items-center gap-1.5">
						<kbd className={kbd({ className: "inline-block" })}>esc</kbd> close
					</span>
					<span className="ml-auto">
						{results.length} result{results.length === 1 ? "" : "s"}
					</span>
				</div>
			</div>
		</div>
	);
}

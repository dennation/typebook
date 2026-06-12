import { CONTAINER } from "../shared/lib/landingLayout.js";

export interface SiteFooterProps {
	/** Link target used for the "Introduction" link. */
	docsHref?: string;
}

const COLS = [
	{ h: "Product", links: ["Features", "Components", "Showcase", "Changelog"] },
	{
		h: "Docs",
		links: ["Introduction", "Installation", "Theming", "API Reference"],
	},
	{
		h: "Community",
		links: ["GitHub", "Discord", "X / Twitter", "Discussions"],
	},
] as const;

/** Marketing site footer. */
export function SiteFooter({ docsHref = "#" }: SiteFooterProps) {
	return (
		<footer className="border-t border-border pt-[60px] pb-[40px]">
			<div className={CONTAINER}>
				<div className="grid grid-cols-[1.6fr_1fr_1fr_1fr] gap-[40px] mb-[48px] max-[860px]:grid-cols-2 max-[860px]:gap-[32px]">
					<div className="max-[860px]:col-span-2">
						<a
							className="flex items-center gap-[10px] font-semibold tracking-[-0.02em] text-[15px] mb-[14px]"
							href="#top"
						>
							<span className="w-[26px] h-[26px] rounded-[7px] bg-fg text-bg grid place-items-center font-mono font-semibold text-[14px] shrink-0">
								T
							</span>
							Typebok
						</a>
						<p className="text-[13.5px] text-fg-muted leading-[1.6] max-w-[30ch] m-0">
							The content-first documentation framework for React. Open source,
							MIT licensed.
						</p>
					</div>
					{COLS.map((c) => (
						<div key={c.h}>
							<h4 className="text-[12px] font-semibold tracking-[0.05em] uppercase text-fg-subtle m-0 mb-[16px]">
								{c.h}
							</h4>
							{c.links.map((l) => (
								<a
									className="block text-[14px] text-fg-muted py-[5px] transition-colors duration-[130ms] hover:text-accent"
									href={l === "Introduction" ? docsHref : "#top"}
									key={l}
								>
									{l}
								</a>
							))}
						</div>
					))}
				</div>
				<div className="flex items-center justify-between pt-[28px] border-t border-border text-[13px] text-fg-subtle max-[620px]:flex-col max-[620px]:gap-[16px] max-[620px]:text-center">
					<span>© 2026 Typebok. Released under the MIT License.</span>
					<div className="flex gap-[18px]">
						<a className="hover:text-fg-muted" href="#top">
							Privacy
						</a>
						<a className="hover:text-fg-muted" href="#top">
							Terms
						</a>
						<a className="hover:text-fg-muted" href="#top">
							Status
						</a>
					</div>
				</div>
			</div>
		</footer>
	);
}

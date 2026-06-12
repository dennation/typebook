import type { ReactNode } from 'react'

export interface SectionHeadProps {
	/** Small monospace eyebrow above the title. */
	kicker: ReactNode
	/** Section title. */
	title: ReactNode
	/** Supporting paragraph below the title. */
	sub: ReactNode
}

/** Centered section heading (eyebrow + title + subtitle) used across landing sections. */
export function SectionHead({ kicker, title, sub }: SectionHeadProps) {
	return (
		<div className="max-w-[640px] mb-[56px] mx-auto text-center reveal">
			<div className="inline-flex items-center gap-[8px] font-mono text-[12px] font-semibold tracking-[0.04em] text-accent uppercase mb-[16px]">
				{kicker}
			</div>
			<h2 className="text-[clamp(30px,4vw,42px)] font-[660] tracking-[-0.03em] leading-[1.08] m-0 mb-[16px] [text-wrap:balance]">
				{title}
			</h2>
			<p className="text-[17px] leading-[1.6] text-fg-muted m-0 [text-wrap:pretty]">{sub}</p>
		</div>
	)
}

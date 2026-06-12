import { useReveal } from "../shared/lib/useReveal.js";
import { LandingCompare } from "./LandingCompare.js";
import { LandingCta } from "./LandingCta.js";
import { LandingFeatures } from "./LandingFeatures.js";
import { LandingHero } from "./LandingHero.js";
import { LandingStats } from "./LandingStats.js";
import { SiteFooter } from "./SiteFooter.js";

export interface LandingProps {
	/** Link target for "Docs"/"Get started" CTAs across the page. */
	docsHref?: string;
	/** Install command shown in the copy pills. */
	command?: string;
}

/** The full Typebok marketing landing page, composed from its sections.
    The site header is rendered by the root layout. */
export function Landing({ docsHref = "#", command }: LandingProps) {
	useReveal();
	return (
		<div>
			<main>
				<LandingHero docsHref={docsHref} command={command} />
				<LandingFeatures />
				<LandingCompare />
				<LandingStats />
				<LandingCta docsHref={docsHref} command={command} />
			</main>
			<SiteFooter docsHref={docsHref} />
		</div>
	);
}

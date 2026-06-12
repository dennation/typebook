import { useReveal } from "../shared/lib/useReveal.js";
import { LandingCompare } from "./LandingCompare.js";
import { LandingCta } from "./LandingCta.js";
import { LandingFeatures } from "./LandingFeatures.js";
import { LandingHero } from "./LandingHero.js";
import { LandingStats } from "./LandingStats.js";
import { SiteFooter } from "./SiteFooter.js";
import { SiteHeader } from "./SiteHeader.js";

export interface LandingProps {
	/** Link target for "Docs"/"Get started" CTAs across the page. */
	docsHref?: string;
	/** GitHub repository URL used in the header. */
	githubHref?: string;
	/** Install command shown in the copy pills. */
	command?: string;
}

/** The full Typebok marketing landing page, composed from its sections. */
export function Landing({
	docsHref = "#",
	githubHref = "#",
	command,
}: LandingProps) {
	useReveal();
	return (
		<div>
			<SiteHeader docsHref={docsHref} githubHref={githubHref} />
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

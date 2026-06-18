import { useReveal } from "../shared/lib/useReveal";
import { LandingCompare } from "./LandingCompare";
import { LandingCta } from "./LandingCta";
import { LandingFeatures } from "./LandingFeatures";
import { LandingHero } from "./LandingHero";
import { LandingStats } from "./LandingStats";
import { SiteFooter } from "./SiteFooter";

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

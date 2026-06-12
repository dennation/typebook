import type { ComponentType } from "react";
import type { DocsGo } from "../go.js";
import { PageCallout } from "./PageCallout.js";
import { PageInstallation } from "./PageInstallation.js";
import { PageIntroduction } from "./PageIntroduction.js";
import { PageMarkdown } from "./PageMarkdown.js";
import { PageQuickStart } from "./PageQuickStart.js";

export { GenericPage } from "./GenericPage.js";

/** Bespoke page content by slug; other slugs fall back to GenericPage. */
export const PAGES: Record<string, ComponentType<{ go: DocsGo }>> = {
	introduction: PageIntroduction,
	installation: PageInstallation,
	"quick-start": PageQuickStart,
	markdown: PageMarkdown,
	callout: PageCallout,
};

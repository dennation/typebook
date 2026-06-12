import type { ComponentType } from "react";
import type { DocsGo } from "../go.js";
import { PageAccordion } from "./PageAccordion.js";
import { PageBundlerPlugin } from "./PageBundlerPlugin.js";
import { PageCallout } from "./PageCallout.js";
import { PageCards } from "./PageCards.js";
import { PageCodeBlock } from "./PageCodeBlock.js";
import { PageCopyCommand } from "./PageCopyCommand.js";
import { PageHooks } from "./PageHooks.js";
import { PageInstallation } from "./PageInstallation.js";
import { PageIntroduction } from "./PageIntroduction.js";
import { PageMatrix } from "./PageMatrix.js";
import { PageNavigation } from "./PageNavigation.js";
import { PagePlayground } from "./PagePlayground.js";
import { PageProse } from "./PageProse.js";
import { PageQuickStart } from "./PageQuickStart.js";
import { PageRegister } from "./PageRegister.js";
import { PageSearch } from "./PageSearch.js";
import { PageSnippet } from "./PageSnippet.js";
import { PageSteps } from "./PageSteps.js";
import { PageStory } from "./PageStory.js";
import { PageTables } from "./PageTables.js";
import { PageTabs } from "./PageTabs.js";
import { PageTheming } from "./PageTheming.js";
import { PageVariantHelpers } from "./PageVariantHelpers.js";
import { PageVariants } from "./PageVariants.js";

export { GenericPage } from "./GenericPage.js";

/** Page content by slug — one component per docs page. */
export const PAGES: Record<string, ComponentType<{ go: DocsGo }>> = {
	introduction: PageIntroduction,
	installation: PageInstallation,
	"quick-start": PageQuickStart,
	theming: PageTheming,
	story: PageStory,
	variants: PageVariants,
	matrix: PageMatrix,
	playground: PagePlayground,
	snippet: PageSnippet,
	callout: PageCallout,
	"code-block": PageCodeBlock,
	tabs: PageTabs,
	steps: PageSteps,
	cards: PageCards,
	accordion: PageAccordion,
	tables: PageTables,
	prose: PageProse,
	search: PageSearch,
	navigation: PageNavigation,
	"copy-command": PageCopyCommand,
	register: PageRegister,
	"variant-helpers": PageVariantHelpers,
	"bundler-plugin": PageBundlerPlugin,
	hooks: PageHooks,
};

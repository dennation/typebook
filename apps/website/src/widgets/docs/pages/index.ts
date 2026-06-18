import type { ComponentType } from "react";
import type { DocsGo } from "../go";
import { PageAccordion } from "./PageAccordion";
import { PageButton } from "./PageButton";
import { PageCallout } from "./PageCallout";
import { PageCards } from "./PageCards";
import { PageCodeBlock } from "./PageCodeBlock";
import { PageCopyCommand } from "./PageCopyCommand";
import { PageErrorBoundary } from "./PageErrorBoundary";
import { PageIcon } from "./PageIcon";
import { PageInstallation } from "./PageInstallation";
import { PageIntroduction } from "./PageIntroduction";
import { PageLayout } from "./PageLayout";
import { PageMatrix } from "./PageMatrix";
import { PageNavigation } from "./PageNavigation";
import { PagePlayground } from "./PagePlayground";
import { PageProse } from "./PageProse";
import { PageQuickStart } from "./PageQuickStart";
import { PageSearch } from "./PageSearch";
import { PageSnippet } from "./PageSnippet";
import { PageSteps } from "./PageSteps";
import { PageStory } from "./PageStory";
import { PageTables } from "./PageTables";
import { PageTabs } from "./PageTabs";
import { PageThemeToggle } from "./PageThemeToggle";
import { PageTheming } from "./PageTheming";
import { PageVariants } from "./PageVariants";

export { GenericPage } from "./GenericPage";

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
	layout: PageLayout,
	button: PageButton,
	icon: PageIcon,
	"theme-toggle": PageThemeToggle,
	"error-boundary": PageErrorBoundary,
};

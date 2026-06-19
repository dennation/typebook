import { Menu } from "@dennation/menu/react";
import { Icon } from "@dennation/typebook/react";
import {
	COMPONENTS,
	GETTING_STARTED,
	GUIDES,
	STORYBOOK,
} from "../../../entities/docs/nav";
import { SidebarSection } from "./SidebarSection";
import { SidebarShell } from "./SidebarShell";
import { sidebarMenu } from "./sidebarMenu";

export interface DocsSidebarProps {
	/** Mobile drawer state. */
	open: boolean;
	onClose: () => void;
}

/**
 * The docs sidebar. Sections are written out explicitly here; each one's items
 * are rendered through `@dennation/menu`, whose `Item` is a router `<Link>`.
 */
export function DocsSidebar({ open, onClose }: DocsSidebarProps) {
	return (
		<SidebarShell open={open} onClose={onClose}>
			<SidebarSection icon={<Icon.rocket size={14} />} label="Getting Started">
				<Menu menu={GETTING_STARTED} components={sidebarMenu} />
			</SidebarSection>
			<SidebarSection icon={<Icon.box size={14} />} label="Storybook">
				<Menu menu={STORYBOOK} components={sidebarMenu} />
			</SidebarSection>
			<SidebarSection icon={<Icon.book size={14} />} label="Guides">
				<Menu menu={GUIDES} components={sidebarMenu} />
			</SidebarSection>
			<SidebarSection icon={<Icon.layers size={14} />} label="Components">
				<Menu menu={COMPONENTS} components={sidebarMenu} />
			</SidebarSection>
		</SidebarShell>
	);
}

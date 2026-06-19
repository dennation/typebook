import { Menu } from "@dennation/menu/react";
import { Book, Layers, Rocket } from "lucide-react";
import {
	COMPONENTS,
	GETTING_STARTED,
	GUIDES,
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
			<SidebarSection icon={<Rocket size={14} />} label="Getting Started">
				<Menu menu={GETTING_STARTED} components={sidebarMenu} />
			</SidebarSection>
			<SidebarSection icon={<Book size={14} />} label="Guides">
				<Menu menu={GUIDES} components={sidebarMenu} />
			</SidebarSection>
			<SidebarSection icon={<Layers size={14} />} label="Components">
				<Menu menu={COMPONENTS} components={sidebarMenu} />
			</SidebarSection>
		</SidebarShell>
	);
}

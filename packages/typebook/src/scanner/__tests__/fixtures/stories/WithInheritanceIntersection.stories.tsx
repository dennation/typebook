import { getComponentMeta } from "@dennation/typebook/react";
import { IntersectionLink } from "../components/WithInheritance";

export const comp = getComponentMeta(IntersectionLink, {
	defaultProps: { id: "link-1", href: "/" },
	pick: ["id", "className", "href", "target"],
});

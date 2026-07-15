import { defineStories } from "@dennation/typebook/react";
import { IntersectionLink } from "../components/WithInheritance";

export const comp = defineStories(IntersectionLink, {
	defaultProps: { id: "link-1", href: "/" },
});

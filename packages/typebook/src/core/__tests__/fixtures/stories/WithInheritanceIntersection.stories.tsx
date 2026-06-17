import { registerComponent } from "@dennation/typebook";
import { IntersectionLink } from "../components/WithInheritance";

export const comp = registerComponent(IntersectionLink,
	{
		defaultProps: { id: "link-1", href: "/" },
		pick: ["id", "className", "href", "target"],
	},
);

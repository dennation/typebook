import { defineStories } from "@dennation/typebook/react";
import { ExtendedButton } from "../components/WithInheritance";

export const comp = defineStories(ExtendedButton, {
	defaultProps: { id: "btn-1" },
});

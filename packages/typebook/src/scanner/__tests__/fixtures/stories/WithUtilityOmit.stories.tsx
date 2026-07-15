import { defineStories } from "@dennation/typebook/react";
import { OmittedComponent } from "../components/WithUtilityTypes";

export const comp = defineStories(OmittedComponent, {
	defaultProps: { a: "hello" },
});

import { defineStories } from "@dennation/typebook/react";
import { PickedComponent } from "../components/WithUtilityTypes";

export const comp = defineStories(PickedComponent, {
	defaultProps: { a: "hello" },
});

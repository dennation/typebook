import { defineStories } from "@dennation/typebook/react";
import { Select } from "../components/WithGenerics";

export const select = defineStories(Select<"alpha" | "beta" | "gamma">, {
	defaultProps: {
		value: "alpha",
		options: ["alpha", "beta", "gamma"],
		onChange: () => {},
	},
});

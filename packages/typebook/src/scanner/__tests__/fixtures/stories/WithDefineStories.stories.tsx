import { defineStories } from "@dennation/typebook/react";
import { Basic } from "../components/Basic";

export const BasicStories = defineStories(Basic, {
	defaultProps: { label: "Hi" },
});

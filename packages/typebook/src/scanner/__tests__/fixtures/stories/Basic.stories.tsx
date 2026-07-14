import { getComponentMeta } from "@dennation/typebook/react";
import { Basic } from "../components/Basic";

export const basic = getComponentMeta(Basic, {
	defaultProps: { label: "Hello" },
	pick: ["size", "variant", "disabled", "label", "count"],
});

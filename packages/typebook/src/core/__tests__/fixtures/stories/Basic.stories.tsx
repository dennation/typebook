import { registerComponent } from "@dennation/typebook";
import { Basic } from "../components/Basic";

export const basic = registerComponent(Basic, {
	defaultProps: { label: "Hello" },
	pick: ["size", "variant", "disabled", "label", "count"],
});

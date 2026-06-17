import { registerComponent as reg } from "@dennation/typebook";
import { Basic } from "../components/Basic";

// Aliased import: the scanner resolves `reg` back to registerComponent, and the
// TS client must still locate this call by offset (not by callee name).
export const aliased = reg(Basic, {
	defaultProps: { label: "Hello" },
});

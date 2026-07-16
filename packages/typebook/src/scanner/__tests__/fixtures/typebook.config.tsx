import { defineTypebook } from "../../../config";
import { Basic } from "./components/Basic";
import { WithChildren } from "./components/WithChildren";

export default defineTypebook({
	components: [Basic, { component: WithChildren, omit: ["icon"] }],
});

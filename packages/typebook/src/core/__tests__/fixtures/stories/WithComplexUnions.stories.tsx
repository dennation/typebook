import { registerComponent } from "@dennation/typebook";
import { ComplexUnion } from "../components/WithComplexUnions";

export const comp = registerComponent(ComplexUnion, {
	defaultProps: {
		mixed: "hello",
		numLiteral: 1,
		singleLiteral: "only",
		boolOrString: true,
		wide: "a",
	},
	pick: ["mixed", "numLiteral", "singleLiteral", "boolOrString", "wide"],
});

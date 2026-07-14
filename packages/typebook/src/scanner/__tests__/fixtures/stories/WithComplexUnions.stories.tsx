import { getComponentMeta } from "@dennation/typebook/react";
import { ComplexUnion } from "../components/WithComplexUnions";

export const comp = getComponentMeta(ComplexUnion, {
	defaultProps: {
		mixed: "hello",
		numLiteral: 1,
		singleLiteral: "only",
		boolOrString: true,
		wide: "a",
	},
	pick: ["mixed", "numLiteral", "singleLiteral", "boolOrString", "wide"],
});

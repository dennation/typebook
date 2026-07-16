import { defineTypebook } from "../../../config";
// WithInheritance.tsx exports both ExtendedButton and IntersectionLink; list only one.
import { ExtendedButton } from "./components/WithInheritance";

export default defineTypebook({ components: [ExtendedButton] });

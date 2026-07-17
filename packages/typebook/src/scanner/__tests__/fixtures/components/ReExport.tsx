// A barrel that re-exports a component declared in another module. The scan should attribute the
// component's `file` to Basic.tsx (its declaration) but `sourceFile` to this file (the scanned one).
export { Basic } from "./Basic";

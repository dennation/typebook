// Type-only entry. The runtime authoring API (getComponentMeta, allOf, values,
// generate) and the React runtime live in `@dennation/typebook/react`; bundler
// plugins live in `@dennation/typebook/{vite,rollup,…}`. This entry exists so
// types (e.g. TypebookConfig for a bundler config) are reachable without React.
export type {
	AllOfConfig,
	GenerateConfig,
	MetaConfigBase,
	MetaConfigOmit,
	MetaConfigPick,
	MissingProps,
	PropInfo,
	PropType,
	TypebookConfig,
	ValuesConfig,
	VariantConfig,
} from "./types";

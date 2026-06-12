declare module "*.md" {
	import type { FC } from "react";
	const MDXContent: FC;
	export default MDXContent;
}

declare module "*.mdx" {
	import type { FC } from "react";
	const MDXContent: FC;
	export default MDXContent;
}

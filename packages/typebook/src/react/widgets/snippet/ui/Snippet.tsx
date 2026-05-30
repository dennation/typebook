import { type ReactNode, useState } from 'react'
import { CodeBlock, type CodeTheme } from '@react/features/code-block/index.js'
import { useSnippet } from '@react/entities/snippets/index.js'

export interface SnippetProps {
	/**
	 * Author-chosen identifier for this block. At build time the plugin extracts
	 * the children's source into the generated `snippets.gen.ts` under this key;
	 * at runtime the component reads it back from context. Must be unique across
	 * the project. (Not `key` — reserved by React; not `codeId` — by request.)
	 */
	name: string
	/** Live content rendered above the "show source" toggle. */
	children: ReactNode
	/** Shiki light/dark theme override forwarded to the underlying CodeBlock. */
	theme?: CodeTheme
}

/**
 * Renders its children live, plus a toggle that reveals the original source the
 * build step extracted for `name`. The source is read synchronously from the
 * `TypebookProvider` context — no runtime fetch.
 */
export function Snippet({ name, children, theme }: SnippetProps) {
	const [open, setOpen] = useState(false)
	const code = useSnippet(name)

	return (
		<div className="st:border st:border-border st:rounded-lg st:overflow-hidden">
			<div className="st:p-4">{children}</div>
			<div className="st:border-t st:border-border">
				<button
					type="button"
					onClick={() => setOpen((o) => !o)}
					aria-expanded={open}
					className="st:w-full st:text-left st:text-xs st:px-3 st:py-2 st:font-medium st:text-text-muted hover:st:text-text st:bg-bg-sidebar st:cursor-pointer st:transition-colors"
				>
					{open ? 'Hide source' : 'Show source'}
				</button>
				{open && (
					<div className="st:border-t st:border-border">
						{code !== undefined ? (
							<CodeBlock code={code} theme={theme} />
						) : (
							<p className="st:text-xs st:text-text-muted st:p-3 st:m-0">
								No source found for snippet "{name}". Pass <code>snippets</code> to{' '}
								<code>TypebookProvider</code> and run the build.
							</p>
						)}
					</div>
				)}
			</div>
		</div>
	)
}

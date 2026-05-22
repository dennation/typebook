import { existsSync, readFileSync, writeFileSync } from 'node:fs'

/**
 * Write `content` to `filePath` only if it differs from what's already on disk.
 * Prevents spurious watcher events when a regen produces identical output.
 */
export function writeIfChanged(filePath: string, content: string): void {
	const existing = existsSync(filePath) ? readFileSync(filePath, 'utf-8') : ''
	if (content !== existing) {
		writeFileSync(filePath, content, 'utf-8')
	}
}

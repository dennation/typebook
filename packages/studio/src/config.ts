import { existsSync } from 'node:fs'
import { resolve } from 'node:path'
import { bundleRequire } from 'bundle-require'
import type { StudioConfig, PreviewConfig } from './types.js'
import { DEFAULT_BREAKPOINTS } from './types.js'

export function defineConfig(config: StudioConfig): StudioConfig {
  return config
}

const DEFAULT_PREVIEW: PreviewConfig = {
  include: './src/components/**/*.preview.tsx',
  breakpoints: true,
}

function normalizeConfig(raw: StudioConfig): StudioConfig {
  const preview = { ...DEFAULT_PREVIEW, ...raw.preview }

  if (preview.breakpoints === true) {
    preview.breakpoints = { ...DEFAULT_BREAKPOINTS }
  }

  return { preview }
}

export async function loadConfig(cwd: string): Promise<StudioConfig> {
  const configPath = resolve(cwd, 'studio.config.ts')

  if (!existsSync(configPath)) {
    return normalizeConfig({ preview: DEFAULT_PREVIEW })
  }

  const { mod } = await bundleRequire({ filepath: configPath })
  const raw: StudioConfig = mod.default ?? mod

  return normalizeConfig(raw)
}

export function resolveBreakpoints(
  breakpoints: PreviewConfig['breakpoints'],
): Record<string, number> {
  if (typeof breakpoints === 'boolean') {
    return breakpoints ? { ...DEFAULT_BREAKPOINTS } : {}
  }
  return { ...breakpoints }
}

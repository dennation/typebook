import type { ReactNode } from 'react'

export type Size = 'sm' | 'md' | 'lg'

export type Variant = 'primary' | 'secondary' | 'ghost'

export interface BaseProps {
  disabled?: boolean
  children: ReactNode
}

export interface InteractiveProps {
  onClick?: () => void
  onFocus?: () => void
}

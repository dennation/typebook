import type { ReactNode } from 'react'

interface ButtonProps {
  size: 'sm' | 'md' | 'lg'
  variant: 'primary' | 'secondary' | 'ghost'
  disabled?: boolean
  children: ReactNode
  onClick?: () => void
}

export function Button(props: ButtonProps) {
  return <button>{props.children}</button>
}

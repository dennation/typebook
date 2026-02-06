import type { ReactNode } from 'react'

interface ButtonProps {
  size: 'sm' | 'md' | 'lg'
  variant: 'primary' | 'secondary' | 'ghost'
  disabled?: boolean
  children: ReactNode
  onClick?: () => void
}

const sizeClasses = {
  sm: 'px-2.5 py-1 text-sm rounded',
  md: 'px-4 py-2 text-base rounded-md',
  lg: 'px-6 py-3 text-lg rounded-lg',
}

const variantClasses = {
  primary: 'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800',
  secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300 active:bg-gray-400',
  ghost: 'bg-transparent text-gray-700 hover:bg-gray-100 active:bg-gray-200',
}

export function Button({ size, variant, disabled, children, onClick }: ButtonProps) {
  return (
    <button
      className={`inline-flex items-center justify-center font-medium transition-colors ${sizeClasses[size]} ${variantClasses[variant]} ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </button>
  )
}

import type { Size, Variant, BaseProps, InteractiveProps } from './types'

interface ComposedButtonProps extends BaseProps, InteractiveProps {
  size: Size
  variant: Variant
}

const sizeClasses: Record<Size, string> = {
  sm: 'px-2.5 py-1 text-sm rounded',
  md: 'px-4 py-2 text-base rounded-md',
  lg: 'px-6 py-3 text-lg rounded-lg',
}

const variantClasses: Record<Variant, string> = {
  primary: 'bg-emerald-600 text-white hover:bg-emerald-700 active:bg-emerald-800',
  secondary: 'bg-amber-200 text-amber-900 hover:bg-amber-300 active:bg-amber-400',
  ghost: 'bg-transparent text-emerald-700 hover:bg-emerald-50 active:bg-emerald-100 border border-emerald-300',
}

export function ComposedButton({ size, variant, disabled, children, onClick }: ComposedButtonProps) {
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

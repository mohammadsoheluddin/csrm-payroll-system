import type { ButtonHTMLAttributes } from 'react'

import { cn } from '@/lib/utils/cn'

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'outline' | 'danger'
type ButtonSize = 'sm' | 'md' | 'lg' | 'icon'

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant
  size?: ButtonSize
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'bg-primary text-primary-foreground shadow-sm hover:bg-primary/90 focus-visible:ring-primary',
  secondary:
    'bg-secondary text-secondary-foreground hover:bg-secondary/80 focus-visible:ring-ring',
  ghost: 'text-foreground hover:bg-muted hover:text-foreground focus-visible:ring-ring',
  outline:
    'border border-border bg-background text-foreground shadow-sm hover:bg-muted focus-visible:ring-ring',
  danger:
    'bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90 focus-visible:ring-destructive',
}

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'h-9 px-3 text-xs',
  md: 'h-10 px-4 text-sm',
  lg: 'h-11 px-5 text-sm',
  icon: 'h-10 w-10 p-0',
}

export const Button = ({
  className,
  variant = 'primary',
  size = 'md',
  type = 'button',
  ...props
}: ButtonProps) => {
  return (
    <button
      type={type}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-xl font-medium transition',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background',
        'disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50',
        variantClasses[variant],
        sizeClasses[size],
        className,
      )}
      {...props}
    />
  )
}

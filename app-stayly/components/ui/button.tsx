'use client'

import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cn } from '@/lib/utils/cn'

type ButtonIntent = 'primary' | 'secondary' | 'ghost'
type ButtonSize = 'sm' | 'md' | 'lg'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  intent?: ButtonIntent
  size?: ButtonSize
  leftIcon?: ReactNode
  rightIcon?: ReactNode
  asChild?: boolean
}

/**
 * Button centralizes admin button styles to ensure consistent CTAs across modules.
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    intent = 'primary',
    size = 'md',
    leftIcon,
    rightIcon,
    className,
    children,
    asChild = false,
    ...props
  },
  ref
) {
  const intentStyles: Record<ButtonIntent, string> = {
    primary: 'bg-primary text-primary-foreground hover:bg-primary/90',
    secondary: 'bg-muted text-foreground hover:bg-muted/80',
    ghost: 'bg-transparent text-foreground hover:bg-muted'
  }

  const sizeStyles: Record<ButtonSize, string> = {
    sm: 'h-8 px-3 text-sm',
    md: 'h-10 px-4 text-sm',
    lg: 'h-12 px-6 text-base'
  }

  const Component = asChild ? Slot : 'button'

  const content = (
    <>
      {leftIcon ? <span className='flex items-center'>{leftIcon}</span> : null}
      <span>{children}</span>
      {rightIcon ? <span className='flex items-center'>{rightIcon}</span> : null}
    </>
  )

  return (
    <Component
      className={cn(
        'inline-flex items-center gap-2 rounded-lg font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary disabled:opacity-50',
        intentStyles[intent],
        sizeStyles[size],
        className
      )}
      ref={ref}
      {...props}
    >
      {asChild ? children : content}
    </Component>
  )
})


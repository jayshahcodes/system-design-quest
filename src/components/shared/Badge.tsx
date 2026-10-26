import type { ReactNode } from 'react'

interface BadgeProps {
  children: ReactNode
  variant?: 'badge' | 'count-badge'
  className?: string
}

export function Badge({ children, variant = 'badge', className }: BadgeProps) {
  return (
    <span className={className ?? variant}>{children}</span>
  )
}

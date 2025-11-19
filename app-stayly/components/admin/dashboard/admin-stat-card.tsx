import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

interface AdminStatCardProps {
  label: string
  value: string
  change?: string
  icon: LucideIcon
  accent?: 'primary' | 'success' | 'warning'
}

/**
 * AdminStatCard highlights a KPI tile with optional delta pill.
 */
export function AdminStatCard({ label, value, change, icon: Icon, accent = 'primary' }: AdminStatCardProps) {
  const accentClasses: Record<NonNullable<AdminStatCardProps['accent']>, string> = {
    primary: 'text-primary bg-primary/10',
    success: 'text-emerald-600 bg-emerald-100',
    warning: 'text-amber-600 bg-amber-100'
  }

  return (
    <div className='rounded-2xl border border-border bg-card/80 p-5 shadow-sm'>
      <div className='flex items-center justify-between'>
        <p className='text-sm font-medium text-muted-foreground'>{label}</p>
        <span className={cn('inline-flex items-center justify-center rounded-lg p-2', accentClasses[accent])}>
          <Icon className='size-4' />
        </span>
      </div>
      <p className='mt-4 text-3xl font-semibold text-foreground'>{value}</p>
      {change ? <p className='mt-2 text-sm text-muted-foreground'>{change}</p> : null}
    </div>
  )
}


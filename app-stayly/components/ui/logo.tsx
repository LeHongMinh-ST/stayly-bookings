import Link from 'next/link'
import { cn } from '@/lib/utils/cn'

interface LogoProps {
  compact?: boolean
}

/**
 * Logo renders the Stayly logotype and links back to the admin dashboard.
 */
export function Logo({ compact = false }: LogoProps) {
  return (
    <Link
      href='/admin/dashboard'
      aria-label='Đi tới dashboard'
      className={cn('flex items-center gap-2 text-lg font-semibold text-primary transition-all', compact && 'justify-center')}
    >
      <span className='inline-flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold'>S</span>
      <div className={cn('flex flex-col leading-tight text-foreground', compact && 'hidden')}>
        <span>Stayly</span>
        <span className='text-xs text-muted-foreground'>Console</span>
      </div>
      {compact ? <span className='sr-only'>Stayly Console</span> : null}
    </Link>
  )
}


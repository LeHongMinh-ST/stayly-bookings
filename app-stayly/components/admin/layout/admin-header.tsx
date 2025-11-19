'use client'

import { Bell, PanelLeftClose, PanelLeftOpen } from 'lucide-react'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { Button } from '@/components/ui/button'
import { useAdminAuthStore } from '@/store/admin-auth-store'
import { useAdminShellStore } from '@/store/admin-shell-store'

/**
 * AdminHeader surfaces quick actions, notifications, and the operator avatar.
 */
export function AdminHeader() {
  const { user } = useAdminAuthStore()
  const { isSidebarCollapsed, toggleSidebar } = useAdminShellStore()

  return (
    <header className='flex items-center justify-between border-b border-border bg-card/60 px-8 py-4 backdrop-blur'>
      <div className='flex items-center gap-3'>
        <Button intent='ghost' aria-label='Toggle sidebar' onClick={toggleSidebar} type='button'>
          {isSidebarCollapsed ? <PanelLeftOpen className='size-4' /> : <PanelLeftClose className='size-4' />}
        </Button>
        <div>
          <p className='text-xs uppercase tracking-wide text-muted-foreground'>Stayly Console</p>
          <h1 className='text-lg font-semibold text-foreground'>Xin chào, {user?.name ?? 'Operator'}</h1>
        </div>
      </div>
      <div className='flex items-center gap-3'>
        <Button intent='ghost' aria-label='Notifications'>
          <Bell className='size-4' />
        </Button>
        <ThemeToggle />
        <div className='flex items-center gap-2 rounded-full border border-border px-3 py-1'>
          <div className='flex size-8 items-center justify-center rounded-full bg-primary/20 text-primary font-semibold'>
            {user?.name?.[0] ?? 'S'}
          </div>
          <div className='hidden text-left text-sm leading-tight md:block'>
            <p className='font-medium text-foreground'>{user?.name}</p>
            <p className='text-xs capitalize text-muted-foreground'>{user?.role}</p>
          </div>
        </div>
      </div>
    </header>
  )
}


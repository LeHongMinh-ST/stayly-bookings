'use client'

import type { ReactNode } from 'react'
import { AdminSidebar } from '@/components/admin/layout/admin-sidebar'
import { AdminHeader } from '@/components/admin/layout/admin-header'

interface AdminLayoutProps {
  children: ReactNode
}

/**
 * AdminLayout renders the persistent shell with sidebar and topbar for operators.
 */
export function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <div className='flex min-h-screen bg-background'>
      <AdminSidebar />
      <div className='flex flex-1 flex-col bg-muted/10'>
        <AdminHeader />
        <main className='flex-1 px-8 pb-10 pt-6'>{children}</main>
      </div>
    </div>
  )
}


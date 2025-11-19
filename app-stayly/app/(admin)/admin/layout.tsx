import type { ReactNode } from 'react'
import { AdminLayout } from '@/components/admin/layout/admin-layout'

interface AdminAppLayoutProps {
  children: ReactNode
}

/**
 * AdminAppLayout mounts the sidebar + topbar shell around routed admin modules.
 */
export default function AdminAppLayout({ children }: AdminAppLayoutProps) {
  return <AdminLayout>{children}</AdminLayout>
}


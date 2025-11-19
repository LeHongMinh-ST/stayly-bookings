import type { ReactNode } from 'react'
import { AdminRouteGuard } from '@/components/admin/auth/admin-route-guard'

interface AdminGroupLayoutProps {
  children: ReactNode
}

/**
 * AdminGroupLayout injects the admin guard so every route in the group is protected.
 */
export default function AdminGroupLayout({ children }: AdminGroupLayoutProps) {
  return <AdminRouteGuard>{children}</AdminRouteGuard>
}


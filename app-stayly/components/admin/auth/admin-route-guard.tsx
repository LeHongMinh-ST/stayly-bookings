'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { LoaderCircle } from 'lucide-react'
import { useAdminAuthStore } from '@/store/admin-auth-store'
import { ROUTES } from '@/lib/constants/routes'

interface AdminRouteGuardProps {
  children: React.ReactNode
}

/**
 * AdminRouteGuard blocks unauthenticated access and eventually will redirect to login.
 */
export function AdminRouteGuard({ children }: AdminRouteGuardProps) {
  const { isAuthenticated, isLoading } = useAdminAuthStore()
  const router = useRouter()

  useEffect(() => {
    if (!isAuthenticated && !isLoading) {
      router.push(`${ROUTES.admin.root}/login`)
    }
  }, [isAuthenticated, isLoading, router])

  if (isLoading) {
    return (
      <div className='flex min-h-screen flex-col items-center justify-center gap-2'>
        <LoaderCircle className='size-6 animate-spin text-muted-foreground' />
        <p className='text-sm text-muted-foreground'>Checking permissions…</p>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className='flex min-h-screen flex-col items-center justify-center gap-2'>
        <p className='text-base font-medium text-muted-foreground'>Redirecting to admin login…</p>
      </div>
    )
  }

  return children
}


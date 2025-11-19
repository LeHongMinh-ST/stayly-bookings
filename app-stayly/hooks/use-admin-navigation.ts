'use client'

import { useMemo } from 'react'
import { usePathname } from 'next/navigation'
import type { AdminNavGroup } from '@/types/navigation'
import { ADMIN_NAV_GROUPS } from '@/lib/constants/navigation'
import { useAdminAuthStore } from '@/store/admin-auth-store'

interface UseAdminNavigationResult {
  groups: AdminNavGroup[]
  activePath: string
}

/**
 * useAdminNavigation filters navigation groups by permission and tracks active path.
 */
export function useAdminNavigation(): UseAdminNavigationResult {
  const pathname = usePathname()
  const { user } = useAdminAuthStore()

  const groups = useMemo(() => {
    if (!user) {
      return []
    }

    return ADMIN_NAV_GROUPS.map((group) => ({
      ...group,
      items: group.items.filter((item) => {
        if (!item.permissions || item.permissions.length === 0) {
          return true
        }
        return item.permissions.every((permission) => user.permissions.includes(permission))
      })
    })).filter((group) => group.items.length > 0)
  }, [user])

  return {
    groups,
    activePath: pathname
  }
}


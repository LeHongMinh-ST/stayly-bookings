import { create } from 'zustand'
import type { AdminUser } from '@/types/user'

interface AdminAuthState {
  user: AdminUser | null
  isAuthenticated: boolean
  isLoading: boolean
  setUser: (user: AdminUser | null) => void
  markLoading: (value: boolean) => void
}

/**
 * useAdminAuthStore persists the authenticated admin session for the SPA surface.
 */
export const useAdminAuthStore = create<AdminAuthState>((set) => ({
  user: {
    id: 'demo-user',
    name: 'Alex Nguyen',
    email: 'alex.nguyen@stayly.io',
    role: 'owner',
    permissions: ['users:manage'],
    managedAccommodationIds: ['acc-1', 'acc-2']
  },
  isAuthenticated: true,
  isLoading: false,
  setUser: (user) => set({ user, isAuthenticated: Boolean(user) }),
  markLoading: (value) => set({ isLoading: value })
}))


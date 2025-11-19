export type AdminRole = 'super_admin' | 'owner' | 'manager' | 'staff'

export interface AdminUser {
  id: string
  name: string
  email: string
  avatarUrl?: string
  role: AdminRole
  permissions: string[]
  managedAccommodationIds: string[]
}


import { redirect } from 'next/navigation'
import { ROUTES } from '@/lib/constants/routes'

/**
 * AdminIndex redirects operators to the dashboard by default.
 */
export default function AdminIndex() {
  redirect(ROUTES.admin.dashboard)
}


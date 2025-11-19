import { BarChart3, BedDouble, Building2, CalendarCheck, CreditCard, DollarSign, LayoutDashboard, LineChart, ShieldCheck, Star, TicketPercent, Users } from 'lucide-react'
import type { AdminNavGroup } from '@/types/navigation'
import { ROUTES } from '@/lib/constants/routes'

export const ADMIN_NAV_GROUPS: AdminNavGroup[] = [
  {
    title: 'Tổng quan',
    items: [
      {
        label: 'Dashboard',
        href: ROUTES.admin.dashboard,
        icon: LayoutDashboard
      }
    ]
  },
  {
    title: 'Vận hành',
    items: [
      {
        label: 'Cơ sở lưu trú',
        href: ROUTES.admin.accommodations,
        icon: Building2
      },
      {
        label: 'Phòng & Room type',
        href: ROUTES.admin.rooms,
        icon: BedDouble
      },
      {
        label: 'Giá & Hàng ngày',
        href: ROUTES.admin.pricing,
        icon: DollarSign
      },
      {
        label: 'Booking & Lịch',
        href: ROUTES.admin.bookings,
        icon: CalendarCheck
      },
      {
        label: 'Dịch vụ',
        href: ROUTES.admin.services,
        icon: ShieldCheck
      }
    ]
  },
  {
    title: 'Khách & Doanh thu',
    items: [
      {
        label: 'Thanh toán',
        href: ROUTES.admin.payments,
        icon: CreditCard
      },
      {
        label: 'Khách hàng',
        href: ROUTES.admin.customers,
        icon: Users
      },
      {
        label: 'Đánh giá',
        href: ROUTES.admin.reviews,
        icon: Star
      },
      {
        label: 'Khuyến mãi',
        href: ROUTES.admin.promotions,
        icon: TicketPercent
      }
    ]
  },
  {
    title: 'Quản trị',
    items: [
      {
        label: 'Người dùng & Quyền',
        href: ROUTES.admin.users,
        icon: ShieldCheck,
        permissions: ['users:manage']
      },
      {
        label: 'Báo cáo',
        href: ROUTES.admin.reports,
        icon: BarChart3
      },
      {
        label: 'Phân tích nâng cao',
        href: `${ROUTES.admin.reports}/analytics`,
        icon: LineChart,
        permissions: ['reports:advanced']
      },
      {
        label: 'Cài đặt',
        href: ROUTES.admin.settings,
        icon: ShieldCheck
      }
    ]
  }
]


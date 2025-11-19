import { Activity, CalendarClock, CreditCard, Users } from 'lucide-react'
import { AdminStatCard } from '@/components/admin/dashboard/admin-stat-card'
import { RevenueTrendCard } from '@/components/admin/dashboard/revenue-trend-card'
import { BookingStatusCard } from '@/components/admin/dashboard/booking-status-card'
import { OperationsTaskCard } from '@/components/admin/dashboard/operations-task-card'
import { PropertyPerformanceCard } from '@/components/admin/dashboard/property-performance-card'

/**
 * AdminDashboardPage stitches together the primary operational overview widgets.
 */
export default function AdminDashboardPage() {
  return (
    <div className='space-y-8'>
      <section className='grid gap-4 md:grid-cols-2 xl:grid-cols-4'>
        <AdminStatCard label='Booking tháng này' value='1,284' change='+18% vs tháng trước' icon={CalendarClock} accent='primary' />
        <AdminStatCard label='Doanh thu thuần' value='$182,450' change='+12% vs cùng kỳ' icon={CreditCard} accent='success' />
        <AdminStatCard label='Tỷ lệ lấp đầy' value='82%' change='-2% vs tuần trước' icon={Activity} accent='warning' />
        <AdminStatCard label='Khách quay lại' value='36%' change='+4% vs tháng trước' icon={Users} accent='primary' />
      </section>

      <section className='grid gap-6 lg:grid-cols-3'>
        <div className='lg:col-span-2'>
          <RevenueTrendCard />
        </div>
        <BookingStatusCard />
      </section>

      <section className='grid gap-6 lg:grid-cols-2'>
        <PropertyPerformanceCard />
        <OperationsTaskCard />
      </section>
    </div>
  )
}


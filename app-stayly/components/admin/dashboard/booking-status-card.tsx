const bookingStatus = [
  { label: 'Chờ check-in', count: 18 },
  { label: 'Đang lưu trú', count: 42 },
  { label: 'Check-out hôm nay', count: 9 },
  { label: 'Yêu cầu hỗ trợ', count: 5 }
]

/**
 * BookingStatusCard lists the most relevant operational queues for managers.
 */
export function BookingStatusCard() {
  return (
    <div className='rounded-2xl border border-border bg-card/80 p-6 shadow-sm'>
      <p className='text-sm font-medium text-muted-foreground'>Hàng chờ vận hành</p>
      <ul className='mt-4 space-y-3'>
        {bookingStatus.map((item) => (
          <li key={item.label} className='flex items-center justify-between text-sm text-foreground'>
            <span>{item.label}</span>
            <span className='rounded-full bg-muted px-3 py-1 text-xs font-semibold text-foreground'>{item.count}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}


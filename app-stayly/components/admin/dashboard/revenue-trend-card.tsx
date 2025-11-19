const mockTrend = [42, 56, 48, 64, 59, 70, 66]

/**
 * RevenueTrendCard sketches a placeholder chart for engineering handoff.
 */
export function RevenueTrendCard() {
  return (
    <div className='rounded-2xl border border-border bg-card/80 p-6 shadow-sm'>
      <div className='flex items-start justify-between'>
        <div>
          <p className='text-sm text-muted-foreground'>Doanh thu 7 ngày</p>
          <p className='text-3xl font-semibold text-foreground'>$84,230</p>
          <p className='text-xs text-success mt-1'>+12.6% so với tuần trước</p>
        </div>
        <div className='text-right text-sm text-muted-foreground'>
          <p>Tỷ lệ lấp đầy</p>
          <p className='text-lg font-semibold text-foreground'>82%</p>
        </div>
      </div>
      <div className='mt-6 flex h-32 items-end gap-2'>
        {mockTrend.map((value, index) => (
          <span
            key={`trend-${index}`}
            className='flex-1 rounded-full bg-primary/30'
            style={{ height: `${value}%` }}
          />
        ))}
      </div>
    </div>
  )
}


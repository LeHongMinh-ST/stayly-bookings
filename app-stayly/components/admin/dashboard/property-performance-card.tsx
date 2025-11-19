const topProperties = [
  { name: 'Stayly Saigon Central', occupancy: 94, revenue: '$32.8K' },
  { name: 'Stayly Da Nang Riverside', occupancy: 88, revenue: '$24.1K' },
  { name: 'Stayly Hanoi Old Quarter', occupancy: 81, revenue: '$21.6K' }
]

/**
 * PropertyPerformanceCard lists the best-performing accommodations for owners.
 */
export function PropertyPerformanceCard() {
  return (
    <div className='rounded-2xl border border-border bg-card/80 p-6 shadow-sm'>
      <p className='text-sm font-medium text-muted-foreground'>Top cơ sở trong tuần</p>
      <div className='mt-4 space-y-4'>
        {topProperties.map((property) => (
          <div key={property.name} className='flex items-center justify-between'>
            <div>
              <p className='text-sm font-semibold text-foreground'>{property.name}</p>
              <p className='text-xs text-muted-foreground'>Occupancy: {property.occupancy}%</p>
            </div>
            <p className='text-sm font-semibold text-foreground'>{property.revenue}</p>
          </div>
        ))}
      </div>
    </div>
  )
}


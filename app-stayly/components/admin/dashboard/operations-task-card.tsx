const tasks = [
  { title: 'Duyệt homestay mới', assignee: 'Super Admin', due: 'Hôm nay, 10:00' },
  { title: 'Điều chỉnh giá cuối tuần', assignee: 'Owner', due: 'Hôm nay, 14:30' },
  { title: 'Kiểm tra báo cáo doanh thu', assignee: 'Accountant', due: 'Ngày mai, 09:00' }
]

/**
 * OperationsTaskCard is a placeholder backlog list for critical follow-ups.
 */
export function OperationsTaskCard() {
  return (
    <div className='rounded-2xl border border-border bg-card/80 p-6 shadow-sm'>
      <p className='text-sm font-medium text-muted-foreground'>Tác vụ quan trọng</p>
      <div className='mt-4 space-y-4'>
        {tasks.map((task) => (
          <div key={task.title} className='rounded-xl bg-muted/60 p-3'>
            <p className='text-sm font-semibold text-foreground'>{task.title}</p>
            <div className='mt-1 flex items-center justify-between text-xs text-muted-foreground'>
              <span>{task.assignee}</span>
              <span>{task.due}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}


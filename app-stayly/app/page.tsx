import Link from 'next/link'
import { Button } from '@/components/ui/button'

/**
 * Home surfaces quick links to the Admin console while customer UI is pending.
 */
export default function Home() {
  return (
    <div className='flex min-h-screen items-center justify-center bg-background px-6 py-12'>
      <div className='max-w-3xl rounded-3xl border border-border bg-card/80 p-10 shadow-xl'>
        <p className='text-sm uppercase tracking-[0.3em] text-primary'>Stayly Platform</p>
        <h1 className='mt-4 text-4xl font-semibold text-foreground'>Frontend playground</h1>
        <p className='mt-4 text-base text-muted-foreground'>
          Giao diện khách hàng sẽ được dựng trong nhóm route <code className='rounded bg-muted px-2 py-1'>(customer)</code>.
          Hiện tại bạn có thể bắt đầu với admin console thông qua đường dẫn bên dưới.
        </p>
        <div className='mt-8 flex flex-wrap gap-4'>
          <Button asChild>
            <Link href='/admin/dashboard'>Vào Admin Console</Link>
          </Button>
          <Button intent='secondary' asChild>
            <a href='https://www.notion.so/hapo-digital/Stayly-Frontend-b8f54c...' target='_blank' rel='noreferrer'>
              Tài liệu kiến trúc
            </a>
          </Button>
        </div>
      </div>
    </div>
  )
}

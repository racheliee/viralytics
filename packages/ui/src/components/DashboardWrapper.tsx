import { cn } from '@viralytics/lib/utils'

interface DashboardWrapperProps {
  title: string
  children: React.ReactNode
  className?: string
}

export default function DashboardWrapper({
  title,
  children,
  className
}: DashboardWrapperProps) {
  return (
    <div className={'flex flex-col min-h-screen p-2 gap-4'}>
      <h1 className="text-3xl font-bold mb-4 mt-2">{title}</h1>
      <div className={cn('flex-1 overflow-y-auto', className)}>{children}</div>
    </div>
  )
}

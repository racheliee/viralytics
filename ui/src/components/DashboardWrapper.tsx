interface DashboardWrapperProps {
  title: string
  children: React.ReactNode
}

export default function DashboardWrapper({
  title,
  children
}: DashboardWrapperProps) {
  return (
    <div className="flex flex-col min-h-screen p-2">
      <h1 className="text-3xl font-bold mb-4">{title}</h1>
      <div className="flex-1 overflow-y-auto">{children}</div>
    </div>
  )
}

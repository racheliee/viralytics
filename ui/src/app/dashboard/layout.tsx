'use client'

import { PropsWithChildren } from 'react'
import { Sidebar } from '@viralytics/components/Sidebar'

export default function DashboardLayout({ children }: PropsWithChildren) {
  return (
    <div className="flex min-h-screen">
      <Sidebar visible={true} />
      <main className="flex-1 overflow-y-auto p-4">
        {children}
      </main>
    </div>
  )
}

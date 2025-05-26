'use client'

import { PropsWithChildren } from 'react'
import { Sidebar } from '@viralytics/components/Sidebar'

export default function DashboardLayout({ children }: PropsWithChildren) {
  return (
    <div className="flex h-screen overflow-hidden bg-[var(--background)] text-[var(--foreground)]">
      <Sidebar visible={true} />
      <main className="flex-1 overflow-y-auto p-4 bg-[var(--background)]">
        {children}
      </main>
    </div>
  )
}

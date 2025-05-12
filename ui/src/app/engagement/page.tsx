'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { isLoggedIn } from '@viralytics/utils/auth'

export default function EngagementPage() {
  const router = useRouter()

  useEffect(() => {
    if (!isLoggedIn()) {
      router.push('/')
    }
  }, [router])

  return (
    <div className="flex flex-col items-center justify-center h-screen px-8">
      <h1 className="text-3xl font-bold">Building!</h1>
    </div>
  )
}

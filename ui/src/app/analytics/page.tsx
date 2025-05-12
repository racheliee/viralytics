'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { isLoggedIn } from '@viralytics/utils/auth'
import Analytics from '@viralytics/components/Analytics/Analytics'

export default function AnalyticsPage() {
  const router = useRouter()

  useEffect(() => {
    if (!isLoggedIn()) {
      router.push('/')
    }
  }, [router])
  return <Analytics />
}

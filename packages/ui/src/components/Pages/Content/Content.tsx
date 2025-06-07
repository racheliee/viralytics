'use client'

import { useEffect, useState } from 'react'
import DashboardWrapper from '@viralytics/components/DashboardWrapper'
import MediaGrid from '@viralytics/components/Pages/Content/MediaGrid'
import { InstagramMediaResults } from '@viralytics/shared-constants'

export default function Content() {
  const [media, setMedia] = useState<InstagramMediaResults[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchMedia = async () => {
      try {
        const res = await fetch('/api/instagram/media', { method: 'POST' })
        if (!res.ok) throw new Error('Failed to fetch media')
        const data = await res.json()
        setMedia(data.mediaInfo ?? [])
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message)
        } else {
          setError('Something went wrong')
        }
      } finally {
        setLoading(false)
      }
    }

    fetchMedia()
  }, [])

  return (
    <DashboardWrapper title="Content">
      <div className="space-y-6">
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <MediaGrid media={media} loading={loading} />
      </div>
    </DashboardWrapper>
  )
}

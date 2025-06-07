'use client'

import { useEffect, useState } from 'react'
import DashboardWrapper from '@viralytics/components/DashboardWrapper'
import MediaGrid from '@viralytics/components/Pages/Content/MediaGrid'
import { InstagramMediaResults } from '@viralytics/shared-constants'
import MediaFilter from '@viralytics/components/Pages/Content/MediaFilter'
import MediaSort from '@viralytics/components/Pages/Content/MediaSort'

export default function Content() {
  const [media, setMedia] = useState<InstagramMediaResults[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filterType, setFilterType] = useState('All')
  const [sortBy, setSortBy] = useState<'likes' | 'comments' | 'timestamp'>(
    'likes'
  )

  const filteredMedia =
    filterType === 'All'
      ? media
      : media.filter((m) => m.media_type === filterType)
  const sortedMedia = [...filteredMedia].sort((a, b) => {
    if (sortBy === 'likes') return (b.like_count ?? 0) - (a.like_count ?? 0)
    if (sortBy === 'comments')
      return (b.comments_count ?? 0) - (a.comments_count ?? 0)
    if (sortBy === 'timestamp')
      return new Date(b.timestamp!).getTime() - new Date(a.timestamp!).getTime()
    return 0
  })

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
        <div className="flex flex-wrap gap-4 items-center justify-end">
          <MediaFilter filterType={filterType} onFilterChange={setFilterType} />
          <MediaSort sortBy={sortBy} onChange={setSortBy} />
        </div>
        <MediaGrid media={sortedMedia} loading={loading} />
      </div>
    </DashboardWrapper>
  )
}

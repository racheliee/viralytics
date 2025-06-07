'use client'

import { useEffect, useState } from 'react'
import DashboardWrapper from '@viralytics/components/DashboardWrapper'
import { Card, CardContent } from '@viralytics/components/ui/card'
import Image from 'next/image'
import { Skeleton } from '@viralytics/components/ui/skeleton'

interface InstagramMedia {
  id: string
  caption?: string
  media_type: string
  media_url: string
  thumbnail_url?: string
  like_count: number
  comments_count: number
  timestamp: string
}

export default function Content() {
  const [media, setMedia] = useState<InstagramMedia[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchMedia = async () => {
      try {
        const res = await fetch('/api/instagram/media', { method: 'POST' })
        if (!res.ok) throw new Error('Failed to fetch media')
        const data = await res.json()
        console.log('Fetched media:', data)
        setMedia(data.mediaInfo ?? []) // or adjust based on actual response structure
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

        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="w-full h-[300px] rounded-md" />
            ))}
          </div>
        )}

        {error && <p className="text-red-500 text-sm">{error}</p>}

        {!loading && media.length === 0 && (
          <p className="text-muted-foreground text-sm">No media found.</p>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {media.map((item) => (
            <Card key={item.id}>
              <CardContent className="p-2">
                <div className="relative w-full h-60 rounded-md overflow-hidden">
                  <Image
                    src={item.media_url}
                    alt={item.caption ?? 'Instagram media'}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>
                <div className="pt-3 space-y-1">
                  <p className="text-sm font-medium text-muted-foreground truncate">
                    {item.caption || 'No caption'}
                  </p>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>❤️ {item.like_count}</span>
                    <span>💬 {item.comments_count}</span>
                  </div>
                  <p className="text-xs text-gray-400">{new Date(item.timestamp).toLocaleDateString()}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </DashboardWrapper>
  )
}

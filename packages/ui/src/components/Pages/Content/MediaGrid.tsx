'use client'

import { InstagramMediaResults } from '@viralytics/shared-constants'
import MediaCard from './MediaCard'
import { Skeleton } from '@viralytics/components/ui/skeleton'

interface Props {
  media: InstagramMediaResults[]
  loading: boolean
}

export default function MediaGrid({ media, loading }: Props) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <Skeleton key={i} className="w-full h-[300px] rounded-md" />
        ))}
      </div>
    )
  }

  if (media.length === 0) {
    return <p className="text-muted-foreground text-sm">No media found.</p>
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
      {media.map((item) => (
        <MediaCard key={item.id} media={item} />
      ))}
    </div>
  )
}

'use client'

import { Card, CardContent } from '@viralytics/components/ui/card'
import { InstagramMediaResults } from '@viralytics/shared-constants'
import Image from 'next/image'

interface MediaCardProps {
  media: InstagramMediaResults
}

export default function MediaCard({ media }: MediaCardProps) {
  return (
    <Card key={media.id}>
      <CardContent className="p-2">
        <div className="relative w-full h-60 rounded-md overflow-hidden">
          {media.media_url ? (
            <Image
              src={media.media_url}
              alt={media.caption ?? 'Instagram media'}
              fill
              className="object-cover"
              unoptimized
            />
          ) : (
            <div className="w-full h-full bg-gray-200 flex items-center justify-center text-sm text-gray-500">
              No Image
            </div>
          )}
        </div>

        <div className="pt-3 space-y-1">
          <p className="text-sm font-medium text-muted-foreground truncate">
            {media.caption || 'No caption'}
          </p>

          <div className="flex justify-between text-xs text-muted-foreground">
            <span>❤️ {media.like_count ?? 0}</span>
            <span>💬 {media.comments_count ?? 0}</span>
          </div>

          <p className="text-xs text-gray-400">
            {media.timestamp ? new Date(media.timestamp).toLocaleDateString() : 'Unknown date'}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

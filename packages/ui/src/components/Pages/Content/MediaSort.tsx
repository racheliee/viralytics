'use client'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@viralytics/components/ui/select'

type SortType = 'likes' | 'comments' | 'timestamp'

interface MediaSortProps {
  sortBy: SortType
  onChange: (val: SortType) => void
}

export default function MediaSort({ sortBy, onChange }: MediaSortProps) {
  const options: { label: string; value: SortType }[] = [
    { label: 'Most Likes', value: 'likes' },
    { label: 'Most Comments', value: 'comments' },
    { label: 'Newest', value: 'timestamp' }
  ]

  return (
    <div className="w-[200px]">
      <Select value={sortBy} onValueChange={onChange}>
        <SelectTrigger>
          <SelectValue placeholder="Sort by" />
        </SelectTrigger>
        <SelectContent>
          {options.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}

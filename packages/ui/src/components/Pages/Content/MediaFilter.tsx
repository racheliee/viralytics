'use client'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@viralytics/components/ui/select'

interface MediaFilterProps {
  filterType: string
  onFilterChange: (type: string) => void
}

export default function MediaFilter({ filterType, onFilterChange }: MediaFilterProps) {
  const types = ['All', 'IMAGE', 'VIDEO', 'CAROUSEL_ALBUM']

  return (
    <div className="w-[200px]">
      <Select value={filterType} onValueChange={onFilterChange}>
        <SelectTrigger>
          <SelectValue placeholder="Filter by type" />
        </SelectTrigger>
        <SelectContent>
          {types.map((type) => (
            <SelectItem key={type} value={type}>
              {type}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}

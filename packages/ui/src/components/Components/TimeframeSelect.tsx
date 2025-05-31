'use client'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@viralytics/components/ui/select'
import { timeframeLabels } from '@viralytics/lib/utils'
import { TimeframeEnum } from '@viralytics/shared-constants'

interface TimeframeSelectProps {
  selected: TimeframeEnum
  onChange: (value: TimeframeEnum) => void
}

export function TimeframeSelect({ selected, onChange }: TimeframeSelectProps) {
  return (
    <Select value={selected} onValueChange={(value) => onChange(value as TimeframeEnum)}>
      <SelectTrigger className="w-40">
        <SelectValue placeholder="Timeframe" />
      </SelectTrigger>
      <SelectContent>
        {Object.entries(timeframeLabels).map(([value, label]) => (
          <SelectItem key={value} value={value}>
            {label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

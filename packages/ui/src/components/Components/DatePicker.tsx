'use client'

import { CalendarIcon } from 'lucide-react'
import { format } from 'date-fns'
import { cn } from '@viralytics/lib/utils'
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@viralytics/components/ui/popover'
import { Button } from '@viralytics/components/ui/button'
import { Calendar } from '@viralytics/components/ui/calendar'

interface DatePickerProps {
  label: string
  date: Date | undefined
  onChange: (date: Date | undefined) => void
}

export function DatePicker({ label, date, onChange }: DatePickerProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            'w-[200px] justify-start text-left font-normal',
            !date && 'text-muted-foreground'
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? format(date, 'PPP') : <span>{label}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <Calendar
          mode="single"
          selected={date}
          onSelect={onChange}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  )
}

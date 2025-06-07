'use client'

import { LineChartBreakdown } from './LineChartBase'

// Import necessary types from recharts
import { TooltipProps } from 'recharts'

// Use more flexible generic types to match Recharts' internal types
export interface CustomTooltipProps
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  extends Omit<TooltipProps<any, any>, 'lines'> {
  lines?: {
    dataKey: string
    name: string
    color: string
    breakdowns?: Record<string, LineChartBreakdown[]>
  }[]
  hideLabel?: boolean
}

export function CustomChartTooltip({
  active,
  payload,
  label,
  lines = [],
  hideLabel = false
}: CustomTooltipProps) {
  if (!active || !payload || !payload.length) return null

  return (
    <div className="rounded-lg border bg-popover p-2 shadow-md">
      {!hideLabel && <div className="font-medium">{label}</div>}
      <div className="mt-2 space-y-1">
        {payload.map((entry) => {
          // Convert entry.dataKey to string for comparison if it exists
          const entryDataKey =
            entry.dataKey !== undefined ? String(entry.dataKey) : undefined
          const line = lines.find(
            (l) => entryDataKey !== undefined && l.dataKey === entryDataKey
          )
          const breakdowns = line?.breakdowns?.[label?.toString() || '']

          return (
            <div key={entryDataKey?.toString() || entry.name?.toString()}>
              <div className="flex items-center gap-2">
                <div
                  className="h-3 w-3 rounded-full"
                  style={{ backgroundColor: entry.color as string }}
                />
                <span className="font-medium">
                  {line?.name || entry.name}:{' '}
                  {entry.value !== undefined
                    ? (entry.value as number).toLocaleString()
                    : 'N/A'}
                </span>
              </div>
              {breakdowns && breakdowns.length > 0 && (
                <div className="ml-5 mt-1 space-y-1 text-xs text-muted-foreground">
                  {breakdowns.map((breakdown) => (
                    <div
                      key={breakdown.dimension_value}
                      className="flex justify-between"
                    >
                      <span>{breakdown.dimension_value}:</span>
                      <span className="font-medium">
                        {breakdown.value.toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

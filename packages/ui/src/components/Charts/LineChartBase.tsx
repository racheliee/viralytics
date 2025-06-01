'use client'

import React from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts'
import {
  ChartContainer,
  ChartTooltipContent
} from '@viralytics/components/ui/chart'
import { cn } from '@viralytics/lib/utils'

export interface LineChartData {
  date: string
  [key: string]: number | string
}

export interface LineChartBreakdown {
  name: string
  dimension_value: string
  value: number
}

export interface LineChartProps {
  data: LineChartData[]
  lines: {
    dataKey: string
    name: string
    color: string
    breakdowns?: Record<string, LineChartBreakdown[]>
  }[]
  className?: string
  yAxisFormatter?: (value: number) => string
  tooltipFormatter?: (value: number, name: string) => React.ReactNode
  width?: number
  height?: number
}

export default function LineChartBase({
  data,
  lines,
  className,
  yAxisFormatter = (value) => value.toLocaleString(),
  tooltipFormatter,
  width = 500,
  height = 220
}: LineChartProps) {
  const config = lines.reduce(
    (acc, line) => {
      acc[line.dataKey] = {
        label: line.name,
        color: line.color
      }
      return acc
    },
    {} as Record<string, { label: string; color: string }>
  )

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload || !payload.length) return null

    return (
      <div className="rounded-lg border bg-background p-2 shadow-md">
        <div className="font-medium">{label}</div>
        <div className="mt-2 space-y-1">
          {payload.map((entry: any) => {
            const line = lines.find((l) => l.dataKey === entry.dataKey)
            const breakdowns = line?.breakdowns?.[label]

            return (
              <div key={entry.dataKey}>
                <div className="flex items-center gap-2">
                  <div
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: entry.color }}
                  />
                  <span className="font-medium">
                    {line?.name || entry.name}: {entry.value.toLocaleString()}
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

  // Filter out data points with missing values for the selected metrics
  const filteredData = data.filter((item) =>
    lines.every((line) => typeof item[line.dataKey] === 'number')
  )

  return (
    <div className={cn('overflow-hidden', className)}>
      <ChartContainer config={config}>
        <LineChart
          width={width}
          height={height}
          data={filteredData}
          margin={{ top: 20, right: 20, left: 10, bottom: 20 }}
          style={{ backgroundColor: 'transparent' }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="date"
            tickLine={false}
            axisLine={false}
            padding={{ left: 20, right: 20 }}
            tick={{ fontSize: 12 }}
          />
          <YAxis
            tickFormatter={yAxisFormatter}
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 12 }}
            width={70}
            domain={['auto', 'auto']}
            padding={{ top: 5, bottom: 5 }} // Further reduced Y-axis padding
            allowDecimals={false}
            tickCount={5} // Suggest number of ticks
            interval="preserveStartEnd" // Ensure min/max ticks are shown
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend verticalAlign="top" height={36} />
          {lines.map((line) => (
            <Line
              key={line.dataKey}
              type="monotone"
              dataKey={line.dataKey}
              name={line.name}
              stroke="#000000"
              strokeWidth={2}
              dot={{ r: 3, strokeWidth: 1, fill: '#000000' }}
              activeDot={{ r: 5, fill: '#000000' }}
              connectNulls={true}
            />
          ))}
        </LineChart>
      </ChartContainer>
    </div>
  )
}

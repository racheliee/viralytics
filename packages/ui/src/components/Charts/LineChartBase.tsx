'use client'

import { CustomChartTooltip } from '@viralytics/components/Charts/CustomChartTooltip'
import { ChartContainer } from '@viralytics/components/ui/chart'
import { cn } from '@viralytics/lib/utils'
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts'

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
  tooltipFormatter?: (value: number) => string
  width?: number
  height?: number
}

export default function LineChartBase({
  data,
  lines,
  className,
  yAxisFormatter = (value) => value.toLocaleString(),
  tooltipFormatter = (value) => value.toLocaleString(),
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

  // Removed CustomTooltip component - now using the shared ChartTooltip component

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
          <Tooltip
            content={(props) => <CustomChartTooltip {...props} lines={lines} />}
            contentStyle={{
              backgroundColor: 'var(--popover)',
              color: 'var(--foreground)',
              border: '1px solid var(--border)',
              borderRadius: '0.5rem',
              padding: '0.5rem'
            }}
            wrapperStyle={{ backgroundColor: 'transparent' }}
            formatter={(value) => tooltipFormatter(Number(value))}
          />
          <Legend verticalAlign="top" height={36} />
          {lines.map((line) => (
            <Line
              key={line.dataKey}
              type="monotone"
              dataKey={line.dataKey}
              name={line.name}
              stroke={line.color}
              strokeWidth={2}
              dot={{ r: 3, strokeWidth: 1, fill: line.color }}
              activeDot={{ r: 5, fill: line.color }}
              connectNulls={true}
            />
          ))}
        </LineChart>
      </ChartContainer>
    </div>
  )
}

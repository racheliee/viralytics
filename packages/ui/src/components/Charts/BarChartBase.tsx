'use client'

import { ChartColors } from '@viralytics/components/Charts/types/Colours'
import {
  ChartTooltip,
  ChartTooltipContent
} from '@viralytics/components/ui/chart'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  XAxis,
  YAxis
} from 'recharts'

interface BarChartBaseProps {
  data: { label: string; value: number }[]
  className?: string
  colorIndex?: number
  showLabels?: boolean
  showGrid?: boolean
  width?: number
  height?: number
}

export function BarChartBase({
  data,
  className = '',
  colorIndex = 0,
  showLabels = true,
  showGrid = true,
  width = 400,
  height = 250
}: BarChartBaseProps) {
  return (
    <BarChart
      width={width}
      height={height}
      data={data}
      className={className}
      style={{ backgroundColor: 'transparent' }}
    >
      {showGrid && <CartesianGrid vertical={false} />}
      <XAxis dataKey="label" stroke="currentColor" tickLine={false} />
      <YAxis stroke="currentColor" />
      <ChartTooltip
        content={<ChartTooltipContent hideLabel />}
        contentStyle={{
          backgroundColor: 'var(--popover)',
          color: 'var(--foreground)',
          border: '1px solid var(--border)',
          borderRadius: '0.5rem',
          padding: '0.5rem'
        }}
        wrapperStyle={{ backgroundColor: 'transparent' }}
      />
      <Bar dataKey="value">
        {data.map((entry, idx) => (
          <Cell
            key={`cell-${idx}`}
            fill={
              entry.value >= 0
                ? ChartColors[colorIndex % ChartColors.length]
                : 'var(--chart-2)'
            }
          />
        ))}
        {showLabels && <LabelList dataKey="value" position="top" />}
      </Bar>
    </BarChart>
  )
}

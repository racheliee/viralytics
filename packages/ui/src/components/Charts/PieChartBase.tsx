'use client'

import { PieChart, Pie, Cell } from 'recharts'
import {
  ChartTooltip,
  ChartTooltipContent
} from '@viralytics/components/ui/chart'
import { ChartColors } from './types/colours'

interface PieChartBaseProps {
  data: { keyLabel: string; value: number }[]
  outerRadius?: number
  width?: number
  height?: number
}

export function PieChartBase({
  data,
  outerRadius = 100,
  width = 400,
  height = 300
}: PieChartBaseProps) {
  return (
    <PieChart
      width={width}
      height={height}
      style={{ backgroundColor: 'transparent' }}
    >
      <Pie
        data={data}
        dataKey="value"
        nameKey="keyLabel"
        cx="50%"
        cy="50%"
        outerRadius={outerRadius}
        label
      >
        {data.map((entry, index) => (
          <Cell
            key={`cell-${index}`}
            fill={ChartColors[index % ChartColors.length]}
          />
        ))}
      </Pie>
      <ChartTooltip
        cursor={false}
        content={<ChartTooltipContent hideLabel />}
        contentStyle={{
          backgroundColor: 'var(--popover)',
          color: 'var(--foreground)',
          border: '1px solid var(--border)',
          borderRadius: '0.5rem',
          padding: '0.5rem'
        }}
        wrapperStyle={{
          backgroundColor: 'transparent'
        }}
      />
    </PieChart>
  )
}

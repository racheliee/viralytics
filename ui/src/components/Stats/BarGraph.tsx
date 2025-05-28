'use client'

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'

interface BreakdownResult {
  ranges: string[]
  value: number
}

interface Breakdown {
  dimension_keys: string
  results: BreakdownResult[]
}

interface Props {
  breakdown: Breakdown
  title?: string
}

export default function BarGraph({ breakdown, title }: Props) {
  const data = breakdown.results.map((r) => ({
    name: r.ranges[0],
    value: r.value
  }))

  return (
    <div className="w-full h-96 bg-white dark:bg-gray-900 rounded-lg p-4 shadow-md">
      {title && <h3 className="text-lg font-semibold text-center mb-4">{title}</h3>}
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" stroke="#888" />
          <YAxis stroke="#888" />
          <Tooltip />
          <Bar dataKey="value" fill="#8884d8" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

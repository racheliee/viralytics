'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from 'recharts'
import { useEffect, useState, useCallback } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@viralytics/components/ui/card'
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent
} from '@viralytics/components/ui/chart'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@viralytics/components/ui/select'

interface BreakdownResult {
  keyLabel: string
  value: number
}

interface Breakdown {
  dimension_key: string
  results: BreakdownResult[]
}

const chartConfig = {
  desktop: {
    label: 'Desktop',
    color: 'var(--chart-1)'
  }
} satisfies ChartConfig

export default function FollowerDemographics() {
  const [breakdown, setBreakdown] = useState<Breakdown | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedBreakdown] = useState<string>('gender')
  const [selectedTimeframe, setSelectedTimeframe] = useState('last_30_days')

  const fetchDemographics = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/instagram/demographics/followers', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          breakdown: selectedBreakdown,
          timeframe: selectedTimeframe
        })
      })

      if (!res.ok) throw new Error('Failed to fetch demographics')
      const data: Breakdown = await res.json()

      if (!data || !Array.isArray(data.results)) {
        throw new Error('Invalid data format from API')
      }

      setBreakdown(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unexpected error')
    } finally {
      setLoading(false)
    }
  }, [selectedBreakdown, selectedTimeframe])

  useEffect(() => {
    fetchDemographics()
  }, [fetchDemographics])

  return (
    <div className="w-full max-w-2xl mx-auto p-4">
      {loading && <span>Loading...</span>}
      {error && <span color="error">{error}</span>}

      {!loading && !error && breakdown && (
        <Card className="shadow-lg">
          <div className="flex items-start justify-between flex-row pe-4">
            <CardHeader>
              <CardTitle>
                Follower Breakdown by {breakdown.dimension_key}
              </CardTitle>
              <CardDescription>January - June 2024</CardDescription>
            </CardHeader>
            <Select
              value={selectedTimeframe}
              onValueChange={(val) => setSelectedTimeframe(val)}
            >
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Timeframe" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="last_7_days">Last 7 Days</SelectItem>
                <SelectItem value="last_30_days">Last 30 Days</SelectItem>
                <SelectItem value="last_90_days">Last 90 Days</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <CardContent>
            <div className="h-auto">
              <ChartContainer config={chartConfig}>
                <BarChart accessibilityLayer data={breakdown.results}>
                  <CartesianGrid vertical={false} />
                  <XAxis
                    dataKey="keyLabel"
                    stroke="currentColor"
                    tickLine={false}
                    tickMargin={10}
                    axisLine={false}
                  />
                  <YAxis stroke="currentColor" />
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
                  />
                  <Legend />
                  <Bar
                    dataKey="value"
                    fill="var(--chart-1)"
                    radius={8}
                    name="Followers"
                  />
                </BarChart>
              </ChartContainer>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

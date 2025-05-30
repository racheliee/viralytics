'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts'
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
import {
  
  TimeframeEnum
} from '@viralytics/shared-constants'
import { AlertCircle, Loader2 } from 'lucide-react'
import { Breakdown, timeframeLabels, DemographicsProps} from '@viralytics/components/Charts/types/DemographicsTypes'
import { ChartColors } from '@viralytics/components/Charts/types/Colours'

const chartConfig = {
  desktop: {
    label: 'Followers',
    color: ChartColors[0]
  }
} satisfies ChartConfig

export default function DemographicsBar({
  type,
  breakdown,
  timeframe
}: DemographicsProps) {
  const [data, setData] = useState<Breakdown | null>(null)
  const [selectedTimeframe, setSelectedTimeframe] = useState<TimeframeEnum>( timeframe ||
    TimeframeEnum.LAST_30_DAYS
  )
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchDemographics = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/instagram/demographics/${type}`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          breakdown,
          timeframe: selectedTimeframe
        })
      })

      if (!res.ok) throw new Error('Failed to fetch demographics')
      const json: Breakdown = await res.json()

      if (!json || !Array.isArray(json.results)) {
        throw new Error('Invalid data format from API')
      }

      setData(json)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unexpected error')
    } finally {
      setLoading(false)
    }
  }, [breakdown, selectedTimeframe, type])

  useEffect(() => {
    fetchDemographics()
  }, [fetchDemographics])

  return (
    <div className="w-full mx-auto mb-6">
      {loading && (
        <div className="flex items-center justify-center w-full h-64">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      )}

      {error && (
        <div className="flex flex-col items-center justify-center w-full h-64 text-destructive">
          <AlertCircle className="w-6 h-6 mb-2" />
          <p className="text-sm font-medium">Something went wrong</p>
          <p className="text-xs text-muted-foreground mt-1 text-center max-w-sm">
            {error}
          </p>
        </div>
      )}

      {!loading && !error && data && (
        <Card className="shadow-lg bg-background text-foreground">
          <div className="flex items-start justify-between flex-row pe-4">
            <CardHeader>
              <CardTitle>
                Follower Breakdown by{' '}
                {data.dimension_key.charAt(0).toUpperCase() +
                  data.dimension_key.slice(1)}
              </CardTitle>
              <CardDescription>
                Gender of your followers (F = female, M = male, U = unknown)
              </CardDescription>
            </CardHeader>
            <div className="pt-4">
              <Select
                value={selectedTimeframe}
                onValueChange={(value) =>
                  setSelectedTimeframe(value as TimeframeEnum)
                }
              >
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
            </div>
          </div>
          <CardContent>
            <div className="h-auto">
              <ChartContainer config={chartConfig}>
                <BarChart
                  accessibilityLayer
                  data={data.results}
                  style={{ backgroundColor: 'transparent' }}
                >
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
                    wrapperStyle={{
                      backgroundColor: 'transparent'
                    }}
                  />
                  <Bar
                    dataKey="value"
                    fill={ChartColors[0]}
                    radius={4}
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

'use client'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  LabelList,
  Cell
} from 'recharts'
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
  GeneralBreakdownEnum,
  TimeframeEnum
} from '@viralytics/shared-constants'
import { ChartColors } from '@viralytics/components/Charts/types/Colours'
import { AlertCircle, Loader2 } from 'lucide-react'
import { timeframeLabels } from '@viralytics/components/Charts/types/DemographicsTypes'

const chartConfig: ChartConfig = {
  desktop: {
    label: 'Follows / Unfollows',
    color: ChartColors[0]
  }
}

export default function NegativeBar() {
  const [data, setData] = useState<{
    follower: number
    unfollower: number
    unknown: number
  } | null>(null)
  const [selectedTimeframe, setSelectedTimeframe] = useState<TimeframeEnum>(
    TimeframeEnum.LAST_30_DAYS
  )
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/instagram/follows-and-unfollows', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          since: new Date(1714876800 * 1000).toISOString()
        })
      })

      if (!res.ok) throw new Error('Failed to fetch follow & unfollow data')
      const json = await res.json()
      setData(json)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unexpected error')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const chartData =
    data != null
      ? [
          { label: 'Follows', value: data.follower },
          { label: 'Unfollows', value: data.unfollower }
        ]
      : []

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
              <CardTitle>Follow Activity</CardTitle>
              <CardDescription>
                Breakdown for the last{' '}
                {timeframeLabels[selectedTimeframe] || '30 days'}
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
            <p className="mb-4 text-sm">
              <span className="font-semibold">Follows:</span> {data.follower}{' '}
              &nbsp;&nbsp;
              <span className="font-semibold">Unfollows:</span>{' '}
              {data.unfollower} &nbsp;&nbsp;
              <span className="font-semibold">Unknown:</span> {data.unknown}
            </p>
            <ChartContainer config={chartConfig}>
              <BarChart width={400} height={250} data={chartData}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="label" stroke="currentColor" />
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
                  wrapperStyle={{
                    backgroundColor: 'transparent'
                  }}
                />
                <Bar dataKey="value">
                  {chartData.map((entry, idx) => (
                    <Cell
                      key={`cell-${idx}`}
                      fill={
                        entry.value >= 0 ? 'var(--chart-1)' : 'var(--chart-2)'
                      }
                    />
                  ))}
                  <LabelList dataKey="value" position="top" />
                </Bar>
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

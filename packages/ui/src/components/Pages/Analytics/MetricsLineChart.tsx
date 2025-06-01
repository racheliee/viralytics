'use client'

import ChartCardBase from '@viralytics/components/Charts/ChartCardBase'
import LineChartBase, {
  LineChartBreakdown,
  LineChartData
} from '@viralytics/components/Charts/LineChartBase'
import { ChartColors } from '@viralytics/components/Charts/types/Colours'
import { ChartConfigBase } from '@viralytics/components/Charts/types/config'
import { ChartContainer } from '@viralytics/components/ui/chart'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@viralytics/components/ui/select'
import { endOfMonth, format, startOfMonth, subMonths } from 'date-fns'
import { useEffect, useState } from 'react'

interface Metric {
  name: string
  total_value: number
  breakdown_results: {
    dimension_value: string
    value: number
  }[]
}

interface MetricsResponse {
  data: Metric[]
}

const METRICS = {
  likes: { name: 'Likes', color: ChartColors[0] },
  comments: { name: 'Comments', color: ChartColors[1] },
  shares: { name: 'Shares', color: ChartColors[2] },
  saves: { name: 'Saves', color: ChartColors[3] },
  total_interactions: { name: 'Total Interactions', color: ChartColors[4] },
  replies: { name: 'Replies', color: ChartColors[5] }
}

export default function MetricsLineChart() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [chartData, setChartData] = useState<LineChartData[]>([])
  const [breakdowns, setBreakdowns] = useState<
    Record<string, Record<string, LineChartBreakdown[]>>
  >({})
  const [selectedMetric, setSelectedMetric] = useState<string>(
    Object.keys(METRICS)[0] || ''
  )

  useEffect(() => {
    const fetchMetricsData = async () => {
      setLoading(true)
      setError(null)

      try {
        const monthlyData: Record<string, LineChartData> = {}
        const monthlyBreakdowns: Record<
          string,
          Record<string, LineChartBreakdown[]>
        > = {}

        // Prepare requests for the last 6 months
        const requests: Promise<Response>[] = []
        const monthKeys: string[] = []

        for (let i = 5; i >= 0; i--) {
          const currentDate = new Date()
          const targetMonth = subMonths(currentDate, i)
          const since = startOfMonth(targetMonth)
          const until = endOfMonth(targetMonth)

          const monthKey = format(targetMonth, 'MMM yyyy')
          monthKeys.push(monthKey)

          // Initialize the month data
          if (!monthlyData[monthKey]) {
            monthlyData[monthKey] = { date: monthKey }
          }

          // Create the request
          requests.push(
            fetch('/api/instagram/metrics/all', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                since: since.toISOString(),
                until: until.toISOString()
              })
            })
          )
        }

        // Execute all requests in parallel
        const responses = await Promise.all(requests)

        // Process all responses
        const results = await Promise.all(
          responses.map(async (response, index) => {
            if (!response.ok) {
              throw new Error(`Failed to fetch metrics for ${monthKeys[index]}`)
            }
            return await response.json()
          })
        )

        // Process the results
        results.forEach((result: MetricsResponse, index) => {
          const monthKey = monthKeys[index]

          // Process each metric
          result.data.forEach((metric) => {
            // Ensure the metric exists and has a name
            if (!metric || !metric.name) return

            // Initialize the metric in breakdowns if it doesn't exist
            if (!monthlyBreakdowns[metric.name]) {
              monthlyBreakdowns[metric.name] = {}
            }

            // Add the total value to monthly data if it's a valid number
            if (
              typeof metric.total_value === 'number' &&
              !isNaN(metric.total_value)
            ) {
              monthlyData[monthKey][metric.name] = metric.total_value
            } else {
              // Use 0 as fallback value for missing data points
              // This avoids the type error while still showing the point on the chart
              monthlyData[monthKey][metric.name] = 0
            }

            // Process breakdowns if they exist
            if (
              metric.breakdown_results &&
              Array.isArray(metric.breakdown_results)
            ) {
              // Only add valid breakdowns
              const validBreakdowns = metric.breakdown_results.filter(
                (br) => br && typeof br.value === 'number' && !isNaN(br.value)
              )

              if (validBreakdowns.length > 0) {
                monthlyBreakdowns[metric.name][monthKey] = validBreakdowns.map(
                  (br) => ({
                    name: metric.name,
                    dimension_value: br.dimension_value || 'Unknown',
                    value: br.value
                  })
                )
              }
            }
          })
        })

        // Convert to array format for the chart
        const formattedData = Object.values(monthlyData) as LineChartData[]
        setChartData(formattedData)
        setBreakdowns(monthlyBreakdowns)
      } catch (err) {
        console.error('Error fetching metrics data:', err)
        setError(
          err instanceof Error ? err.message : 'Failed to fetch metrics data'
        )
      } finally {
        setLoading(false)
      }
    }

    fetchMetricsData()
  }, [])

  const handleMetricChange = (value: string) => {
    setSelectedMetric(value)
  }

  // Format metric name for display
  const formatMetricName = (metric: string): string => {
    return METRICS[metric as keyof typeof METRICS]?.name || metric
  }

  // Get available metrics from the data
  const availableMetrics = Object.keys(METRICS)

  // Function to filter lines based on selected metric
  const getChartLines = () => {
    if (!selectedMetric || !METRICS[selectedMetric as keyof typeof METRICS]) {
      return [] // Return empty array if no valid metric is selected
    }
    // Show only the selected metric
    return [
      {
        dataKey: selectedMetric,
        name:
          METRICS[selectedMetric as keyof typeof METRICS]?.name ||
          selectedMetric,
        color:
          METRICS[selectedMetric as keyof typeof METRICS]?.color ||
          ChartColors[1],
        breakdowns: breakdowns[selectedMetric]
      }
    ]
  }

  return (
    <ChartCardBase
      loading={loading}
      error={error}
      title="Engagement Metrics Over Time"
      description="Monthly engagement metrics for the past 6 months. Hover over data points to see breakdowns by content type."
      headerRight={
        <Select value={selectedMetric} onValueChange={handleMetricChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select metric" />
          </SelectTrigger>
          <SelectContent>
            {availableMetrics.map((metric) => (
              <SelectItem key={metric} value={metric}>
                {formatMetricName(metric)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      }
    >
      {!chartData.length ||
      !chartData.some((item) => typeof item[selectedMetric] === 'number') ? (
        <div className="h-[250px] flex items-center justify-center">
          <p className="text-muted-foreground">
            No data available for {formatMetricName(selectedMetric)}
          </p>
        </div>
      ) : (
        <ChartContainer config={ChartConfigBase}>
          <LineChartBase
            data={chartData}
            lines={getChartLines()}
            width={400}
            height={200}
            yAxisFormatter={(value) => value.toLocaleString()}
            tooltipFormatter={(value) => value.toLocaleString()}
          />
        </ChartContainer>
      )}
    </ChartCardBase>
  )
}

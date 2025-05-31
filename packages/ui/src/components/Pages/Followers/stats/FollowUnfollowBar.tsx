'use client'

import { useEffect, useState, useCallback } from 'react'
import { ChartContainer } from '@viralytics/components/ui/chart'
import { BarChartBase } from '@viralytics/components/Charts/BarChartBase'
import { DatePicker } from '@viralytics/components/Components/DatePicker'
import ChartCardBase from '@viralytics/components/Charts/ChartCardBase'
import { ChartConfigBase } from '@viralytics/components/Charts/types/config'
import { Button } from '@viralytics/components/ui/button'
import { Search } from 'lucide-react'

const today = new Date()
const oneYearAgo = new Date()
oneYearAgo.setFullYear(today.getFullYear() - 1)

export default function FollowUnfollowBar() {
  const [data, setData] = useState<{
    follower: number
    unfollower: number
    unknown: number
  } | null>(null)

  const [startDate, setStartDate] = useState<Date | undefined>(oneYearAgo)
  const [endDate, setEndDate] = useState<Date | undefined>(today)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    if (!startDate || !endDate) return

    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/instagram/follows-and-unfollows', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          since: startDate.toISOString(),
          until: endDate.toISOString()
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
  }, [startDate, endDate])

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
    <ChartCardBase
      loading={loading}
      error={error}
      title="Follow and Unfollow Activity"
      description={`Select a start and end date to filter (Only 2 years of data is available). \n Note: This doesn’t count people who unfollowed you without first following you during that period.`}
      headerRight={
        <div className="flex flex-row space-x-2">
          <DatePicker
            label="Pick a Start Date"
            date={startDate}
            onChange={setStartDate}
          />
          <span className="items-center"> - </span>
          <DatePicker
            label="Pick an End Date"
            date={endDate}
            onChange={setEndDate}
          />
          <Button
            size="icon"
            onClick={fetchData}
            disabled={!startDate || !endDate}
            title="Search"
          >
            <Search className="w-4 h-4" />
          </Button>
        </div>
      }
    >
      {data && (
        <div className="flex flex-row justify-between gap-4">
          <div className="flex flex-col mb-4 max-w-sm">
            <span className="font-bold text-9xl">
              {data.follower + data.unfollower > 0
                ? `+${data.follower + data.unfollower}`
                : data.follower + data.unfollower}
            </span>
            <span className="font-semibold">Net Change</span>{' '}
          </div>
          <div className="flex-1 min-w-60">
            <ChartContainer config={ChartConfigBase}>
              <BarChartBase data={chartData} height={150} />
            </ChartContainer>
          </div>
        </div>
      )}
    </ChartCardBase>
  )
}

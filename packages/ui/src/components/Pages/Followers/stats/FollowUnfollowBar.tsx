'use client'

import { useEffect, useState, useCallback } from 'react'
import { ChartContainer} from '@viralytics/components/ui/chart'
import { BarChartBase } from '@viralytics/components/Charts/BarChartBase'
import { DatePicker } from '@viralytics/components/Components/DatePicker'
import ChartCardBase from '@viralytics/components/Charts/ChartCardBase'
import { ChartConfigBase } from '@viralytics/components/Charts/types/config'

export default function FollowUnfollowBar() {
  const [data, setData] = useState<{
    follower: number
    unfollower: number
    unknown: number
  } | null>(null)

  const [startDate, setStartDate] = useState<Date>()
  const [endDate, setEndDate] = useState<Date>()
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
    <ChartCardBase
      loading={loading}
      error={error}
      title="Follow Activity"
      description="Follows and unfollows. Select a start and end date to filter. Note: This doesn’t count people who unfollowed you without first following you during that period. Only 2 years of data is available."
      headerRight={
        <div className="flex flex-col space-y-2">
          <DatePicker
            label="Pick a Start Date"
            date={startDate}
            onChange={setStartDate}
          />
          <DatePicker
            label="Pick an End Date"
            date={endDate}
            onChange={setEndDate}
          />
        </div>
      }
    >
      {data && (
        <>
          <p className="mb-4 text-sm">
            <span className="font-semibold">Follows:</span> {data.follower}{' '}
            &nbsp;&nbsp;
            <span className="font-semibold">Unfollows:</span> {data.unfollower}{' '}
            &nbsp;&nbsp;
            <span className="font-semibold">Unknown:</span> {data.unknown}
          </p>
          <ChartContainer config={ChartConfigBase}>
            <BarChartBase data={chartData} />
          </ChartContainer>
        </>
      )}
    </ChartCardBase>
  )
}

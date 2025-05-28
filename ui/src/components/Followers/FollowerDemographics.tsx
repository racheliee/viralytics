'use client'

import { Skeleton } from '@mui/material'
import BarGraph from '@viralytics/components/Stats/BarGraph'
import { Label } from '@viralytics/components/ui/label'
import { Select } from '@viralytics/components/ui/select'
import { useEffect, useState, useCallback } from 'react'

interface BreakdownResult {
  ranges: string[]
  value: number
}

interface Breakdown {
  dimension_keys: string
  results: BreakdownResult[]
}

export default function FollowerDemographics() {
  const [breakdown, setBreakdown] = useState<Breakdown | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedBreakdown, setSelectedBreakdown] = useState('gender')
  const [selectedTimeframe, setSelectedTimeframe] = useState('last_30_days')

  const fetchDemographics = useCallback(async () => {
    console.log(`api call: ${process.env.NEXT_PUBLIC_API_URL}/instagram/demographics/followers`)
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/instagram/demographics/followers`,
        {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            breakdown: selectedBreakdown,
            timeframe: selectedTimeframe
          })
        }
      )
      if (!res.ok) throw new Error('Failed to fetch demographics')
      const data = await res.json()
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
    <div className="space-y-6">
      <div className="flex gap-4 items-center">
        <div>
          <Label htmlFor="breakdown">Breakdown</Label>
          <Select
            value={selectedBreakdown}
            onValueChange={setSelectedBreakdown}
          >
            <option value="gender">Gender</option>
            <option value="age">Age</option>
            <option value="country">Country</option>
          </Select>
        </div>
        <div>
          <Label htmlFor="timeframe">Timeframe</Label>
          <Select
            value={selectedTimeframe}
            onValueChange={setSelectedTimeframe}
          >
            <option value="last_14_days">Last 14 Days</option>
            <option value="last_30_days">Last 30 Days</option>
            <option value="last_90_days">Last 90 Days</option>
            <option value="prev_month">Previous Month</option>
            <option value="this_month">This Month</option>
          </Select>
        </div>
      </div>

      {loading ? (
        <Skeleton className="w-full h-96 rounded-lg" />
      ) : error ? (
        <div className="text-red-500">{error}</div>
      ) : breakdown ? (
        <BarGraph breakdown={breakdown} title="Follower Demographics" />
      ) : null}
    </div>
  )
}

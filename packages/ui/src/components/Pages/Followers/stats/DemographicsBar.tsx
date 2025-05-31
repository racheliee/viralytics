'use client'

import { useEffect, useState, useCallback } from 'react'

import { ChartContainer } from '@viralytics/components/ui/chart'
import { TimeframeEnum } from '@viralytics/shared-constants'
import { capitalize, timeframeLabels } from '@viralytics/lib/utils'
import { ChartConfigBase } from '@viralytics/components/Charts/types/config'
import { BarChartBase } from '@viralytics/components/Charts/BarChartBase'
import ChartCardBase from '@viralytics/components/Charts/ChartCardBase'
import {
  DemographicsProps,
  Breakdown
} from '@viralytics/components/Pages/Followers/stats/DemographicsTypes'
import { TimeframeSelect } from '@viralytics/components/Components/TimeframeSelect'

export default function DemographicsBar({
  type,
  breakdown,
  timeframe
}: DemographicsProps) {
  const [data, setData] = useState<Breakdown | null>(null)
  const [selectedTimeframe, setSelectedTimeframe] = useState<TimeframeEnum>(
    timeframe || TimeframeEnum.LAST_30_DAYS
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
    <div className="w-full">
      <ChartCardBase
        loading={loading}
        error={error}
        title={`Follower Breakdown by ${data ? capitalize(data.dimension_key[0]) : ''}`}
        description={
          data
            ? `${capitalize(data.dimension_key[0])} breakdown for the last ${timeframeLabels[selectedTimeframe]}`
            : ''
        }
        headerRight={
          <TimeframeSelect
            selected={selectedTimeframe}
            onChange={setSelectedTimeframe}
          />
        }
      >
        {data && (
          <ChartContainer config={ChartConfigBase}>
            <BarChartBase
              data={data.results.map(({ keyLabel, value }) => ({
                label: keyLabel,
                value
              }))}
            />
          </ChartContainer>
        )}
      </ChartCardBase>
    </div>
  )
}

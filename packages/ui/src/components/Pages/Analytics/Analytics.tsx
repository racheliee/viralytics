'use client'

import React from 'react'
import DashboardWrapper from '@viralytics/components/DashboardWrapper'
import {
  DemographicBreakdownEnum,
  TimeframeEnum
} from '@viralytics/shared-constants'
import DemographicsPie from '@viralytics/components/Pages/Followers/stats/DemographicsPie'
import DemographicsBar from '@viralytics/components/Pages/Followers/stats/DemographicsBar'
import MetricsLineChart from '@viralytics/components/Pages/Analytics/MetricsLineChart'

export default function Analytics() {
  return (
    <DashboardWrapper title="Instagram Analytics">
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Engagement Metrics</h2>
        <MetricsLineChart />
      </div>
      
      <h2 className="text-xl font-semibold mb-4">Engaged Audience Insights</h2>
      <div className="flex flex-row items-center justify-between gap-6 mb-6">
        <DemographicsBar
          type="engaged-audience"
          breakdown={DemographicBreakdownEnum.AGE}
          timeframe={TimeframeEnum.LAST_90_DAYS}
        />
        <DemographicsPie
          type="engaged-audience"
          breakdown={DemographicBreakdownEnum.GENDER}
          timeframe={TimeframeEnum.LAST_90_DAYS}
        />
      </div>
      <DemographicsBar
        type="engaged-audience"
        breakdown={DemographicBreakdownEnum.COUNTRY}
        timeframe={TimeframeEnum.LAST_90_DAYS}
      />
    </DashboardWrapper>
  )
}

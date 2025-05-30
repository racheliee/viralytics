'use client'

import React from 'react'
import DemographicsBar from '@viralytics/components/Charts/DemographicsBar'
import DashboardWrapper from '@viralytics/components/DashboardWrapper'
import {
  DemographicBreakdownEnum,
  TimeframeEnum
} from '@viralytics/shared-constants'
import DemographicsPie from '@viralytics/components/Charts/DemographicsPie'

export default function Analytics() {
  return (
    <DashboardWrapper title="Instagram Analytics">
      <h2 className="text-xl font-semibold mb-4">Engaged Audience Insights</h2>
      <div className="flex flex-row items-center justify-between gap-6">
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

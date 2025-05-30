'use client'

import React from 'react'
import DashboardWrapper from '@viralytics/components/DashboardWrapper'
import DemographicsBar from '@viralytics/components/Charts/DemographicsBar'
import { DemographicBreakdownEnum } from '@viralytics/shared-constants'
import DemographicsPie from '@viralytics/components/Charts/DemographicsPie'

export default function Followers() {
  return (
    <DashboardWrapper title="Followers Insights" className="gap-12">
      <div className="flex flex-row items-center justify-between gap-6">
        <DemographicsBar
          type="followers"
          breakdown={DemographicBreakdownEnum.AGE}
        />
        <DemographicsPie
          type="followers"
          breakdown={DemographicBreakdownEnum.GENDER}
        />
      </div>
      <DemographicsBar
        type="followers"
        breakdown={DemographicBreakdownEnum.COUNTRY}
      />
    </DashboardWrapper>
  )
}

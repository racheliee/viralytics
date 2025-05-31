'use client'

import React from 'react'
import DashboardWrapper from '@viralytics/components/DashboardWrapper'
import { DemographicBreakdownEnum } from '@viralytics/shared-constants'
import DemographicsPie from '@viralytics/components/Pages/Followers/stats/DemographicsPie'
import FollowUnfollowBar from '@viralytics/components/Pages/Followers/stats/FollowUnfollowBar'
import DemographicsBar from '@viralytics/components/Pages/Followers/stats/DemographicsBar'

export default function Followers() {
  return (
    <DashboardWrapper title="Followers Insights" className="gap-12">
      <FollowUnfollowBar />
      <h2 className="text-xl font-semibold mb-4 mt-8">Follower Demographics</h2>
      <div className="flex flex-row items-center justify-between gap-6 mb-6">
        <DemographicsBar
          type="followers"
          breakdown={DemographicBreakdownEnum.AGE}
        />
        <DemographicsPie
          type="followers"
          breakdown={DemographicBreakdownEnum.GENDER}
        />
        {/* todo: add age & gender demographic */}
      </div>
      <DemographicsBar
        type="followers"
        breakdown={DemographicBreakdownEnum.COUNTRY}
      />
    </DashboardWrapper>
  )
}

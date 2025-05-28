'use client'

import React from 'react'
// import FollowerStats from '@viralytics/components/Followers/FollowerStats'
// import { FollowerTrends } from '@viralytics/components/Followers/FollowerTrends'
// import { ActivityHeatmap } from '@viralytics/components/Followers/ActivityHeatmap'
// import { FollowRelationships } from '@viralytics/components/Followers/FollowRelationships'
import DashboardWrapper from '@viralytics/components/DashboardWrapper'
import FollowerDemographics from '@viralytics/components/Followers/FollowerDemographics'

export default function Followers() {
  return (
    <DashboardWrapper title="Followers Insights">
      <FollowerDemographics />
      <div className="flex flex-row items-center justify-between gap-4">
        {/* <FollowerStats />
        <FollowerTrends /> */}
      </div>
      {/* <ActivityHeatmap />
      <FollowRelationships /> */}
    </DashboardWrapper>
  )
}

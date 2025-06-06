'use client'

import MediaUploader from '@viralytics/components/Components/MediaUploader'
import DashboardWrapper from '@viralytics/components/DashboardWrapper'


export default function AbTesting() {
  return (
    <DashboardWrapper title="AB Testing">
      <div className="max-w-3xl mx-auto p-6">
        <MediaUploader maxFileNum={3}/>
      </div>
    </DashboardWrapper>
  )
}

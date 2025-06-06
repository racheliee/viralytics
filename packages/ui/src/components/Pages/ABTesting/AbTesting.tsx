'use client'

import MediaUploader from '@viralytics/components/Components/MediaUploader'
import DashboardWrapper from '@viralytics/components/DashboardWrapper'

export default function AbTesting() {
  const evaluateBest = async (): Promise<number> => {
    // const res = await fetch('/api/model/vitr', { method: 'POST' })
    // if (!res.ok) throw new Error('Failed to evaluate')
    // const data = await res.json()
    // // adjust this if the response shape is different
    // return typeof data === 'number' ? data : data.index

    // mock
    await new Promise((resolve) => setTimeout(resolve, 500))
    return 0
  }
  return (
    <DashboardWrapper title="AB Testing">
      <div className="max-w-3xl mx-auto p-6">
        <MediaUploader onEvaluate={evaluateBest} maxFileNum={3} />
      </div>
    </DashboardWrapper>
  )
}

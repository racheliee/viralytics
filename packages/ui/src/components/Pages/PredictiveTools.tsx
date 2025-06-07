'use client'

import { useState } from 'react'
import { DatePicker } from '@viralytics/components/Components/DatePicker'
import MediaUploader from '@viralytics/components/Components/MediaUploader'
import DashboardWrapper from '@viralytics/components/DashboardWrapper'
import { Button } from '@viralytics/components/ui/button'
import { Separator } from '@viralytics/components/ui/separator'
import { Textarea } from '@viralytics/components/ui/textarea'

export default function PredictiveTools() {
  const [files, setFiles] = useState<File[]>([])
  const [caption, setCaption] = useState('')
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const [results, setResults] = useState<string | null>(null)

  const handleSubmit = async (): Promise<void> => {
    await new Promise((resolve) => setTimeout(resolve, 500))
    console.log('Submitted:', { files, caption, selectedDate })
    setResults('Predicted to perform well with high engagement!')
  }

  return (
    <DashboardWrapper title="Predictive Tools">
      <div className="flex flex-col md:flex-row gap-6 w-full">
        <div className="w-full md:w-1/2 space-y-4 p-2">
          <MediaUploader
            files={files}
            setFiles={setFiles}
            showBest={false}
          />
          <Textarea
            placeholder="Enter post caption..."
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
          />
          <div>
            <DatePicker
              label="Select Post Date"
              date={selectedDate}
              onChange={setSelectedDate}
            />
          </div>

          <Button onClick={handleSubmit} disabled={files.length === 0}>
            Predict Outcome
          </Button>
        </div>

        <Separator
          orientation="vertical"
          className="hidden md:block h-auto min-h-[300px] mx-4 w-0.5"
        />

        <div className="w-full md:w-1/2">
          <h3 className="text-lg font-semibold mb-2">Prediction Result</h3>
          <div className="p-4 border rounded-md bg-muted text-muted-foreground min-h-[150px]">
            {results || 'Submit a post to see predicted performance.'}
          </div>
        </div>
      </div>
    </DashboardWrapper>
  )
}

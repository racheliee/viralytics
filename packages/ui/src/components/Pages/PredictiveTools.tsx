'use client'

import { useState } from 'react'
import { DatePicker } from '@viralytics/components/Components/DatePicker'
import MediaUploader from '@viralytics/components/Components/MediaUploader'
import DashboardWrapper from '@viralytics/components/DashboardWrapper'
import { Button } from '@viralytics/components/ui/button'
import { Separator } from '@viralytics/components/ui/separator'
import { Textarea } from '@viralytics/components/ui/textarea'
import { toast } from 'sonner'
import ReactMarkdown from 'react-markdown'
import CountUp from 'react-countup'
import { Loader2 } from 'lucide-react'

export default function PredictiveTools() {
  const [files, setFiles] = useState<File[]>([])
  const [caption, setCaption] = useState('')
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const [likes, setLikes] = useState<number | null>(null)
  const [llmResponse, setLlmResponse] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (): Promise<void> => {
    const now = new Date()

    if (files.length === 0) {
      toast.error('Please upload at least one media file.')
      return
    }

    if (
      !selectedDate ||
      selectedDate.setHours(0, 0, 0, 0) < now.setHours(0, 0, 0, 0)
    ) {
      toast.error('Please select a valid future date for the post.')
      return
    }

    try {
      setIsLoading(true)
      const res = await fetch('/api/model/like-predictor', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          fileNum: files.length,
          date: selectedDate.toISOString().split('T')[0] // 'YYYY-MM-DD'
        })
      })

      if (!res.ok) throw new Error('Prediction failed')

      const data = await res.json()
      setLikes(data.likes)
      setLlmResponse(data.llmResponse)

      toast.success('Prediction completed successfully!')
    } catch (err) {
      toast.error('Failed to get prediction')
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <DashboardWrapper title="Predictive Tools">
      <div className="flex flex-col md:flex-row gap-6 w-full">
        <div className="w-full md:w-1/2 space-y-4 p-2">
          <MediaUploader files={files} setFiles={setFiles} showBest={false} />
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
        <div className="w-full md:w-1/2 space-y-4">
          <h3 className="text-lg font-semibold">Prediction Result</h3>
          <div className="min-h-[80px]">
            {isLoading ? (
              <div className="flex items-center justify-center w-full h-64">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <>
                <div className="min-h-[80px] mb-80">
                  {likes !== null ? (
                    <div className="text-start align-text-bottom flex flex-row items-end gap-4">
                      <div className="text-9xl font-bold text-green-800 dark:text-green-200">
                        <CountUp end={likes} duration={2} />
                      </div>
                      <div className="text-2xl font-medium mt-2">likes</div>
                    </div>
                  ) : (
                    <div className="text-gray-500">
                      Submit a post to see predicted performance.
                    </div>
                  )}
                </div>

                {llmResponse && (
                  <div className="bg-gray-50 dark:bg-zinc-900 p-6 rounded-lg shadow-sm border border-border">
                    <h4 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-100">
                      LLM-Generated Report
                    </h4>
                    <div className="prose prose-sm dark:prose-invert max-w-none leading-relaxed">
                      <ReactMarkdown>{llmResponse}</ReactMarkdown>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </DashboardWrapper>
  )
}

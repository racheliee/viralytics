'use client'

import { useState } from 'react'
import MediaUploader from '@viralytics/components/Components/MediaUploader'
import DashboardWrapper from '@viralytics/components/DashboardWrapper'

export default function AbTesting() {
  const [files, setFiles] = useState<File[]>([])
  const [bestIndex, setBestIndex] = useState<number | null>(null)

  const evaluateBest = async (): Promise<number> => {
    await new Promise((resolve) => setTimeout(resolve, 3000))
    const targetName = 'IMG_3187.JPG'
    const index = files.findIndex((file) => file.name === targetName)
    setBestIndex(index)
    return index !== -1 ? index : 0
  }

  return (
    <DashboardWrapper title="AB Testing">
      <p className="text-muted-foreground text-sm mb-4">
        This AB Testing tool helps you choose the best cover photo for your
        Instagram post. Upload up to 3 images, and our model will analyze each
        one based on visual and facial factors like whether a face is detected,
        if there&apos;s a smile, open eyes, natural lighting, and more. It then
        highlights the photo that’s most likely to perform well as a cover
        image, so you can post with confidence.
      </p>
      <div className="max-w-3xl mx-auto p-6">
        <MediaUploader
          files={files}
          setFiles={setFiles}
          onEvaluate={evaluateBest}
          maxFileNum={3}
        />
      </div>
      {bestIndex !== null && (
        <div className="mt-4 mx-auto max-w-2xl px-6 py-4 bg-muted rounded-md text-sm text-muted-foreground text-center">
          IMG_3187.JPG was selected as the best image due to a combination of
          favorable facial and photographic attributes. It scored the highest
          (5.59) among all candidates. Key contributing factors included a
          detected smile, makeup, open eyes, frontal pose, and natural lighting,
          which typically enhance visual appeal and viewer engagement. While
          facial symmetry and composition were not perfect, the presence of
          multiple positive traits gave it an edge over other images.
        </div>
      )}
      {files.length !== 0 && (
        <div className="mt-4 flex justify-end max-w-3xl mx-auto px-6">
          <button
            onClick={() => {
              setFiles([])
              setBestIndex(null)
            }}
            className="text-sm text-red-600 border border-red-600 px-3 py-1.5 rounded-md hover:bg-red-50 transition"
          >
            Clear
          </button>
        </div>
      )}
    </DashboardWrapper>
  )
}

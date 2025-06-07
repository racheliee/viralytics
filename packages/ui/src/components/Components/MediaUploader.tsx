'use client'

import { useEffect, useMemo, useState } from 'react'
import { UploadCloud } from 'lucide-react'
import Image from 'next/image'
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent
} from '@viralytics/components/ui/card'
import { Input } from '@viralytics/components/ui/input'
import { Button } from '@viralytics/components/ui/button'
interface MediaUploaderProps {
  files: File[]
  setFiles: React.Dispatch<React.SetStateAction<File[]>>
  onEvaluate: () => Promise<number>
  maxFileNum?: number
}

export default function MediaUploader({
  files,
  setFiles,
  onEvaluate,
  maxFileNum = 20
}: MediaUploaderProps) {
  const [bestIndex, setBestIndex] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files)

      // Limit total number of files
      const total = files.length + selectedFiles.length
      if (total > maxFileNum) {
        const allowedCount = maxFileNum - files.length
        setFiles((prev) => [...prev, ...selectedFiles.slice(0, allowedCount)])
      } else {
        setFiles((prev) => [...prev, ...selectedFiles])
      }
    }
  }

  const handleCheckBest = async () => {
    try {
      setLoading(true)
      const index = await onEvaluate()
      setBestIndex(index)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const filePreviews = useMemo(() => {
    return files.map((file) => ({
      file,
      url: URL.createObjectURL(file)
    }))
  }, [files])

  const bestFile = filePreviews[bestIndex!]

  useEffect(() => {
    return () => {
      filePreviews.forEach(({ url }) => URL.revokeObjectURL(url))
    }
  }, [filePreviews])

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex items-center gap-2">
          <UploadCloud className="w-6 h-6 text-muted-foreground" />
          <CardTitle className="text-lg">Upload Your Media</CardTitle>
        </CardHeader>
        <CardContent>
          <Input
            type="file"
            multiple
            accept="image/*,video/*"
            onChange={handleFileChange}
            disabled={files.length >= maxFileNum}
            className="cursor-pointer"
          />
          <p className="text-sm text-muted-foreground mt-2">
            {files.length} files uploaded (Upto {maxFileNum} allowed)
          </p>
        </CardContent>
      </Card>

      {files.length > 0 && (
        <>
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {filePreviews.map(({ file, url }, idx) => {
              const isImage = file.type.startsWith('image')
              return (
                <Card key={idx}>
                  <CardContent className="p-3 space-y-2">
                    {isImage ? (
                      <div className="relative w-full h-60 rounded-md overflow-hidden">
                        <Image
                          src={url}
                          alt={`preview-${idx}`}
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      </div>
                    ) : (
                      <video
                        src={url}
                        controls
                        className="rounded-md w-full object-cover max-h-60"
                      />
                    )}
                    <p className="text-sm text-muted-foreground truncate">
                      {file.name}
                    </p>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          <div className="flex justify-end">
            <Button onClick={handleCheckBest} disabled={loading}>
              {loading ? 'Evaluating...' : 'Check Best Choice'}
            </Button>
          </div>
        </>
      )}

      {bestIndex !== null && (
        <Card className="mt-8 border-2 border-green-500 shadow-md">
          <CardHeader>
            <CardTitle className="text-green-600 text-xl">
              Best Choice
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-3">
            <div className="relative w-full h-[400px] rounded-md overflow-hidden">
              <Image
                src={bestFile.url}
                alt={`best-choice-${bestIndex}`}
                fill
                className="object-cover rounded-md"
                unoptimized
              />
            </div>
            <p className="text-sm text-muted-foreground truncate">
              {files[bestIndex].name}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

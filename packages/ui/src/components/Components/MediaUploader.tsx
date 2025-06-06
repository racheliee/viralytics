'use client'

import { useState } from 'react'
import { UploadCloud } from 'lucide-react'
import Image from 'next/image'
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent
} from '@viralytics/components/ui/card'
import { Input } from '@viralytics/components/ui/input'

interface MediaUploaderProps {
  maxFileNum?: number
}

export default function MediaUploader({ maxFileNum = 5 }: MediaUploaderProps) {
  const [files, setFiles] = useState<File[]>([])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files)

      // Limit total number of files
      const total = files.length + selectedFiles.length
      if (total > maxFileNum) {
        const allowedCount = maxFileNum - files.length
        setFiles(prev => [...prev, ...selectedFiles.slice(0, allowedCount)])
      } else {
        setFiles(prev => [...prev, ...selectedFiles])
      }
    }
  }

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
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {files.map((file, idx) => {
            const url = URL.createObjectURL(file)
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
      )}
    </div>
  )
}

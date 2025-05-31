import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@viralytics/components/ui/card'
import { AlertCircle, Loader2 } from 'lucide-react'
import { ReactNode } from 'react'

interface ChartCardBaseProps {
  loading: boolean
  error: string | null
  title: string
  description: string
  headerRight?: ReactNode
  children: ReactNode
}

export default function ChartCardBase({
  loading,
  error,
  title,
  description,
  headerRight,
  children
}: ChartCardBaseProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center w-full h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center w-full h-64 text-destructive">
        <AlertCircle className="w-6 h-6 mb-2" />
        <p className="text-sm font-medium">Something went wrong</p>
        <p className="text-xs text-muted-foreground mt-1 text-center max-w-sm">
          {error}
        </p>
      </div>
    )
  }

  return (
    <Card className="shadow-lg bg-background text-foreground">
      <div className="flex items-start justify-between flex-row pe-4">
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <div className="pt-4">{headerRight}</div>
      </div>
      <CardContent>{children}</CardContent>
    </Card>
  )
} 

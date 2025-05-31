import Analytics from '@viralytics/components/Pages/Analytics/Analytics'
import AuthTokenHandler from '@viralytics/components/AuthTokenHandler'

export default function DashboardPage() {
  return (
    <>
      <AuthTokenHandler />
      <Analytics />
    </>
  )
}

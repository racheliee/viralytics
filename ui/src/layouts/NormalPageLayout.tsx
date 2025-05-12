import { FC, memo, PropsWithChildren, ReactElement, ReactNode } from 'react'

import { Sidebar } from '@viralytics/layouts/Sidebar'
import { useTab } from '@viralytics/hooks/useTab'

const PageLayoutWrapper: FC<PropsWithChildren> = ({ children }) => {
  const { tab } = useTab()
  console.log('visible', tab)
  return (
    <div className="flex">
      <Sidebar visible={true} />
      <main className="flex-1 p-4">{children}</main>
    </div>
  )
}

export const WithPageLayout = (
  Page: FC & { getLayout?: (page: ReactElement) => ReactNode }
) => {
  Page = memo(Page)

  Page.getLayout = (page: ReactElement) => {
    return <PageLayoutWrapper>{page}</PageLayoutWrapper>
  }

  return Page
}

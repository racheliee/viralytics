'use client'

import { TabsEnum } from '@viralytics/constants/tabs'
import { usePathname } from 'next/navigation'

export const useTab = () => {
  const pathname = usePathname()

  const tab = pathname.split('/').pop() as keyof typeof TabsEnum | undefined

  const tabInfo = tab ? TabsEnum[tab] : undefined

  return {
    tab,
    tabInfo
  }
}

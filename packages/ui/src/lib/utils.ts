import { TimeframeEnum } from '@viralytics/shared-constants'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)

export const timeframeLabels: Record<TimeframeEnum, string> = {
  [TimeframeEnum.LAST_14_DAYS]: 'Last 14 Days',
  [TimeframeEnum.LAST_30_DAYS]: 'Last 30 Days',
  [TimeframeEnum.LAST_90_DAYS]: 'Last 90 Days',
  [TimeframeEnum.PREV_MONTH]: 'Previous Month',
  [TimeframeEnum.THIS_MONTH]: 'This Month'
}

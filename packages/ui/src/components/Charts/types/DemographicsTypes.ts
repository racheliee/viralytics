import {
  DemographicBreakdownEnum,
  TimeframeEnum
} from '@viralytics/shared-constants'

export const timeframeLabels: Record<TimeframeEnum, string> = {
  [TimeframeEnum.LAST_14_DAYS]: 'Last 14 Days',
  [TimeframeEnum.LAST_30_DAYS]: 'Last 30 Days',
  [TimeframeEnum.LAST_90_DAYS]: 'Last 90 Days',
  [TimeframeEnum.PREV_MONTH]: 'Previous Month',
  [TimeframeEnum.THIS_MONTH]: 'This Month'
}

export interface BreakdownResult {
  keyLabel: string
  value: number
}

export interface Breakdown {
  dimension_key: string
  results: BreakdownResult[]
}

export interface DemographicsProps {
  type: 'followers' | 'engaged-audience'
  breakdown: DemographicBreakdownEnum
  timeframe?: TimeframeEnum
}

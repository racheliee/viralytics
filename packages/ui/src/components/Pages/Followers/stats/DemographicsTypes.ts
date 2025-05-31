import {
  DemographicBreakdownEnum,
  TimeframeEnum
} from '@viralytics/shared-constants'

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
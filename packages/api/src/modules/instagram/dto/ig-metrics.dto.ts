import { IsArray, IsNumber, IsObject } from 'class-validator'
import { GeneralBreakdownEnum, MetricEnum } from '@viralytics/shared-constants'
import { IgGeneralRequestDto } from './ig-general.dto'

export class MetricsRequestDto extends IgGeneralRequestDto {
  constructor(since?: Date, until?: Date, breakdown?: GeneralBreakdownEnum) {
    super(breakdown, since, until)
  }
}

export class MetricBreakdownResult {
  dimension_values: string[]
  value: number

  constructor(dimension_values: string[], value: number) {
    this.dimension_values = dimension_values
    this.value = value
  }
}

export class MetricBreakdown {
  dimension_keys: string[]
  results: MetricBreakdownResult[]

  constructor(dimension_keys: string[], results: MetricBreakdownResult[]) {
    this.dimension_keys = dimension_keys
    this.results = results
  }
}

export class MetricTotalValue {
  value: number
  breakdowns?: MetricBreakdown[]

  constructor(value: number, breakdowns?: MetricBreakdown[]) {
    this.value = value
    this.breakdowns = breakdowns
  }
}

export class MetricDataItem {
  name: string
  period: string
  title: string
  description: string
  total_value: MetricTotalValue
  id: string

  constructor(
    name: string,
    period: string,
    title: string,
    description: string,
    total_value: MetricTotalValue,
    id: string
  ) {
    this.name = name
    this.period = period
    this.title = title
    this.description = description
    this.total_value = total_value
    this.id = id
  }
}

export class MetricsResponseDto {
  @IsArray()
  data: MetricDataItem[]

  constructor(data: MetricDataItem[]) {
    this.data = data
  }
}

// Simplified DTOs for the metrics/all endpoint
export class SimplifiedBreakdownResult {
  dimension_value: string
  value: number

  constructor(dimension_value: string, value: number) {
    this.dimension_value = dimension_value
    this.value = value
  }
}

export class SimplifiedMetricData {
  name: string
  total_value: number
  breakdown_results: SimplifiedBreakdownResult[]

  constructor(
    name: string,
    total_value: number,
    breakdown_results: SimplifiedBreakdownResult[]
  ) {
    this.name = name
    this.total_value = total_value
    this.breakdown_results = breakdown_results
  }
}

export class SimplifiedMetricsResponseDto {
  data: SimplifiedMetricData[]

  constructor(data: SimplifiedMetricData[]) {
    this.data = data
  }
}

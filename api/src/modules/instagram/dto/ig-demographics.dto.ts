import { IsArray, IsOptional, IsString } from 'class-validator'
import { DemographicBreakdownEnum, TimeframeEnum } from 'src/modules/instagram/constants/enums'
import { InstagramBreakdownResults } from 'src/modules/instagram/instagram.service'

export class DemographicsRequestDto {
  @IsString()
  breakdown: DemographicBreakdownEnum

  @IsString()
  timeframe: TimeframeEnum
}

export class DemographicsResponseDto {
  @IsString()
  dimension_key: string

  @IsArray()
  results: InstagramBreakdownResults[]

  constructor(dimension_key: string, results: InstagramBreakdownResults[]) {
    this.dimension_key = dimension_key
    this.results = results
  }
}
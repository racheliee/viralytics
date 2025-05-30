import {
  Injectable,
  HttpException,
  HttpStatus,
  InternalServerErrorException,
  Logger,
  BadRequestException
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import axios, { AxiosInstance } from 'axios'
import {
  GeneralBreakdownEnum,
  MetricEnum,
  MetricTypeEnum,
  PeriodEnum
} from '@viralytics/shared-constants'
import {
  DemographicsRequestDto,
  DemographicsResponseDto
} from 'src/modules/instagram/dto/ig-demographics.dto'
import {
  FollowAndUnfollowResponseDto,
  IgBreakdownRequestDto,
  IgTimeRangeDto
} from 'src/modules/instagram/dto/ig-general.dto'
export interface InstagramBreakdownResults {
  keyLabel: string
  value: number
}

@Injectable()
export class InstagramService {
  private readonly igApi: AxiosInstance
  private readonly logger = new Logger(InstagramService.name)

  constructor(private readonly config: ConfigService) {
    const version = this.config.get<string>('INSTAGRAM_API_VERSION', 'v17.0')
    this.igApi = axios.create({
      baseURL: `https://graph.instagram.com/${version}`,
      timeout: 5000,
      headers: { 'Content-Type': 'application/json' }
    })
  }

  async getDemographics(
    token: string,
    userId: string,
    metric: MetricEnum,
    { breakdown, timeframe }: DemographicsRequestDto
  ): Promise<DemographicsResponseDto> {
    const { data } = await this.igApi.get(`/${userId}/insights`, {
      params: {
        metric,
        access_token: token,
        period: PeriodEnum.LIFETIME,
        metric_type: MetricTypeEnum.TOTAL_VALUE,
        breakdown,
        timeframe
      }
    })

    const raw = data.data[0]
    const breakdownData = raw?.total_value?.breakdowns?.[0]

    const results: InstagramBreakdownResults[] =
      breakdownData?.results?.map((r: any) => ({
        keyLabel: r.dimension_values.join(', '),
        value: r.value
      })) || []

    return new DemographicsResponseDto(breakdown, results)
  }

  async getFollowsAndUnfollows(
    token: string,
    userId: string,
    { since, until }: IgTimeRangeDto
  ): Promise<FollowAndUnfollowResponseDto> {
    console.log(
      `${since ? `Since: ${Math.floor(new Date(since).getTime() / 1000)}` : 'No since date provided'}`
    )

    const params: Record<string, any> = {
      metric: MetricEnum.FOLLOWS_AND_UNFOLLOWS,
      access_token: token,
      period: PeriodEnum.DAY,
      metric_type: MetricTypeEnum.TOTAL_VALUE,
      breakdown: GeneralBreakdownEnum.FOLLOW_TYPE,
      ...(since && { since: Math.floor(new Date(since).getTime() / 1000) }),
      ...(until && { until: Math.floor(new Date(until).getTime() / 1000) })
    }

    console.log('Request parameters:', params)

    const { data } = await this.igApi.get(`/${userId}/insights`, {
      params
    })

    console.log(data)
    const raw = data.data[0]?.total_value?.breakdowns?.[0]?.results
    if (!Array.isArray(raw)) {
      console.error(
        'Unexpected format for breakdowns',
        JSON.stringify(data, null, 2)
      )
      throw new InternalServerErrorException('Unexpected API response format')
    }

    let follower = 0
    let unfollower = 0
    let unknown = 0

    for (const result of raw) {
      const dimension = result.dimension_values?.[0]
      const value = result.value ?? 0

      if (dimension === 'FOLLOWER') {
        follower += value
      } else if (dimension === 'NON_FOLLOWER') {
        unfollower -= value // return as negative count
      } else {
        unknown += value
      }
    }

    console.log(
      `Follows: ${follower}, Unfollows: ${unfollower}, Unknown: ${unknown}`
    )

    return new FollowAndUnfollowResponseDto(follower, unfollower, unknown)
  }
}

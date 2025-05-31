import {
  Injectable,
  InternalServerErrorException,
  Logger
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  GeneralBreakdownEnum,
  MetricEnum,
  MetricTypeEnum,
  PeriodEnum
} from '@viralytics/shared-constants'
import axios, { AxiosInstance } from 'axios'
import {
  DemographicsRequestDto,
  DemographicsResponseDto
} from 'src/modules/instagram/dto/ig-demographics.dto'
import {
  FollowAndUnfollowResponseDto,
  IgTimeRangeDto
} from 'src/modules/instagram/dto/ig-general.dto'
import {
  MetricsRequestDto,
  MetricsResponseDto,
  SimplifiedBreakdownResult,
  SimplifiedMetricData,
  SimplifiedMetricsResponseDto
} from 'src/modules/instagram/dto/ig-metrics.dto'
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

    return new DemographicsResponseDto([breakdown], results)
  }

  async getFollowsAndUnfollows(
    token: string,
    userId: string,
    { since, until }: IgTimeRangeDto
  ): Promise<FollowAndUnfollowResponseDto> {
    const params: Record<string, any> = {
      metric: MetricEnum.FOLLOWS_AND_UNFOLLOWS,
      access_token: token,
      period: PeriodEnum.DAY,
      metric_type: MetricTypeEnum.TOTAL_VALUE,
      breakdown: GeneralBreakdownEnum.FOLLOW_TYPE,
      ...(since && { since: Math.floor(new Date(since).getTime() / 1000) }),
      ...(until && { until: Math.floor(new Date(until).getTime() / 1000) })
    }

    const { data } = await this.igApi.get(`/${userId}/insights`, {
      params
    })

    const raw = data.data[0]?.total_value?.breakdowns?.[0]?.results
    if (!Array.isArray(raw)) {
      // console.error(
      //   'Unexpected format for breakdowns',
      //   JSON.stringify(data, null, 2)
      // )
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
    return new FollowAndUnfollowResponseDto(follower, unfollower, unknown)
  }

  async getReplies(
    token: string,
    userId: string,
    { since, until }: MetricsRequestDto
  ): Promise<MetricsResponseDto> {
    const params: Record<string, any> = {
      metric: MetricEnum.REPLIES,
      access_token: token,
      period: PeriodEnum.DAY,
      metric_type: MetricTypeEnum.TOTAL_VALUE,
      ...(since && { since: Math.floor(new Date(since).getTime() / 1000) }),
      // Use current date if until is not specified
      until: Math.floor(new Date(until || new Date()).getTime() / 1000)
    }

    const { data } = await this.igApi.get(`/${userId}/insights`, {
      params
    })

    // Return the data directly as it already has the correct format
    return { data: data.data }
  }

  async getMetricsWithBreakdown(
    token: string,
    userId: string,
    metric: MetricEnum,
    { since, until, breakdown }: MetricsRequestDto
  ): Promise<MetricsResponseDto> {
    const params: Record<string, any> = {
      metric,
      access_token: token,
      period: PeriodEnum.DAY,
      metric_type: MetricTypeEnum.TOTAL_VALUE,
      ...(breakdown && { breakdown }),
      ...(since && { since: Math.floor(new Date(since).getTime() / 1000) }),
      // Use current date if until is not specified
      until: Math.floor(new Date(until || new Date()).getTime() / 1000)
    }

    const { data } = await this.igApi.get(`/${userId}/insights`, {
      params
    })

    // Return the data directly as it already has the correct format
    return { data: data.data }
  }

  async getMultipleMetrics(
    token: string,
    userId: string,
    metrics: MetricEnum[],
    { since, until, breakdown }: MetricsRequestDto
  ): Promise<MetricsResponseDto> {
    const params: Record<string, any> = {
      metric: metrics.join(','),
      access_token: token,
      period: PeriodEnum.DAY,
      metric_type: MetricTypeEnum.TOTAL_VALUE,
      ...(breakdown && { breakdown }),
      ...(since && { since: Math.floor(new Date(since).getTime() / 1000) }),
      // Use current date if until is not specified
      until: Math.floor(new Date(until || new Date()).getTime() / 1000)
    }

    const { data } = await this.igApi.get(`/${userId}/insights`, {
      params
    })

    // Return the data directly as it already has the correct format
    return { data: data.data }
  }

  async getSimplifiedMetrics(
    token: string,
    userId: string,
    metrics: MetricEnum[],
    { since, until, breakdown }: MetricsRequestDto
  ): Promise<SimplifiedMetricsResponseDto> {
    // First get the full response for metrics with breakdown
    const response = await this.getMultipleMetrics(token, userId, metrics, {
      since,
      until,
      breakdown
    })

    // Also get replies (which doesn't have breakdown)
    const repliesResponse = await this.getReplies(token, userId, {
      since,
      until,
      breakdown: undefined
    })

    // Transform the response to the simplified format
    const simplifiedData = response.data.map((metric) => {
      const breakdownResults =
        metric.total_value.breakdowns?.[0]?.results.map((result) => {
          return new SimplifiedBreakdownResult(
            result.dimension_values[0],
            result.value
          )
        }) || []

      return new SimplifiedMetricData(
        metric.name,
        metric.total_value.value,
        breakdownResults
      )
    })

    // Add replies to the simplified data
    if (repliesResponse.data && repliesResponse.data.length > 0) {
      const repliesMetric = repliesResponse.data[0]
      simplifiedData.push(
        new SimplifiedMetricData(
          repliesMetric.name,
          repliesMetric.total_value.value,
          [] // Replies doesn't have breakdown results
        )
      )
    }

    return new SimplifiedMetricsResponseDto(simplifiedData)
  }
}

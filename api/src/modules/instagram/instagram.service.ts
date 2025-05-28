import {
  Injectable,
  HttpException,
  HttpStatus,
  InternalServerErrorException,
  Logger
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import axios, { AxiosInstance } from 'axios'
import {
  MetricEnum,
  MetricTypeEnum,
  PeriodEnum
} from 'src/modules/instagram/constants/enums'
import {
  DemographicsRequestDto,
  DemographicsResponseDto
} from 'src/modules/instagram/dto/ig-demographics.dto'
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

  async fetchDemographics(
    token: string,
    userId: string,
    metric: MetricEnum,
    { breakdown, timeframe }: DemographicsRequestDto
  ): Promise<DemographicsResponseDto> {
    this.logger.log(`Fetching demographics with metric: ${metric}, breakdown: ${breakdown}, timeframe: ${timeframe}`)
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
}

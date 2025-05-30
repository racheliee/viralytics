import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Req,
  UseGuards
} from '@nestjs/common'
import { InstagramService } from './instagram.service'
import { InstagramCookieGuard } from 'src/modules/auth/guards/instagram-cookie.guard'
import {
  DemographicsRequestDto,
  DemographicsResponseDto
} from 'src/modules/instagram/dto/ig-demographics.dto'

import { ReqWithInstagram } from 'src/modules/auth/decorator/instagram-auth-decorator'
import { MetricEnum } from '@viralytics/shared-constants'

@Controller('instagram')
@UseGuards(InstagramCookieGuard)
export class InstagramController {
  constructor(private readonly instagramService: InstagramService) {}

  @Post('demographics/followers')
  async getFollowerDemographics(
    @ReqWithInstagram() req: { token: string; userId: string },
    @Body() body: DemographicsRequestDto
  ): Promise<DemographicsResponseDto> {
    return await this.instagramService.fetchDemographics(
      req.token,
      req.userId,
      MetricEnum.FOLLOWER_DEMOGRAPHICS,
      body
    )
  }

  @Get('demographics/engaged-audience')
  async getEngagedAudienceDemographics(
    @ReqWithInstagram() req: { token: string; userId: string },
    @Body() body: DemographicsRequestDto
  ): Promise<DemographicsResponseDto> {
    return await this.instagramService.fetchDemographics(
      req.token,
      req.userId,
      MetricEnum.ENGAGED_AUDIENCE_DEMOGRAPHICS,
      body
    )
  }
}

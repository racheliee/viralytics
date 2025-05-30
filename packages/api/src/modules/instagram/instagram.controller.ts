import { Body, Controller, Post, UseGuards } from '@nestjs/common'
import { InstagramService } from './instagram.service'
import { InstagramCookieGuard } from 'src/modules/auth/guards/instagram-cookie.guard'
import {
  DemographicsRequestDto,
  DemographicsResponseDto
} from 'src/modules/instagram/dto/ig-demographics.dto'

import { ReqWithInstagram } from 'src/modules/auth/decorator/instagram-auth-decorator'
import { MetricEnum } from '@viralytics/shared-constants'
import { FollowAndUnfollowResponseDto, IgBreakdownRequestDto, IgTimeRangeDto } from 'src/modules/instagram/dto/ig-general.dto'

@Controller('instagram')
@UseGuards(InstagramCookieGuard)
export class InstagramController {
  constructor(private readonly instagramService: InstagramService) {}

  @Post('demographics/followers')
  async getFollowerDemographics(
    @ReqWithInstagram() req: { token: string; userId: string },
    @Body() body: DemographicsRequestDto
  ): Promise<DemographicsResponseDto> {
    return await this.instagramService.getDemographics(
      req.token,
      req.userId,
      MetricEnum.FOLLOWER_DEMOGRAPHICS,
      body
    )
  }

  @Post('demographics/engaged-audience')
  async getEngagedAudienceDemographics(
    @ReqWithInstagram() req: { token: string; userId: string },
    @Body() body: DemographicsRequestDto
  ): Promise<DemographicsResponseDto> {
    return await this.instagramService.getDemographics(
      req.token,
      req.userId,
      MetricEnum.ENGAGED_AUDIENCE_DEMOGRAPHICS,
      body
    )
  }

  @Post('follows-and-unfollows')
  async getFollowsAndUnfollows(
    @ReqWithInstagram() req: { token: string; userId: string },
    @Body() body: IgTimeRangeDto
  ): Promise<FollowAndUnfollowResponseDto> {
    return await this.instagramService.getFollowsAndUnfollows(
      req.token,
      req.userId,
      body
    )
  }
}

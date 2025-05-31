import { Body, Controller, Post, UseGuards } from '@nestjs/common'
import { InstagramCookieGuard } from 'src/modules/auth/guards/instagram-cookie.guard'
import {
  DemographicsRequestDto,
  DemographicsResponseDto
} from 'src/modules/instagram/dto/ig-demographics.dto'
import { InstagramService } from './instagram.service'

import { GeneralBreakdownEnum, MetricEnum } from '@viralytics/shared-constants'
import { ReqWithInstagram } from 'src/modules/auth/decorator/instagram-auth-decorator'
import {
  FollowAndUnfollowResponseDto,
  IgTimeRangeDto
} from 'src/modules/instagram/dto/ig-general.dto'
import {
  MetricsRequestDto,
  SimplifiedMetricsResponseDto
} from 'src/modules/instagram/dto/ig-metrics.dto'
import { IgMediaResponseDto } from 'src/modules/instagram/dto/ig-media.dto'

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

  @Post('metrics/all')
  async getAllMetrics(
    @ReqWithInstagram() req: { token: string; userId: string },
    @Body() body: MetricsRequestDto
  ): Promise<SimplifiedMetricsResponseDto> {
    return await this.instagramService.getSimplifiedMetrics(
      req.token,
      req.userId,
      [
        MetricEnum.SHARES,
        MetricEnum.SAVES,
        MetricEnum.TOTAL_INTERACTIONS,
        MetricEnum.COMMENTS,
        MetricEnum.LIKES
      ],
      {
        ...body,
        breakdown: GeneralBreakdownEnum.MEDIA_PRODUCT_TYPE
      }
    )
  }

  // @Post('metrics/replies')
  // async getReplies(
  //   @ReqWithInstagram() req: { token: string; userId: string },
  //   @Body() body: MetricsRequestDto
  // ): Promise<MetricsResponseDto> {
  //   return await this.instagramService.getReplies(
  //     req.token,
  //     req.userId,
  //     body
  //   )
  // }

  // @Post('metrics/shares')
  // async getShares(
  //   @ReqWithInstagram() req: { token: string; userId: string },
  //   @Body() body: MetricsRequestDto
  // ): Promise<MetricsResponseDto> {
  //   return await this.instagramService.getMetricsWithBreakdown(
  //     req.token,
  //     req.userId,
  //     MetricEnum.SHARES,
  //     {
  //       ...body,
  //       breakdown: GeneralBreakdownEnum.MEDIA_PRODUCT_TYPE
  //     }
  //   )
  // }

  // @Post('metrics/saves')
  // async getSaves(
  //   @ReqWithInstagram() req: { token: string; userId: string },
  //   @Body() body: MetricsRequestDto
  // ): Promise<MetricsResponseDto> {
  //   return await this.instagramService.getMetricsWithBreakdown(
  //     req.token,
  //     req.userId,
  //     MetricEnum.SAVES,
  //     {
  //       ...body,
  //       breakdown: GeneralBreakdownEnum.MEDIA_PRODUCT_TYPE
  //     }
  //   )
  // }

  // @Post('metrics/total-interactions')
  // async getTotalInteractions(
  //   @ReqWithInstagram() req: { token: string; userId: string },
  //   @Body() body: MetricsRequestDto
  // ): Promise<MetricsResponseDto> {
  //   return await this.instagramService.getMetricsWithBreakdown(
  //     req.token,
  //     req.userId,
  //     MetricEnum.TOTAL_INTERACTIONS,
  //     {
  //       ...body,
  //       breakdown: GeneralBreakdownEnum.MEDIA_PRODUCT_TYPE
  //     }
  //   )
  // }

  // @Post('metrics/comments-likes')
  // async getCommentsAndLikes(
  //   @ReqWithInstagram() req: { token: string; userId: string },
  //   @Body() body: MetricsRequestDto
  // ): Promise<MetricsResponseDto> {
  //   return await this.instagramService.getMultipleMetrics(
  //     req.token,
  //     req.userId,
  //     [MetricEnum.COMMENTS, MetricEnum.LIKES],
  //     {
  //       ...body,
  //       breakdown: GeneralBreakdownEnum.MEDIA_PRODUCT_TYPE
  //     }
  //   )
  // }

  @Post('media')
  async getMedia(
    @ReqWithInstagram() req: { token: string; userId: string },
  ): Promise<IgMediaResponseDto> {
    return await this.instagramService.getMedia(req.token, req.userId)
  }
}

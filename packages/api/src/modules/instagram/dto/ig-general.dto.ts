import { GeneralBreakdownEnum } from '@viralytics/shared-constants'
import { IsISO8601, IsNumber, IsOptional, IsString } from 'class-validator'

export class IgTimeRangeDto {
  @IsISO8601()
  @IsOptional()
  since: Date

  @IsISO8601()
  @IsOptional()
  until: Date

  constructor(since?: Date, until?: Date) {
    this.since = since
    this.until = until
  }
}

export class IgBreakdownRequestDto extends IgTimeRangeDto {
  @IsString()
  breakdown: GeneralBreakdownEnum

  constructor(breakdown: GeneralBreakdownEnum, since?: Date, until?: Date) {
    super(since, until)
    this.breakdown = breakdown
  }
}

export class IgGeneralRequestDto extends IgTimeRangeDto {
  @IsString()
  @IsOptional()
  breakdown?: GeneralBreakdownEnum

  constructor(breakdown?: GeneralBreakdownEnum, since?: Date, until?: Date) {
    super(since, until)
    this.breakdown = breakdown
  }
}

export class FollowAndUnfollowResponseDto {
  @IsNumber()
  follower: number

  @IsNumber()
  unfollower: number

  @IsNumber()
  unknown: number

  constructor(follower: number, unfollower: number, unknown: number) {
    this.follower = follower
    this.unfollower = unfollower
    this.unknown = unknown
  }
}

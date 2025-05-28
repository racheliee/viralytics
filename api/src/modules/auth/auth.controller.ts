import {
  BadRequestException,
  Controller,
  Get,
  Logger,
  Query,
  Res
} from '@nestjs/common'
import { AuthService } from 'src/modules/auth/auth.service'
import { Response } from 'express'
import { MetaCallbackRequestDto } from 'src/modules/auth/dto/meta-auth.dto'
import { ACCESS_TOKEN_TTL } from 'src/modules/auth/constants/limits'
import { DASHBOARD_URL } from 'src/modules/auth/constants/urls'
import { ConfigService } from '@nestjs/config'

@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name)

  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService
  ) {}

  @Get('facebook-login')
  loginFacebook(@Res() res: Response) {
    return res.redirect(this.authService.getFacebookRedirectUrl())
  }

  @Get('facebook-callback')
  async callbackFacebook(
    @Query() query: MetaCallbackRequestDto,
    @Res() res: Response
  ): Promise<void> {
    const accessToken = await this.authService.facebookCallback(query.code)
    // const accountId = await this.authService.getInstagramAccountId(accessToken)

    const isProd = process.env.NODE_ENV === 'production'
    const cookieOpts = {
      httpOnly: true,
      secure: isProd,
      sameSite: 'strict' as const,
      path: '/',
      maxAge: ACCESS_TOKEN_TTL
    }

    res.cookie('ig_token', accessToken, cookieOpts)
    // res.cookie('ig_user_id', accountId, cookieOpts)

    const frontendUrl = this.configService.getOrThrow('FRONTEND_URL')
    return res.redirect(`${frontendUrl}/${DASHBOARD_URL}`)
  }

  @Get('instagram-login')
  loginInstagram(@Res() res: Response) {
    const redirectUrl = this.authService.getInstagramRedirectUrl()
    return res.redirect(302, redirectUrl)
  }

  @Get('instagram-callback')
  async instagramCallback(
    @Query('code') code: string,
    @Res({ passthrough: true }) res: Response
  ) {
    if (!code) {
      throw new BadRequestException('Code is required for Instagram login')
    }

    const shortToken = await this.authService.exchangeCode(code)
    const longToken = await this.authService.toLongLivedToken(shortToken)
    const profile = await this.authService.fetchProfile(longToken)

    this.logger.log(
      'Instagram user token exchanged and profile fetched successfully'
    )

    const isProd = process.env.NODE_ENV === 'production'
    const cookieOpts = {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? ('strict' as 'strict') : ('lax' as 'lax'),
      path: '/',
      maxAge: ACCESS_TOKEN_TTL
    }

    res.cookie('ig_token', longToken, cookieOpts)
    res.cookie('ig_user_id', profile.id, cookieOpts)

    return res.redirect(
      `${this.configService.getOrThrow('FRONTEND_URL')}/${DASHBOARD_URL}`
    )
  }
}

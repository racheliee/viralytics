import {
  BadRequestException,
  Controller,
  Get,
  Logger,
  Query,
  Res
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { FastifyReply } from 'fastify'
import { AuthService } from 'src/modules/auth/auth.service'
import { ACCESS_TOKEN_TTL } from 'src/modules/auth/constants/limits'
import { DASHBOARD_URL } from 'src/modules/auth/constants/urls'
import { MetaCallbackRequestDto } from 'src/modules/auth/dto/meta-auth.dto'

@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name)

  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService
  ) {}

  @Get('facebook-login')
  loginFacebook(@Res() res: FastifyReply) {
    return res.redirect(this.authService.getFacebookRedirectUrl())
  }

  @Get('facebook-callback')
  async callbackFacebook(
    @Query() query: MetaCallbackRequestDto,
    @Res() res: FastifyReply
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

    res.setCookie('ig_token', accessToken, cookieOpts)
    // res.setCookie('ig_user_id', accountId, cookieOpts)

    const frontendUrl = this.configService.getOrThrow('FRONTEND_URL')
    return res.redirect(`${frontendUrl}/${DASHBOARD_URL}`)
  }

  @Get('instagram-login')
  loginInstagram(@Res() res: FastifyReply) {
    const redirectUrl = this.authService.getInstagramRedirectUrl()
    return res.status(302).redirect(redirectUrl)
  }

  @Get('instagram-callback')
  async instagramCallback(
    @Query('code') code: string,
    @Res({ passthrough: true }) res: FastifyReply
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

    res.setCookie('ig_token', longToken, cookieOpts)
    res.setCookie('ig_user_id', profile.id, cookieOpts)

    const frontendUrl = this.configService.getOrThrow('FRONTEND_URL')

    // In local environment, add token and user ID as URL parameters
    if (!isProd) {
      return res.status(302).redirect(
        `${frontendUrl}/${DASHBOARD_URL}?ig_token=${encodeURIComponent(longToken)}&ig_user_id=${encodeURIComponent(profile.id)}`
      )
    }

    // In production, just redirect normally as cookies will work
    return res.status(302).redirect(`${frontendUrl}/${DASHBOARD_URL}`)
  }
}

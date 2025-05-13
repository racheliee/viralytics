import { Controller, Get, Query, Res } from '@nestjs/common'
import { AuthService } from 'src/modules/auth/auth.service'
import { Response } from 'express'
import { MetaCallbackRequestDto } from 'src/modules/auth/dto/meta-auth.dto'
import { ACCESS_TOKEN_TTL } from 'src/modules/auth/constants/limits'
import { DASHBOARD_URL } from 'src/modules/auth/constants/urls'
import { ConfigService } from '@nestjs/config'

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService
  ) {}

  @Get('meta-login')
  loginMeta(@Res() res: Response) {
    return res.redirect(this.authService.getMetaRedirectUrl())
  }

  @Get('meta-callback')
  async callbackMeta(
    @Query() query: MetaCallbackRequestDto,
    @Res() res: Response
  ): Promise<void> {
    const accessToken = await this.authService.metaCallback(query.code)

    res.cookie('access_token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: ACCESS_TOKEN_TTL
    })

    const frontendUrl = this.configService.getOrThrow('FRONTEND_URL')
    return res.redirect(`${frontendUrl}/${DASHBOARD_URL}`)
  }
}

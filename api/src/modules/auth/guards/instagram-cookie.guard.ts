import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException
} from '@nestjs/common'

@Injectable()
export class InstagramCookieGuard implements CanActivate {
  canActivate(ctx: ExecutionContext) {
    const req = ctx.switchToHttp().getRequest()
    const token = req.cookies['ig_token']
    const id = req.cookies['ig_user_id']
    console.log('InstagramCookieGuard:', { token, id })
    if (!token || !id) {
      throw new UnauthorizedException('Instagram login required')
    }
    req.igToken = token
    req.igUserId = id
    return true
  }
}

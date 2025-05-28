import { createParamDecorator, ExecutionContext } from '@nestjs/common'

export const ReqWithInstagram = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext) => {
    const req = ctx.switchToHttp().getRequest()
    return {
      token: req.igToken,
      userId: req.igUserId,
    }
  },
)

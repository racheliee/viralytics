import { Injectable } from '@nestjs/common'

@Injectable()
export class ConfigService {
  get metaAppId(): string {
    return process.env.META_APP_ID!
  }

  get metaAppSecret(): string {
    return process.env.META_APP_SECRET!
  }

  get metaRedirectUri(): string {
    return process.env.META_REDIRECT_URI!
  }

  get metaGraphApiVersion(): string {
    return process.env.META_GRAPH_API_VERSION || 'v19.0'
  }

  get frontendUrl(): string {
    return process.env.FRONTEND_URL!
  }

  //   get metaTokenExchangeUrl(): string {
  //     return `https://graph.facebook.com/${this.metaGraphApiVersion}/oauth/access_token`
  //   }
}

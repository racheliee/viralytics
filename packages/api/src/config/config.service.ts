import { Injectable } from '@nestjs/common'

@Injectable()
export class ConfigService {
  get metaAppId(): string {
    return process.env.META_APP_ID!
  }

  get metaAppSecret(): string {
    return process.env.META_APP_SECRET!
  }

  get instagramAppId(): string {
    return process.env.INSTAGRAM_APP_ID!
  }

  get instagramAppSecret(): string {
    return process.env.INSTAGRAM_APP_SECRET!
  }

  get facebookRedirectUri(): string {
    return process.env.FACEBOOK_REDIRECT_URI!
  }

  get instagramRedirectUri(): string {
    return process.env.INSTAGRAM_REDIRECT_URI!
  }

  get instagramEmbedUrl(): string {
    return process.env.INSTAGRAM_EMBED_URL!
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

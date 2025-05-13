import { Injectable, InternalServerErrorException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import axios, { AxiosInstance } from 'axios'

@Injectable()
export class AuthService {
  private readonly metaApi: AxiosInstance
  private readonly clientId: string
  private readonly clientSecret: string
  private readonly redirectUri: string
  private readonly graphApiVersion: string

  constructor(private readonly configService: ConfigService) {
    this.clientId = this.configService.getOrThrow('META_APP_ID')
    this.clientSecret = this.configService.getOrThrow('META_APP_SECRET')
    this.redirectUri = this.configService.getOrThrow('META_REDIRECT_URI')
    this.graphApiVersion =
      this.configService.get('META_GRAPH_API_VERSION') || 'v19.0'

    this.metaApi = axios.create({
      baseURL: `https://graph.facebook.com/${this.graphApiVersion}`,
      timeout: 5000,
      headers: {
        'Content-Type': 'application/json'
      }
    })
  }

  getMetaRedirectUrl(): string {
    return `https://www.facebook.com/${this.graphApiVersion}/dialog/oauth?client_id=${this.clientId}&redirect_uri=${this.redirectUri}&scope=instagram_basic,instagram_manage_insights,pages_show_list`
  }

  async metaCallback(code: string): Promise<string> {
    const params = {
      client_id: process.env.META_APP_ID,
      client_secret: process.env.META_APP_SECRET,
      redirect_uri: process.env.META_REDIRECT_URI,
      code
    }

    const response = await this.metaApi.get('/oauth/access_token', { params })

    if (!response.data) {
      throw new InternalServerErrorException('Meta token exchange failed')
    }

    const { access_token } = response.data
    return access_token
  }
}

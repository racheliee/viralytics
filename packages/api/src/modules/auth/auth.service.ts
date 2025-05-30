import { Injectable, InternalServerErrorException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import axios, { AxiosInstance } from 'axios'
import console from 'console'

@Injectable()
export class AuthService {
  private readonly facebookApi: AxiosInstance
  private readonly instagramApi: AxiosInstance
  private readonly metaAppId: string
  private readonly metaAppSecret: string
  private readonly instagramAppId: string
  private readonly instagramAppSecret: string
  private readonly facebookRedirectUri: string
  private readonly instagramRedirectUri: string
  private readonly graphApiVersion: string

  constructor(private readonly configService: ConfigService) {
    this.metaAppId = this.configService.getOrThrow('META_APP_ID')
    this.metaAppSecret = this.configService.getOrThrow('META_APP_SECRET')
    this.instagramAppId = this.configService.getOrThrow('INSTAGRAM_APP_ID')
    this.instagramAppSecret = this.configService.getOrThrow(
      'INSTAGRAM_APP_SECRET'
    )
    this.facebookRedirectUri = this.configService.getOrThrow(
      'FACEBOOK_REDIRECT_URI'
    )
    this.instagramRedirectUri = this.configService.getOrThrow(
      'INSTAGRAM_REDIRECT_URI'
    )
    this.graphApiVersion =
      this.configService.get('META_GRAPH_API_VERSION') || 'v19.0'

    this.facebookApi = axios.create({
      baseURL: `https://graph.facebook.com/${this.graphApiVersion}`,
      timeout: 5000,
      headers: {
        'Content-Type': 'application/json'
      }
    })

    this.instagramApi = axios.create({
      baseURL: `https://graph.instagram.com`,
      timeout: 5000
    })
  }

  getFacebookRedirectUrl(): string {
    return `https://www.facebook.com/${this.graphApiVersion}/dialog/oauth?client_id=${this.metaAppId}&redirect_uri=${this.facebookRedirectUri}&scope=instagram_basic,instagram_manage_insights,pages_show_list`
  }

  async facebookCallback(code: string): Promise<string> {
    const params = {
      client_id: process.env.META_APP_ID,
      client_secret: process.env.META_APP_SECRET,
      redirect_uri: process.env.FACEBOOK_REDIRECT_URI,
      code
    }

    const response = await this.facebookApi.get('/oauth/access_token', {
      params
    })

    if (!response.data) {
      throw new InternalServerErrorException('Meta token exchange failed')
    }

    const { access_token } = response.data
    return access_token
  }

  getInstagramRedirectUrl(): string {
    return this.configService.getOrThrow('INSTAGRAM_EMBED_URL')
  }

  async exchangeCode(code: string): Promise<string> {
    if (!code) {
      throw new InternalServerErrorException(
        'Code is required for Instagram login'
      )
    }
    const resp = await axios.post(
      'https://api.instagram.com/oauth/access_token',
      new URLSearchParams({
        client_id: this.instagramAppId,
        client_secret: this.instagramAppSecret,
        grant_type: 'authorization_code',
        redirect_uri: this.instagramRedirectUri,
        code
      })
    )
    if (!resp.data || !resp.data.access_token) {
      throw new InternalServerErrorException(
        'Failed to exchange code for token'
      )
    }
    return resp.data.access_token
  }

  async toLongLivedToken(shortToken: string): Promise<string> {
    if (!shortToken) {
      throw new InternalServerErrorException('Short token is required')
    }
    const resp = await this.instagramApi.get('/access_token', {
      params: {
        grant_type: 'ig_exchange_token',
        client_secret: this.instagramAppSecret,
        access_token: shortToken
      }
    })
    return resp.data.access_token
  }

  async fetchProfile(token: string) {
    if (!token) {
      throw new InternalServerErrorException(
        'Token is required to fetch profile'
      )
    }
    const resp = await this.instagramApi.get('/me', {
      params: {
        fields: 'id,username,account_type,media_count',
        access_token: token
      }
    })
    return resp.data
  }

  async fetchBusinessAccountId(userToken: string): Promise<string> {
    try {
      const resp = await axios.get(
        `https://graph.facebook.com/${this.graphApiVersion}/me/accounts`,
        {
          params: {
            access_token: userToken,
            fields: 'access_token,instagram_business_account'
          }
        }
      )
      for (const page of resp.data.data as any[]) {
        if (page.instagram_business_account?.id) {
          return page.instagram_business_account.id
        }
        if (page.access_token) {
          const single = await axios.get(
            `https://graph.facebook.com/${this.graphApiVersion}/${page.id}`,
            {
              params: {
                access_token: page.access_token,
                fields: 'instagram_business_account'
              }
            }
          )
          if (single.data.instagram_business_account?.id) {
            return single.data.instagram_business_account.id
          }
        }
      }
      console.error('No IG business account:', resp.data)
      throw new InternalServerErrorException('No IG Business account linked')
    } catch (err: any) {
      console.error(
        'Error fetching /me/accounts:',
        err.response?.data || err.message
      )
      throw new InternalServerErrorException(
        'Failed to retrieve IG Business account ID'
      )
    }
  }
}

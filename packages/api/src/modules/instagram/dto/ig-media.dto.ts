import { InstagramMediaResults } from 'src/modules/instagram/constants/types'

export class IgMediaResponseDto {
  mediaInfo: InstagramMediaResults[]

  constructor(mediaInfo: InstagramMediaResults[]) {
    this.mediaInfo = mediaInfo
  }
}

import { InstagramMediaResults } from "@viralytics/shared-constants"

export class IgMediaResponseDto {
  mediaInfo: InstagramMediaResults[]

  constructor(mediaInfo: InstagramMediaResults[]) {
    this.mediaInfo = mediaInfo
  }
}

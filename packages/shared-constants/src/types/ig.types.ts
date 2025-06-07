export interface InstagramMediaResults {
  id: string
  caption?: string
  comments_count?: number
  is_comment_enabled?: boolean
  like_count?: number
  media_product_type?: string // e.g. FEED, STORY, REEL
  media_type?: string // e.g. IMAGE, VIDEO, CAROUSEL_ALBUM
  media_url?: string
  thumbnail_url?: string
  permalink?: string
  shortcode?: string
  timestamp?: string
  username?: string
  alt_text?: string
  is_shared_to_feed?: boolean
  legacy_instagram_media_id?: string
  boost_ads_list?: any // not documented well
  boost_eligiblity_ionfo?: any
  owner?: {
    id: string
  }
}
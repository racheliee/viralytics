'use client'

import { useEffect } from 'react'
import { handleAuthTokensFromUrl } from '@viralytics/lib/auth-utils'

/**
 * Client component that handles authentication tokens from URL parameters
 * This is needed for local development where cookies can't be set across domains
 */
export default function AuthTokenHandler() {
  useEffect(() => {
    // Extract tokens from URL and set as cookies if present
    handleAuthTokensFromUrl()
  }, [])

  // This component doesn't render anything
  return null
}

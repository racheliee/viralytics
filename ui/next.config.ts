import { config } from '@viralytics/lib/config'
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${config.apiBaseUrl}/api/:path*`
      }
    ]
  },
  allowedDevOrigins: [`${config.apiBaseUrl}`, 'http://localhost:3002'],
  serverExternalPackages: ['@next/font']
}

export default nextConfig

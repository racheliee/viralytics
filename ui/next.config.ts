import { config } from "@viralytics/lib/config"

/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${config.apiBaseUrl}/:path*`,
      },
    ]
  },
}

module.exports = nextConfig

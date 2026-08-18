import { withPayload } from '@payloadcms/next/withPayload'
import type { NextConfig } from 'next'

/**
 * Baseline security headers.
 *
 * This app renders financial documents and accepts file uploads, and the config
 * previously set no headers at all. CSP is deliberately conservative:
 * `'unsafe-inline'` is still required for styles (Tailwind's injected styles and
 * the Payload admin) and `'unsafe-eval'` is needed by the admin bundle in
 * development, so the policy is tightened only in production.
 */
const isProd = process.env.NODE_ENV === 'production'

const scriptSrc = isProd
  ? "script-src 'self' 'unsafe-inline'"
  : "script-src 'self' 'unsafe-inline' 'unsafe-eval'"

const contentSecurityPolicy = [
  "default-src 'self'",
  scriptSrc,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data:",
  "connect-src 'self' https:",
  // The print/invoice views are same-origin only; nothing should frame us.
  "frame-ancestors 'none'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  ...(isProd ? ['upgrade-insecure-requests'] : []),
].join('; ')

const securityHeaders = [
  { key: 'Content-Security-Policy', value: contentSecurityPolicy },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'X-DNS-Prefetch-Control', value: 'off' },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), payment=()',
  },
  ...(isProd
    ? [
        {
          key: 'Strict-Transport-Security',
          value: 'max-age=63072000; includeSubDomains; preload',
        },
      ]
    : []),
]

const nextConfig: NextConfig = {
  // `next lint` and the `eslint` config key were removed in Next.js 16; linting
  // runs via the `lint` script instead. Type errors still fail the build.
  typescript: { ignoreBuildErrors: false },

  // Keeps `x-powered-by` off the wire.
  poweredByHeader: false,

  experimental: {
    // `lucide-react` and `recharts` are already covered by the framework
    // default; these are the remaining barrel-style imports in the app.
    optimizePackageImports: ['lucide-react', 'recharts', 'dayjs'],
  },

  // Artwork/proof previews and product images come from the configured S3/MinIO
  // endpoint, which is not known at build time.
  images: {
    remotePatterns: process.env.S3_ENDPOINT
      ? [
          {
            protocol: process.env.S3_ENDPOINT.startsWith('https') ? 'https' : 'http',
            hostname: new URL(process.env.S3_ENDPOINT).hostname,
            port: new URL(process.env.S3_ENDPOINT).port || undefined,
          },
        ]
      : [],
  },

  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
      {
        // Private files must never be cached by a shared cache.
        source: '/api/:path*',
        headers: [{ key: 'Cache-Control', value: 'no-store, max-age=0' }],
      },
    ]
  },
}

export default withPayload(nextConfig)

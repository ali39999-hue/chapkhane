import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import { fa } from '@payloadcms/translations/languages/fa'
import { s3Storage } from '@payloadcms/storage-s3'
import sharp from 'sharp'

// System & Users
import { Users } from './src/payload/collections/Users'
import { AuditLogs } from './src/payload/collections/system/AuditLogs'

// Catalog
import { PaperTypes } from './src/payload/collections/catalog/PaperTypes'
import { PrintSizes } from './src/payload/collections/catalog/PrintSizes'
import { FinishingOptions } from './src/payload/collections/catalog/FinishingOptions'
import { PrintMethods } from './src/payload/collections/catalog/PrintMethods'
import { ProductTypes } from './src/payload/collections/catalog/ProductTypes'
import { PriceLists } from './src/payload/collections/catalog/PriceLists'
import { TurnaroundOptions } from './src/payload/collections/catalog/TurnaroundOptions'
import { PreflightRules } from './src/payload/collections/catalog/PreflightRules'

// Media
import { PublicAssets } from './src/payload/collections/media/PublicAssets'
import { Artworks } from './src/payload/collections/media/Artworks'

// Orders
import { Orders } from './src/payload/collections/orders/Orders'
import { OrderItems } from './src/payload/collections/orders/OrderItems'
import { Proofs } from './src/payload/collections/orders/Proofs'
import { Quotes } from './src/payload/collections/orders/Quotes'
import { Payments } from './src/payload/collections/orders/Payments'
import { Invoices } from './src/payload/collections/orders/Invoices'

// Design
import { DesignPackages } from './src/payload/collections/design/DesignPackages'
import { DesignProjects } from './src/payload/collections/design/DesignProjects'
import { Briefs } from './src/payload/collections/design/Briefs'

// B2B
import { Organizations } from './src/payload/collections/b2b/Organizations'
import { CreditTransactions } from './src/payload/collections/b2b/CreditTransactions'

// Content
import { PortfolioItems } from './src/payload/collections/content/PortfolioItems'
import { Posts } from './src/payload/collections/content/Posts'
import { Pages } from './src/payload/collections/content/Pages'
import { FAQs } from './src/payload/collections/content/FAQs'
import { Templates } from './src/payload/collections/content/Templates'
import { SiteSettings } from './src/payload/globals/SiteSettings'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

// Refuse to run with insecure defaults in production.
function requireEnv(name: string, devFallback?: string): string {
  const value = process.env[name]
  if (value) return value
  if (devFallback !== undefined && process.env.NODE_ENV !== 'production') return devFallback
  throw new Error(`Missing required environment variable: ${name}`)
}

const secret = requireEnv('PAYLOAD_SECRET')
if (secret.length < 32) {
  throw new Error('PAYLOAD_SECRET must be at least 32 characters long.')
}

export default buildConfig({
  sharp,
  i18n: {
    supportedLanguages: { fa },
  },
  admin: {
    user: Users.slug,
    components: {
      graphics: {
        Logo: '@/components/admin/Logo',
        Icon: '@/components/admin/Icon',
      },
      views: {
        Dashboard: {
          Component: '@/components/admin/CustomDashboard',
        },
      },
    },
  },
  collections: [
    Users,
    AuditLogs,
    PaperTypes,
    PrintSizes,
    FinishingOptions,
    PrintMethods,
    ProductTypes,
    PriceLists,
    TurnaroundOptions,
    PreflightRules,
    PublicAssets,
    Artworks,
    Orders,
    OrderItems,
    Proofs,
    Quotes,
    Payments,
    Invoices,
    DesignPackages,
    DesignProjects,
    Briefs,
    Organizations,
    CreditTransactions,
    PortfolioItems,
    Posts,
    Pages,
    FAQs,
    Templates,
  ],
  plugins: [
    ...(process.env.USE_S3 === 'true' ? [
      s3Storage({
        collections: {
          'artworks': true,
        },
        bucket: requireEnv('S3_BUCKET_PRIVATE', 'chapkhane'),
        config: {
          credentials: {
            accessKeyId: requireEnv('S3_ACCESS_KEY_ID', 'admin'),
            secretAccessKey: requireEnv('S3_SECRET_ACCESS_KEY', 'password123'),
          },
          region: process.env.S3_REGION || 'us-east-1',
          endpoint: process.env.S3_ENDPOINT || 'http://127.0.0.1:9000',
          forcePathStyle: true,
        },
      }),
    ] : []),
  ],
  globals: [
    SiteSettings
  ],
  editor: lexicalEditor({}),
  secret,
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URI || '',
    },
  }),
})

import { MetadataRoute } from 'next';
import { getPayload } from 'payload';
import configPromise from '@payload-config';

// Crawler-facing and cheap to regenerate, but at `force-dynamic` every crawler
// hit re-ran a 1000-row query. An hour of caching is well inside how often the
// catalog changes.
export const revalidate = 3600;

const baseUrl = process.env.NEXT_PUBLIC_SERVER_URL ?? 'https://chapkhane.test';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const payload = await getPayload({ config: configPromise });

  // Only `slug` and `updatedAt` are used. Without `depth: 0` + `select`, the
  // default `depth: 2` populated five relationships per row, twice over.
  const productsRes = await payload
    .find({
      collection: 'product-types',
      limit: 1000,
      depth: 0,
      pagination: false,
      select: { slug: true, updatedAt: true },
    })
    .catch(() => null);

  const productUrls = (productsRes?.docs ?? []).map((product) => ({
    url: `${baseUrl}/products/${product.slug}`,
    lastModified: product.updatedAt ? new Date(product.updatedAt) : new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  // Add static routes
  const staticRoutes = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1.0,
    },
    {
      url: `${baseUrl}/products`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.9,
    },
  ];

  return [...staticRoutes, ...productUrls];
}

import { getPayload } from 'payload';
import configPromise from '@payload-config';
import { NextResponse } from 'next/server';
import { devOnlyGuard } from '@/lib/guard';

export async function GET() {
  const blocked = devOnlyGuard();
  if (blocked) return blocked;

  try {
    const payload = await getPayload({ config: configPromise });
    const { docs: products } = await payload.find({
      collection: 'product-types',
      limit: 100,
      sort: '-createdAt',
    });

    const seenNames = new Set<string>();
    const toDelete: number[] = [];
    const kept: Array<{ id: number; name: string; slug: string }> = [];

    for (const p of products) {
      const cleanName = p.name.trim();
      if (seenNames.has(cleanName)) {
        toDelete.push(Number(p.id));
      } else {
        seenNames.add(cleanName);
        kept.push({ id: Number(p.id), name: p.name, slug: p.slug });
      }
    }

    for (const id of toDelete) {
      await payload.delete({
        collection: 'product-types',
        id,
      });
    }

    return NextResponse.json({
      success: true,
      deletedCount: toDelete.length,
      deletedIds: toDelete,
      keptCount: kept.length,
      kept,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

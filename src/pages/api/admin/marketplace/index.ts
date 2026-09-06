import type { APIRoute } from 'astro';
import { getDb, type MarketplaceListing } from '../../../../lib/db.ts';

export const GET: APIRoute = async ({ url }) => {
  const statusFilter = url.searchParams.get('status');

  const db = getDb();
  let listings: MarketplaceListing[];

  if (statusFilter && ['pending', 'approved', 'rejected'].includes(statusFilter)) {
    listings = db.prepare('SELECT * FROM marketplace_listings WHERE status = ? ORDER BY created_at DESC').all(statusFilter) as MarketplaceListing[];
  } else {
    listings = db.prepare('SELECT * FROM marketplace_listings ORDER BY created_at DESC').all() as MarketplaceListing[];
  }

  return new Response(
    JSON.stringify({
      success: true,
      listings,
      total: listings.length
    }),
    {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    }
  );
};

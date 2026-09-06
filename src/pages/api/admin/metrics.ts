import type { APIRoute } from 'astro';
import { getDb } from '../../../lib/db.ts';

export const GET: APIRoute = async () => {
  const db = getDb();

  // 1. Total announcements
  const annCountResult = db.prepare('SELECT COUNT(*) as count FROM announcements WHERE archived = 0').get() as { count: number };
  const totalAnnouncements = Number(annCountResult?.count || 0);

  // 2. Pending marketplace listings
  const pendingResult = db.prepare("SELECT COUNT(*) as count FROM marketplace_listings WHERE status = 'pending'").get() as { count: number };
  const pendingListings = Number(pendingResult?.count || 0);

  // 3. Total residential census
  const censusResult = db.prepare('SELECT COUNT(*) as count FROM census_properties WHERE is_active = 1').get() as { count: number };
  const totalCensus = Number(censusResult?.count || 52);

  // 4. Average reading coverage percentage
  const activeAnnouncements = db.prepare('SELECT id FROM announcements WHERE archived = 0').all() as Array<{ id: number }>;
  let sumPercentage = 0;

  for (const ann of activeAnnouncements) {
    const readsResult = db.prepare('SELECT COUNT(DISTINCT property_id) as count FROM read_confirmations WHERE announcement_id = ?').get(ann.id) as { count: number };
    const reads = Number(readsResult?.count || 0);
    sumPercentage += (reads / totalCensus) * 100;
  }

  const averageCoveragePercentage = activeAnnouncements.length > 0
    ? Math.round((sumPercentage / activeAnnouncements.length) * 10) / 10
    : 0;

  return new Response(
    JSON.stringify({
      success: true,
      metrics: {
        totalAnnouncements,
        pendingListings,
        totalCensus,
        averageCoveragePercentage
      }
    }),
    {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    }
  );
};

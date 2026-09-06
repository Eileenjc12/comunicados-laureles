import { g as getDb } from '../../../chunks/db_D9z2L-6S.mjs';
export { renderers } from '../../../renderers.mjs';

const GET = async () => {
  const db = getDb();
  const annCountResult = db.prepare("SELECT COUNT(*) as count FROM announcements WHERE archived = 0").get();
  const totalAnnouncements = Number(annCountResult?.count || 0);
  const pendingResult = db.prepare("SELECT COUNT(*) as count FROM marketplace_listings WHERE status = 'pending'").get();
  const pendingListings = Number(pendingResult?.count || 0);
  const censusResult = db.prepare("SELECT COUNT(*) as count FROM census_properties WHERE is_active = 1").get();
  const totalCensus = Number(censusResult?.count || 52);
  const activeAnnouncements = db.prepare("SELECT id FROM announcements WHERE archived = 0").all();
  let sumPercentage = 0;
  for (const ann of activeAnnouncements) {
    const readsResult = db.prepare("SELECT COUNT(DISTINCT property_id) as count FROM read_confirmations WHERE announcement_id = ?").get(ann.id);
    const reads = Number(readsResult?.count || 0);
    sumPercentage += reads / totalCensus * 100;
  }
  const averageCoveragePercentage = activeAnnouncements.length > 0 ? Math.round(sumPercentage / activeAnnouncements.length * 10) / 10 : 0;
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
      headers: { "Content-Type": "application/json" }
    }
  );
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  GET
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };

import { g as getDb } from '../../../chunks/db_D9z2L-6S.mjs';
export { renderers } from '../../../renderers.mjs';

const GET = async ({ url }) => {
  const statusFilter = url.searchParams.get("status");
  const db = getDb();
  let listings;
  if (statusFilter && ["pending", "approved", "rejected"].includes(statusFilter)) {
    listings = db.prepare("SELECT * FROM marketplace_listings WHERE status = ? ORDER BY created_at DESC").all(statusFilter);
  } else {
    listings = db.prepare("SELECT * FROM marketplace_listings ORDER BY created_at DESC").all();
  }
  return new Response(
    JSON.stringify({
      success: true,
      listings,
      total: listings.length
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

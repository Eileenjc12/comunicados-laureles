import { g as getDb } from '../../../../../chunks/db_D9z2L-6S.mjs';
export { renderers } from '../../../../../renderers.mjs';

function formatPropertyCode(manzana, lote) {
  const mz = manzana.replace(/[^A-Za-z0-9]/g, "").toUpperCase();
  const lt = lote.replace(/[^0-9]/g, "");
  return `${mz}-${lt.padStart(2, "0")}`;
}
const GET = async ({ params }) => {
  const id = Number(params.id);
  if (isNaN(id)) {
    return new Response(JSON.stringify({ success: false, error: "ID inválido" }), {
      status: 400,
      headers: { "Content-Type": "application/json" }
    });
  }
  const db = getDb();
  const announcement = db.prepare("SELECT * FROM announcements WHERE id = ?").get(id);
  if (!announcement) {
    return new Response(JSON.stringify({ success: false, error: "Comunicado no encontrado" }), {
      status: 404,
      headers: { "Content-Type": "application/json" }
    });
  }
  const properties = db.prepare("SELECT * FROM census_properties WHERE is_active = 1 ORDER BY manzana ASC, lote ASC").all();
  const totalCensus = properties.length || 52;
  const confirmations = db.prepare(`
    SELECT rc.*, cp.manzana, cp.lote, cp.address, cp.owner_name
    FROM read_confirmations rc
    JOIN census_properties cp ON rc.property_id = cp.id
    WHERE rc.announcement_id = ?
    ORDER BY rc.confirmed_at DESC
  `).all(id);
  const confirmedPropertyIds = new Set(confirmations.map((c) => c.property_id));
  const confirmed = confirmations.map((c) => {
    const code = formatPropertyCode(c.manzana, c.lote);
    return {
      id: c.id,
      propertyId: c.property_id,
      property_id: c.property_id,
      block: c.manzana,
      manzana: c.manzana,
      lot: c.lote,
      lote: c.lote,
      code,
      street: c.address,
      address: c.address,
      residentName: c.resident_name,
      resident_name: c.resident_name,
      role: c.role,
      confirmedAt: c.confirmed_at,
      confirmed_at: c.confirmed_at
    };
  });
  const pending = properties.filter((p) => !confirmedPropertyIds.has(p.id)).map((p) => {
    const code = formatPropertyCode(p.manzana, p.lote);
    return {
      id: p.id,
      propertyId: p.id,
      property_id: p.id,
      block: p.manzana,
      manzana: p.manzana,
      lot: p.lote,
      lote: p.lote,
      code,
      street: p.address,
      address: p.address,
      primaryOwnerName: p.owner_name,
      owner_name: p.owner_name
    };
  });
  const confirmedCount = confirmed.length;
  const rawPercentage = totalCensus > 0 ? confirmedCount / totalCensus * 100 : 0;
  const coveragePercentage = Math.round(rawPercentage * 10) / 10;
  return new Response(
    JSON.stringify({
      success: true,
      announcementId: id,
      coveragePercentage,
      confirmedCount,
      totalCensus,
      confirmed,
      pending
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

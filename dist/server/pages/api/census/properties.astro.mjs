import { g as getDb } from '../../../chunks/db_D9z2L-6S.mjs';
export { renderers } from '../../../renderers.mjs';

const prerender = false;
const GET = async () => {
  try {
    const db = getDb();
    const rows = db.prepare(`
      SELECT id, manzana, lote, address, owner_name, is_active, created_at
      FROM census_properties
      WHERE is_active = 1
      ORDER BY id ASC
    `).all();
    const properties = rows.map((r) => {
      const blockNum = r.manzana.replace(/^Mz\.\s*/i, "").trim();
      const lotNum = r.lote.replace(/^Lote\s*/i, "").trim();
      const code = `MZ-${blockNum}-${lotNum.padStart(2, "0")}`;
      return {
        id: r.id,
        manzana: r.manzana,
        lote: r.lote,
        address: r.address,
        owner_name: r.owner_name,
        is_active: r.is_active,
        created_at: r.created_at,
        // Compatibility aliases matching test expectations
        block: r.manzana,
        lot: r.lote,
        code,
        street: r.address,
        owner: r.owner_name
      };
    });
    return new Response(
      JSON.stringify({
        success: true,
        properties,
        total: properties.length
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-store"
        }
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || "Error al obtener padrón de inmuebles"
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" }
      }
    );
  }
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  GET,
  prerender
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };

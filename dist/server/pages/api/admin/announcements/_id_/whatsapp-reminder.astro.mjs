import { g as getDb } from '../../../../../chunks/db_D9z2L-6S.mjs';
export { renderers } from '../../../../../renderers.mjs';

const GET = async ({ params, url }) => {
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
  const confirmedRows = db.prepare("SELECT DISTINCT property_id FROM read_confirmations WHERE announcement_id = ?").all(id);
  const confirmedSet = new Set(confirmedRows.map((r) => r.property_id));
  const missingProperties = properties.filter((p) => !confirmedSet.has(p.id));
  const missingCount = missingProperties.length;
  const confirmedCount = totalCensus - missingCount;
  const coveragePercent = totalCensus > 0 ? Math.round(confirmedCount / totalCensus * 100) : 0;
  const groupedByBlock = {};
  for (const item of missingProperties) {
    const block = item.manzana;
    if (!groupedByBlock[block]) {
      groupedByBlock[block] = [];
    }
    groupedByBlock[block].push(item.lote);
  }
  let formattedHouses = "";
  const blocks = Object.keys(groupedByBlock).sort();
  for (const block of blocks) {
    formattedHouses += `• *${block}:* ${groupedByBlock[block].join(", ")}
`;
  }
  if (missingCount === 0) {
    formattedHouses = "• ¡Todas las casas han confirmado la lectura! (100% de cobertura)\n";
  }
  const origin = url.origin || "http://localhost:4321";
  const announcementUrl = `${origin}/comunicados/${announcement.slug}`;
  const messageText = `📢 *URBANIZACIÓN LOS LAURELES — COMUNICADO OFICIAL*
📋 *Asunto:* ${announcement.title.trim()}
🔗 *Leer y confirmar aquí:* ${announcementUrl}

Estimados vecinos, la Junta Directiva solicita a los propietarios e inquilinos revisar este comunicado importante para la convivencia y seguridad de nuestra comunidad.

📊 *Avance de confirmación:* ${confirmedCount}/${totalCensus} inmuebles (${coveragePercent}%)
⏳ *Inmuebles pendientes por confirmar (${missingCount}):*
${formattedHouses}👉 Por favor ingrese al enlace, lea el comunicado y registre su Manzana y Lote en el botón de confirmación. ¡Agradecemos su valiosa colaboración!`;
  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(messageText)}`;
  return new Response(
    JSON.stringify({
      success: true,
      announcementId: id,
      messageText,
      whatsappUrl,
      missingCount,
      confirmedCount,
      coveragePercent
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

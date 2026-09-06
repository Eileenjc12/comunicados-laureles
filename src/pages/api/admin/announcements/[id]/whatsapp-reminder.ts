import type { APIRoute } from 'astro';
import { getDb, type Announcement, type CensusProperty } from '../../../../../lib/db.ts';

export const GET: APIRoute = async ({ params, url }) => {
  const id = Number(params.id);
  if (isNaN(id)) {
    return new Response(JSON.stringify({ success: false, error: 'ID inválido' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const db = getDb();
  const announcement = db.prepare('SELECT * FROM announcements WHERE id = ?').get(id) as Announcement | undefined;
  if (!announcement) {
    return new Response(JSON.stringify({ success: false, error: 'Comunicado no encontrado' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const properties = db.prepare('SELECT * FROM census_properties WHERE is_active = 1 ORDER BY manzana ASC, lote ASC').all() as CensusProperty[];
  const totalCensus = properties.length || 52;

  const confirmedRows = db.prepare('SELECT DISTINCT property_id FROM read_confirmations WHERE announcement_id = ?').all(id) as Array<{ property_id: number }>;
  const confirmedSet = new Set(confirmedRows.map(r => r.property_id));

  const missingProperties = properties.filter(p => !confirmedSet.has(p.id));
  const missingCount = missingProperties.length;
  const confirmedCount = totalCensus - missingCount;
  const coveragePercent = totalCensus > 0 ? Math.round((confirmedCount / totalCensus) * 100) : 0;

  // Group missing by block (Manzana)
  const groupedByBlock: Record<string, string[]> = {};
  for (const item of missingProperties) {
    const block = item.manzana;
    if (!groupedByBlock[block]) {
      groupedByBlock[block] = [];
    }
    groupedByBlock[block].push(item.lote);
  }

  let formattedHouses = '';
  const blocks = Object.keys(groupedByBlock).sort();
  for (const block of blocks) {
    formattedHouses += `• *${block}:* ${groupedByBlock[block].join(', ')}\n`;
  }

  if (missingCount === 0) {
    formattedHouses = '• ¡Todas las casas han confirmado la lectura! (100% de cobertura)\n';
  }

  const origin = url.origin || 'http://localhost:4321';
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
      headers: { 'Content-Type': 'application/json' }
    }
  );
};

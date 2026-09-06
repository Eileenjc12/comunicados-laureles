import type { APIRoute } from 'astro';
import { getDb, type MarketplaceListing } from '../../../../../lib/db.ts';

export const PATCH: APIRoute = async ({ params, request }) => {
  const id = Number(params.id);
  if (isNaN(id)) {
    return new Response(JSON.stringify({ success: false, error: 'ID inválido' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  let body: any;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ success: false, error: 'Cuerpo JSON inválido' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const newStatus = body.status;
  if (!newStatus || !['approved', 'rejected', 'pending'].includes(newStatus)) {
    return new Response(JSON.stringify({ success: false, error: 'Estado inválido' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const adminNotes = body.admin_notes || body.reason || null;

  const db = getDb();
  const existing = db.prepare('SELECT * FROM marketplace_listings WHERE id = ?').get(id) as MarketplaceListing | undefined;
  if (!existing) {
    return new Response(JSON.stringify({ success: false, error: 'Emprendimiento no encontrado' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  db.prepare(`
    UPDATE marketplace_listings
    SET status = ?, admin_notes = COALESCE(?, admin_notes), updated_at = datetime('now')
    WHERE id = ?
  `).run(newStatus, adminNotes, id);

  const updatedListing = db.prepare('SELECT * FROM marketplace_listings WHERE id = ?').get(id) as MarketplaceListing;

  return new Response(
    JSON.stringify({
      success: true,
      listing: updatedListing,
      message: `Estado actualizado a '${newStatus}' correctamente.`
    }),
    {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    }
  );
};

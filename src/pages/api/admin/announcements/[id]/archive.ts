import type { APIRoute } from 'astro';
import { getDb, type Announcement } from '../../../../../lib/db.ts';

export const PATCH: APIRoute = async ({ params }) => {
  const id = Number(params.id);
  if (isNaN(id)) {
    return new Response(JSON.stringify({ success: false, error: 'ID inválido' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const db = getDb();
  const existing = db.prepare('SELECT * FROM announcements WHERE id = ?').get(id) as Announcement | undefined;
  if (!existing) {
    return new Response(JSON.stringify({ success: false, error: 'Comunicado no encontrado' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const newArchived = existing.archived ? 0 : 1;
  db.prepare("UPDATE announcements SET archived = ?, updated_at = datetime('now') WHERE id = ?").run(newArchived, id);

  return new Response(
    JSON.stringify({
      success: true,
      archived: newArchived,
      message: `Comunicado ${newArchived ? 'archivado' : 'desarchivado'} exitosamente`
    }),
    {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    }
  );
};

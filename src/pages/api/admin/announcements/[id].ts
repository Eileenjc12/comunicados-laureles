import type { APIRoute } from 'astro';
import { getDb, type Announcement } from '../../../../lib/db.ts';

export const GET: APIRoute = async ({ params }) => {
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

  return new Response(JSON.stringify({ success: true, announcement }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
};

export const PUT: APIRoute = async ({ params, request }) => {
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

  let body: any;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ success: false, error: 'Cuerpo JSON inválido' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const title = body.title !== undefined ? String(body.title).trim() : existing.title;
  if (title.length < 5) {
    return new Response(
      JSON.stringify({ success: false, error: 'El título debe tener al menos 5 caracteres' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const summary = body.summary !== undefined ? String(body.summary).trim() : existing.summary;
  const content = body.content !== undefined ? String(body.content).trim() : existing.content;
  const category = body.category !== undefined ? body.category : existing.category;
  const audience = body.audience !== undefined ? body.audience : existing.audience;
  const isUrgent = body.is_urgent !== undefined ? (body.is_urgent ? 1 : 0) : existing.is_urgent;
  const deadlineDate = body.deadline_date !== undefined ? body.deadline_date : existing.deadline_date;
  const pinned = body.pinned !== undefined ? (body.pinned ? 1 : 0) : existing.pinned;
  const archived = body.archived !== undefined ? (body.archived ? 1 : 0) : existing.archived;

  db.prepare(`
    UPDATE announcements
    SET title = ?, summary = ?, content = ?, category = ?, audience = ?,
        is_urgent = ?, deadline_date = ?, pinned = ?, archived = ?, updated_at = datetime('now')
    WHERE id = ?
  `).run(title, summary, content, category, audience, isUrgent, deadlineDate, pinned, archived, id);

  const updated = db.prepare('SELECT * FROM announcements WHERE id = ?').get(id);

  return new Response(
    JSON.stringify({
      success: true,
      announcement: updated,
      message: 'Comunicado actualizado correctamente'
    }),
    {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    }
  );
};

export const PATCH: APIRoute = async ({ params, request }) => {
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

  let body: any = {};
  try {
    body = await request.json();
  } catch {
    // optional body
  }

  let newPinned = existing.pinned;
  let newArchived = existing.archived;

  if (body.pinned !== undefined) {
    newPinned = body.pinned ? 1 : 0;
  } else if (body.toggle === 'pin') {
    newPinned = existing.pinned ? 0 : 1;
  }

  if (body.archived !== undefined) {
    newArchived = body.archived ? 1 : 0;
  } else if (body.toggle === 'archive') {
    newArchived = existing.archived ? 0 : 1;
  }

  db.prepare(`
    UPDATE announcements
    SET pinned = ?, archived = ?, updated_at = datetime('now')
    WHERE id = ?
  `).run(newPinned, newArchived, id);

  return new Response(
    JSON.stringify({
      success: true,
      pinned: newPinned,
      archived: newArchived,
      message: 'Estado actualizado correctamente'
    }),
    {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    }
  );
};

export const DELETE: APIRoute = async ({ params }) => {
  const id = Number(params.id);
  if (isNaN(id)) {
    return new Response(JSON.stringify({ success: false, error: 'ID inválido' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const db = getDb();
  const existing = db.prepare('SELECT id FROM announcements WHERE id = ?').get(id);
  if (!existing) {
    return new Response(JSON.stringify({ success: false, error: 'Comunicado no encontrado' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  // Delete read confirmations and announcement
  db.prepare('DELETE FROM read_confirmations WHERE announcement_id = ?').run(id);
  db.prepare('DELETE FROM announcements WHERE id = ?').run(id);

  return new Response(
    JSON.stringify({
      success: true,
      message: 'Comunicado eliminado correctamente'
    }),
    {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    }
  );
};

import { g as getDb } from '../../../../chunks/db_D9z2L-6S.mjs';
export { renderers } from '../../../../renderers.mjs';

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
  return new Response(JSON.stringify({ success: true, announcement }), {
    status: 200,
    headers: { "Content-Type": "application/json" }
  });
};
const PUT = async ({ params, request }) => {
  const id = Number(params.id);
  if (isNaN(id)) {
    return new Response(JSON.stringify({ success: false, error: "ID inválido" }), {
      status: 400,
      headers: { "Content-Type": "application/json" }
    });
  }
  const db = getDb();
  const existing = db.prepare("SELECT * FROM announcements WHERE id = ?").get(id);
  if (!existing) {
    return new Response(JSON.stringify({ success: false, error: "Comunicado no encontrado" }), {
      status: 404,
      headers: { "Content-Type": "application/json" }
    });
  }
  let body;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ success: false, error: "Cuerpo JSON inválido" }), {
      status: 400,
      headers: { "Content-Type": "application/json" }
    });
  }
  const title = body.title !== void 0 ? String(body.title).trim() : existing.title;
  if (title.length < 5) {
    return new Response(
      JSON.stringify({ success: false, error: "El título debe tener al menos 5 caracteres" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }
  const summary = body.summary !== void 0 ? String(body.summary).trim() : existing.summary;
  const content = body.content !== void 0 ? String(body.content).trim() : existing.content;
  const category = body.category !== void 0 ? body.category : existing.category;
  const audience = body.audience !== void 0 ? body.audience : existing.audience;
  const isUrgent = body.is_urgent !== void 0 ? body.is_urgent ? 1 : 0 : existing.is_urgent;
  const deadlineDate = body.deadline_date !== void 0 ? body.deadline_date : existing.deadline_date;
  const pinned = body.pinned !== void 0 ? body.pinned ? 1 : 0 : existing.pinned;
  const archived = body.archived !== void 0 ? body.archived ? 1 : 0 : existing.archived;
  db.prepare(`
    UPDATE announcements
    SET title = ?, summary = ?, content = ?, category = ?, audience = ?,
        is_urgent = ?, deadline_date = ?, pinned = ?, archived = ?, updated_at = datetime('now')
    WHERE id = ?
  `).run(title, summary, content, category, audience, isUrgent, deadlineDate, pinned, archived, id);
  const updated = db.prepare("SELECT * FROM announcements WHERE id = ?").get(id);
  return new Response(
    JSON.stringify({
      success: true,
      announcement: updated,
      message: "Comunicado actualizado correctamente"
    }),
    {
      status: 200,
      headers: { "Content-Type": "application/json" }
    }
  );
};
const PATCH = async ({ params, request }) => {
  const id = Number(params.id);
  if (isNaN(id)) {
    return new Response(JSON.stringify({ success: false, error: "ID inválido" }), {
      status: 400,
      headers: { "Content-Type": "application/json" }
    });
  }
  const db = getDb();
  const existing = db.prepare("SELECT * FROM announcements WHERE id = ?").get(id);
  if (!existing) {
    return new Response(JSON.stringify({ success: false, error: "Comunicado no encontrado" }), {
      status: 404,
      headers: { "Content-Type": "application/json" }
    });
  }
  let body = {};
  try {
    body = await request.json();
  } catch {
  }
  let newPinned = existing.pinned;
  let newArchived = existing.archived;
  if (body.pinned !== void 0) {
    newPinned = body.pinned ? 1 : 0;
  } else if (body.toggle === "pin") {
    newPinned = existing.pinned ? 0 : 1;
  }
  if (body.archived !== void 0) {
    newArchived = body.archived ? 1 : 0;
  } else if (body.toggle === "archive") {
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
      message: "Estado actualizado correctamente"
    }),
    {
      status: 200,
      headers: { "Content-Type": "application/json" }
    }
  );
};
const DELETE = async ({ params }) => {
  const id = Number(params.id);
  if (isNaN(id)) {
    return new Response(JSON.stringify({ success: false, error: "ID inválido" }), {
      status: 400,
      headers: { "Content-Type": "application/json" }
    });
  }
  const db = getDb();
  const existing = db.prepare("SELECT id FROM announcements WHERE id = ?").get(id);
  if (!existing) {
    return new Response(JSON.stringify({ success: false, error: "Comunicado no encontrado" }), {
      status: 404,
      headers: { "Content-Type": "application/json" }
    });
  }
  db.prepare("DELETE FROM read_confirmations WHERE announcement_id = ?").run(id);
  db.prepare("DELETE FROM announcements WHERE id = ?").run(id);
  return new Response(
    JSON.stringify({
      success: true,
      message: "Comunicado eliminado correctamente"
    }),
    {
      status: 200,
      headers: { "Content-Type": "application/json" }
    }
  );
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  DELETE,
  GET,
  PATCH,
  PUT
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };

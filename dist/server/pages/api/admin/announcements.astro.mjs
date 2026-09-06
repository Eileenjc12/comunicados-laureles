import { g as getDb } from '../../../chunks/db_D9z2L-6S.mjs';
export { renderers } from '../../../renderers.mjs';

function slugify(text) {
  return text.toString().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}
const GET = async () => {
  const db = getDb();
  const announcements = db.prepare(`
    SELECT 
      a.*,
      (SELECT COUNT(DISTINCT property_id) FROM read_confirmations WHERE announcement_id = a.id) as confirmed_reads
    FROM announcements a
    ORDER BY a.pinned DESC, a.created_at DESC
  `).all();
  return new Response(
    JSON.stringify({
      success: true,
      announcements,
      total: announcements.length
    }),
    {
      status: 200,
      headers: { "Content-Type": "application/json" }
    }
  );
};
const POST = async ({ request }) => {
  let body;
  try {
    body = await request.json();
  } catch {
    return new Response(
      JSON.stringify({ success: false, error: "Cuerpo de solicitud JSON inválido" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }
  const title = String(body.title || "").trim();
  if (!title || title.length < 5) {
    return new Response(
      JSON.stringify({ success: false, error: "El título debe tener al menos 5 caracteres" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }
  const validCategories = [
    "Urgente / Alertas",
    "Mantenimiento",
    "Convocatorias de Asamblea",
    "Normas de Convivencia",
    "Finanzas / Cuotas"
  ];
  const category = validCategories.includes(body.category) ? body.category : "Mantenimiento";
  const validAudiences = ["General", "Solo Propietarios", "Solo Inquilinos"];
  const audience = validAudiences.includes(body.audience) ? body.audience : "General";
  const summary = String(body.summary || title.slice(0, 150)).trim();
  const content = String(body.content || "").trim();
  const isUrgent = body.is_urgent || body.isUrgent ? 1 : 0;
  const isPinned = body.pinned || body.is_pinned || body.isPinned ? 1 : 0;
  const deadlineDate = body.deadline_date || body.deadlineDate || null;
  let baseSlug = body.slug ? slugify(body.slug) : slugify(title);
  if (!baseSlug) baseSlug = `comunicado-${Date.now()}`;
  let slug = baseSlug;
  const db = getDb();
  let count = 1;
  while (true) {
    const existing = db.prepare("SELECT id FROM announcements WHERE slug = ?").get(slug);
    if (!existing) break;
    slug = `${baseSlug}-${count++}`;
  }
  const stmt = db.prepare(`
    INSERT INTO announcements (
      title, slug, summary, content, category, audience,
      is_urgent, deadline_date, pinned, archived, visit_count, created_at, updated_at
    ) VALUES (
      ?, ?, ?, ?, ?, ?,
      ?, ?, ?, 0, 0, datetime('now'), datetime('now')
    )
  `);
  const info = stmt.run(
    title,
    slug,
    summary,
    content,
    category,
    audience,
    isUrgent,
    deadlineDate,
    isPinned
  );
  const newId = Number(info.lastInsertRowid);
  const newAnnouncement = db.prepare("SELECT * FROM announcements WHERE id = ?").get(newId);
  return new Response(
    JSON.stringify({
      success: true,
      announcement: newAnnouncement
    }),
    {
      status: 201,
      headers: { "Content-Type": "application/json" }
    }
  );
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  GET,
  POST
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };

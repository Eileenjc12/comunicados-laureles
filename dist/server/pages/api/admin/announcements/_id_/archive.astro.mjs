import { g as getDb } from '../../../../../chunks/db_D9z2L-6S.mjs';
export { renderers } from '../../../../../renderers.mjs';

const PATCH = async ({ params }) => {
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
  const newArchived = existing.archived ? 0 : 1;
  db.prepare("UPDATE announcements SET archived = ?, updated_at = datetime('now') WHERE id = ?").run(newArchived, id);
  return new Response(
    JSON.stringify({
      success: true,
      archived: newArchived,
      message: `Comunicado ${newArchived ? "archivado" : "desarchivado"} exitosamente`
    }),
    {
      status: 200,
      headers: { "Content-Type": "application/json" }
    }
  );
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  PATCH
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };

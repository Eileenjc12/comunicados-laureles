import { g as getDb } from '../../../../chunks/db_D9z2L-6S.mjs';
export { renderers } from '../../../../renderers.mjs';

const prerender = false;
const POST = async (context) => {
  try {
    const db = getDb();
    const id = Number(context?.params?.id);
    if (!id || isNaN(id)) {
      return new Response(
        JSON.stringify({ success: false, error: "ID de comunicado inválido" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }
    const exists = db.prepare("SELECT id, visit_count FROM announcements WHERE id = ?").get(id);
    if (!exists) {
      return new Response(
        JSON.stringify({ success: false, error: "Comunicado no encontrado" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }
    db.prepare("UPDATE announcements SET visit_count = visit_count + 1 WHERE id = ?").run(id);
    const updated = db.prepare("SELECT visit_count FROM announcements WHERE id = ?").get(id);
    return new Response(
      JSON.stringify({
        success: true,
        visitCount: updated.visit_count
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
        error: error.message || "Error al registrar visita"
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
  POST,
  prerender
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };

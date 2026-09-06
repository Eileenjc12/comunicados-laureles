import { g as getDb } from '../../chunks/db_D9z2L-6S.mjs';
export { renderers } from '../../renderers.mjs';

const prerender = false;
const GET = async (context) => {
  try {
    const db = getDb();
    const url = context?.url ? typeof context.url === "string" ? new URL(context.url) : context.url : new URL("http://localhost");
    const searchParams = url.searchParams;
    const category = searchParams.get("category");
    const audience = searchParams.get("audience");
    const search = searchParams.get("search") || searchParams.get("q");
    const date = searchParams.get("date");
    const includeArchived = searchParams.get("include_archived") === "true" || searchParams.get("include_archived") === "1";
    let query = `
      SELECT id, title, slug, summary, content, category, audience,
             is_urgent, deadline_date, pinned, archived, visit_count,
             created_at, updated_at
      FROM announcements
      WHERE 1=1
    `;
    const params = [];
    if (!includeArchived) {
      query += " AND archived = 0";
    }
    if (category && category !== "Todos") {
      query += " AND LOWER(category) = LOWER(?)";
      params.push(category);
    }
    if (audience && audience !== "Todos") {
      query += " AND LOWER(audience) = LOWER(?)";
      params.push(audience);
    }
    if (search && search.trim()) {
      const term = `%${search.trim()}%`;
      query += " AND (title LIKE ? OR summary LIKE ? OR content LIKE ?)";
      params.push(term, term, term);
    }
    if (date && date.trim()) {
      const datePrefix = `${date.trim()}%`;
      query += " AND (created_at LIKE ? OR deadline_date LIKE ?)";
      params.push(datePrefix, datePrefix);
    }
    query += " ORDER BY pinned DESC, created_at DESC";
    const announcements = db.prepare(query).all(...params);
    return new Response(
      JSON.stringify({
        success: true,
        announcements,
        total: announcements.length
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
        error: error.message || "Error al obtener comunicados"
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

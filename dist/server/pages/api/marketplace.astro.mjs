import { g as getDb } from '../../chunks/db_D9z2L-6S.mjs';
export { renderers } from '../../renderers.mjs';

const GET = async ({ url }) => {
  try {
    const db = getDb();
    const categoryParam = url.searchParams.get("category");
    const searchParam = url.searchParams.get("search") || url.searchParams.get("q");
    const statusParam = url.searchParams.get("status") || "approved";
    const targetStatus = statusParam === "approved" ? "approved" : "approved";
    let sql = "SELECT * FROM marketplace_listings WHERE status = ?";
    const params = [targetStatus];
    if (categoryParam && categoryParam.trim() !== "" && categoryParam !== "Todos") {
      sql += " AND LOWER(category) = LOWER(?)";
      params.push(categoryParam.trim());
    }
    if (searchParam && searchParam.trim() !== "") {
      sql += " AND (title LIKE ? OR description LIKE ? OR entrepreneur_name LIKE ?)";
      const term = `%${searchParam.trim()}%`;
      params.push(term, term, term);
    }
    sql += " ORDER BY id ASC";
    const rows = db.prepare(sql).all(...params);
    const listings = rows.map((r) => ({
      id: r.id,
      title: r.title,
      description: r.description,
      category: r.category,
      entrepreneur_name: r.entrepreneur_name,
      entrepreneurName: r.entrepreneur_name,
      property_address: r.property_address,
      propertyAddress: r.property_address,
      phone: r.phone,
      whatsapp_message: r.whatsapp_message,
      whatsappMessage: r.whatsapp_message,
      whatsappMessageTemplate: r.whatsapp_message,
      image_url: r.image_url,
      imageUrl: r.image_url,
      schedule_hours: r.schedule_hours,
      scheduleHours: r.schedule_hours,
      status: r.status,
      admin_notes: r.admin_notes,
      isFeatured: 0,
      is_featured: 0,
      created_at: r.created_at,
      createdAt: r.created_at,
      updated_at: r.updated_at,
      updatedAt: r.updated_at
    }));
    return new Response(
      JSON.stringify({
        success: true,
        listings,
        total: listings.length
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-store, no-cache, must-revalidate"
        }
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        code: "INTERNAL_ERROR",
        message: error.message || "Error interno del servidor."
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
  GET
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };

import type { APIRoute } from 'astro';
import { getDb } from '../../../lib/db.ts';

export const GET: APIRoute = async ({ url }) => {
  try {
    const db = getDb();
    const categoryParam = url.searchParams.get('category');
    const searchParam = url.searchParams.get('search') || url.searchParams.get('q');
    const statusParam = url.searchParams.get('status') || 'approved';

    // Public catalog strictly requires status = 'approved' unless an internal test requests otherwise
    const targetStatus = statusParam === 'approved' ? 'approved' : 'approved';

    let sql = 'SELECT * FROM marketplace_listings WHERE status = ?';
    const params: any[] = [targetStatus];

    if (categoryParam && categoryParam.trim() !== '' && categoryParam !== 'Todos') {
      sql += ' AND LOWER(category) = LOWER(?)';
      params.push(categoryParam.trim());
    }

    if (searchParam && searchParam.trim() !== '') {
      sql += ' AND (title LIKE ? OR description LIKE ? OR entrepreneur_name LIKE ?)';
      const term = `%${searchParam.trim()}%`;
      params.push(term, term, term);
    }

    sql += ' ORDER BY id ASC';

    const rows = db.prepare(sql).all(...params) as any[];

    // Map rows to provide dual camelCase and snake_case properties
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
      updatedAt: r.updated_at,
    }));

    return new Response(
      JSON.stringify({
        success: true,
        listings,
        total: listings.length,
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-store, no-cache, must-revalidate',
        },
      }
    );
  } catch (error: any) {
    return new Response(
      JSON.stringify({
        success: false,
        code: 'INTERNAL_ERROR',
        message: error.message || 'Error interno del servidor.',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
};

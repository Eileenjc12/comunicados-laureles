import type { APIRoute } from 'astro';
import { getDb } from '../../../lib/db.ts';

export const prerender = false;

export const GET: APIRoute = async (context: any) => {
  try {
    const db = getDb();
    const slug = context?.params?.slug;

    if (!slug) {
      return new Response(
        JSON.stringify({ success: false, error: 'Slug de comunicado no proporcionado' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const announcement = db
      .prepare('SELECT * FROM announcements WHERE slug = ?')
      .get(slug) as any;

    if (!announcement) {
      return new Response(
        JSON.stringify({ success: false, error: 'Comunicado no encontrado' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const readsRow = db
      .prepare('SELECT COUNT(*) as count FROM read_confirmations WHERE announcement_id = ?')
      .get(announcement.id) as { count: number };
    const confirmedCount = readsRow ? readsRow.count : 0;

    const censusRow = db
      .prepare('SELECT COUNT(*) as count FROM census_properties WHERE is_active = 1')
      .get() as { count: number };
    const totalCensus = censusRow ? censusRow.count : 52;

    const rawPercentage = totalCensus > 0 ? (confirmedCount / totalCensus) * 100.0 : 0;
    const percentage = Math.round(rawPercentage * 10) / 10;

    let tier = 'low';
    let tierLabel = 'Bajo quórum';

    if (percentage >= 70.0) {
      tier = 'high';
      tierLabel = 'Quórum reglamentario alcanzado';
    } else if (percentage >= 35.0) {
      tier = 'moderate';
      tierLabel = 'En proceso de notificación';
    }

    return new Response(
      JSON.stringify({
        success: true,
        announcement,
        confirmedPropertiesCount: confirmedCount,
        totalCensus,
        readPercentage: percentage,
        quorumTier: tier,
        quorumLabel: tierLabel,
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-store',
        },
      }
    );
  } catch (error: any) {
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Error al obtener detalle del comunicado',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
};

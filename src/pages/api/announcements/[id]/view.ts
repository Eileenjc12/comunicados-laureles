import type { APIRoute } from 'astro';
import { getDb } from '../../../../lib/db.ts';

export const prerender = false;

export const POST: APIRoute = async (context: any) => {
  try {
    const db = getDb();
    const id = Number(context?.params?.id);

    if (!id || isNaN(id)) {
      return new Response(
        JSON.stringify({ success: false, error: 'ID de comunicado inválido' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const exists = db.prepare('SELECT id, visit_count FROM announcements WHERE id = ?').get(id) as any;
    if (!exists) {
      return new Response(
        JSON.stringify({ success: false, error: 'Comunicado no encontrado' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Atomic increment
    db.prepare('UPDATE announcements SET visit_count = visit_count + 1 WHERE id = ?').run(id);

    const updated = db.prepare('SELECT visit_count FROM announcements WHERE id = ?').get(id) as {
      visit_count: number;
    };

    return new Response(
      JSON.stringify({
        success: true,
        visitCount: updated.visit_count,
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
        error: error.message || 'Error al registrar visita',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
};

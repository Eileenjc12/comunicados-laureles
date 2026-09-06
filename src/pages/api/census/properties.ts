import type { APIRoute } from 'astro';
import { getDb } from '../../../lib/db.ts';

export const prerender = false;

export const GET: APIRoute = async () => {
  try {
    const db = getDb();
    const rows = db.prepare(`
      SELECT id, manzana, lote, address, owner_name, is_active, created_at
      FROM census_properties
      WHERE is_active = 1
      ORDER BY id ASC
    `).all() as Array<{
      id: number;
      manzana: string;
      lote: string;
      address: string;
      owner_name: string;
      is_active: number;
      created_at: string;
    }>;

    // Provide dual format: both Spanish db names and English test-framework names
    const properties = rows.map((r) => {
      // Extract numeric suffix if any for code formatting
      const blockNum = r.manzana.replace(/^Mz\.\s*/i, '').trim();
      const lotNum = r.lote.replace(/^Lote\s*/i, '').trim();
      const code = `MZ-${blockNum}-${lotNum.padStart(2, '0')}`;

      return {
        id: r.id,
        manzana: r.manzana,
        lote: r.lote,
        address: r.address,
        owner_name: r.owner_name,
        is_active: r.is_active,
        created_at: r.created_at,
        // Compatibility aliases matching test expectations
        block: r.manzana,
        lot: r.lote,
        code: code,
        street: r.address,
        owner: r.owner_name,
      };
    });

    return new Response(
      JSON.stringify({
        success: true,
        properties,
        total: properties.length,
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
        error: error.message || 'Error al obtener padrón de inmuebles',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
};

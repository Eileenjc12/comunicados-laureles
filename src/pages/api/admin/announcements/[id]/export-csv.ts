import type { APIRoute } from 'astro';
import { getDb, type Announcement, type CensusProperty } from '../../../../../lib/db.ts';
import { generateAttendanceCsv } from '../../../../../lib/csv.ts';

export const GET: APIRoute = async ({ params, url }) => {
  const id = Number(params.id);
  if (isNaN(id)) {
    return new Response('ID inválido', { status: 400 });
  }

  const db = getDb();
  const announcement = db.prepare('SELECT * FROM announcements WHERE id = ?').get(id) as Announcement | undefined;
  if (!announcement) {
    return new Response('Comunicado no encontrado', { status: 404 });
  }

  const mode = (url.searchParams.get('mode') === 'confirmed_only' ? 'confirmed_only' : 'full_census') as 'full_census' | 'confirmed_only';

  const properties = db.prepare('SELECT * FROM census_properties WHERE is_active = 1 ORDER BY manzana ASC, lote ASC').all() as CensusProperty[];

  const confirmedRows = db.prepare(`
    SELECT rc.*, cp.manzana, cp.lote, cp.address
    FROM read_confirmations rc
    JOIN census_properties cp ON rc.property_id = cp.id
    WHERE rc.announcement_id = ?
  `).all(id) as Array<{
    property_id: number;
    resident_name: string;
    role: string;
    confirmed_at: string;
    manzana: string;
    lote: string;
    address: string;
  }>;

  const confirmedMap = new Map<number, { resident_name: string; role: string; confirmed_at: string }>();
  for (const c of confirmedRows) {
    confirmedMap.set(c.property_id, {
      resident_name: c.resident_name,
      role: c.role,
      confirmed_at: c.confirmed_at
    });
  }

  const rows = properties.map(p => {
    const confirmed = confirmedMap.get(p.id);
    const mz = p.manzana.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
    const lt = p.lote.replace(/[^0-9]/g, '');
    const code = `${mz}-${lt.padStart(2, '0')}`;

    if (confirmed) {
      return {
        manzana: p.manzana,
        lote: p.lote,
        code,
        address: p.address,
        residentName: confirmed.resident_name,
        role: confirmed.role,
        confirmedAt: confirmed.confirmed_at,
        confirmed: true,
        status: 'CONFIRMADO'
      };
    }

    return {
      manzana: p.manzana,
      lote: p.lote,
      code,
      address: p.address,
      residentName: p.owner_name,
      role: 'Propietario',
      confirmedAt: 'Pendiente',
      confirmed: false,
      status: 'PENDIENTE'
    };
  });

  const csvContent = generateAttendanceCsv(announcement.title, rows, { mode, delimiter: ';' });
  const filename = `asistencia_${announcement.slug}.csv`;

  return new Response(csvContent, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Cache-Control': 'no-cache, no-store, must-revalidate'
    }
  });
};

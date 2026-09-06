import type { APIRoute } from 'astro';
import { getDb } from '../../../../lib/db.ts';

export const prerender = false;

const VALID_ROLES = ['Propietario', 'Inquilino'];

export const POST: APIRoute = async (context: any) => {
  try {
    const db = getDb();
    const announcementId = Number(context?.params?.id);

    if (!announcementId || isNaN(announcementId)) {
      return new Response(
        JSON.stringify({ success: false, error: 'ID de comunicado inválido' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Verify announcement exists
    const announcement = db
      .prepare('SELECT id FROM announcements WHERE id = ?')
      .get(announcementId);

    if (!announcement) {
      return new Response(
        JSON.stringify({ success: false, error: 'Comunicado no encontrado' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Parse JSON request body
    let body: any;
    try {
      body = await context?.request?.json();
    } catch {
      return new Response(
        JSON.stringify({
          success: false,
          code: 'VALIDATION_ERROR',
          error: 'Cuerpo de solicitud JSON inválido',
          errors: ['Cuerpo de solicitud JSON inválido.'],
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const rawPropertyId = body?.propertyId ?? body?.property_id;
    const propertyId = Number(rawPropertyId);
    const rawResidentName = body?.residentName ?? body?.resident_name ?? '';
    const residentName = typeof rawResidentName === 'string' ? rawResidentName.trim() : '';
    const rawRole = body?.role ?? body?.resident_role ?? '';
    const role = typeof rawRole === 'string' ? rawRole.trim() : '';

    const errors: string[] = [];

    // Property ID validation
    if (!rawPropertyId || isNaN(propertyId) || propertyId <= 0) {
      errors.push('El ID de inmueble es obligatorio y debe ser numérico.');
    } else {
      const property = db
        .prepare('SELECT id FROM census_properties WHERE id = ? AND is_active = 1')
        .get(propertyId);
      if (!property) {
        errors.push(`El inmueble con ID ${propertyId} no existe en el padrón oficial.`);
      }
    }

    // Resident name validation
    if (!residentName || residentName.length < 3) {
      errors.push('El nombre del residente debe tener al menos 3 caracteres.');
    } else if (residentName.length > 150) {
      errors.push('El nombre del residente no puede exceder 150 caracteres.');
    }

    // Role validation
    if (!VALID_ROLES.includes(role)) {
      errors.push(`El rol debe ser 'Propietario' o 'Inquilino'. Recibido: '${role}'`);
    }

    // Check duplicate prior to insert
    if (propertyId && !isNaN(propertyId)) {
      const existing = db
        .prepare(
          'SELECT id FROM read_confirmations WHERE announcement_id = ? AND property_id = ?'
        )
        .get(announcementId, propertyId);

      if (existing) {
        return new Response(
          JSON.stringify({
            success: false,
            error: 'ALREADY_CONFIRMED',
            code: 'ALREADY_CONFIRMED',
            message: 'Este inmueble ya registró su confirmación de lectura previamente.',
          }),
          { status: 409, headers: { 'Content-Type': 'application/json' } }
        );
      }
    }

    if (errors.length > 0) {
      return new Response(
        JSON.stringify({
          success: false,
          code: 'VALIDATION_ERROR',
          error: errors[0],
          errors,
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Attempt insert
    let insertResult;
    try {
      const insertStmt = db.prepare(`
        INSERT INTO read_confirmations (announcement_id, property_id, resident_name, role, confirmed_at)
        VALUES (?, ?, ?, ?, datetime('now'))
      `);
      insertResult = insertStmt.run(announcementId, propertyId, residentName, role);
    } catch (dbErr: any) {
      if (dbErr.message && /UNIQUE constraint failed/i.test(dbErr.message)) {
        return new Response(
          JSON.stringify({
            success: false,
            error: 'ALREADY_CONFIRMED',
            code: 'ALREADY_CONFIRMED',
            message: 'Este inmueble ya registró su confirmación de lectura previamente.',
          }),
          { status: 409, headers: { 'Content-Type': 'application/json' } }
        );
      }
      throw dbErr;
    }

    // Fetch inserted record timestamp
    const insertedRecord = db
      .prepare('SELECT id, announcement_id, property_id, resident_name, role, confirmed_at FROM read_confirmations WHERE id = ?')
      .get(insertResult.lastInsertRowid) as {
      id: number;
      announcement_id: number;
      property_id: number;
      resident_name: string;
      role: string;
      confirmed_at: string;
    };

    // Calculate updated quorum statistics
    const confirmedRow = db
      .prepare('SELECT COUNT(*) as count FROM read_confirmations WHERE announcement_id = ?')
      .get(announcementId) as { count: number };
    const confirmedCount = confirmedRow ? confirmedRow.count : 0;

    const censusRow = db
      .prepare('SELECT COUNT(*) as count FROM census_properties WHERE is_active = 1')
      .get() as { count: number };
    const totalProperties = censusRow ? censusRow.count : 52;

    const rawPercentage = totalProperties > 0 ? (confirmedCount / totalProperties) * 100.0 : 0;
    const percentage = Math.round(rawPercentage * 10) / 10;

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Lectura confirmada exitosamente.',
        confirmation: {
          id: insertedRecord.id,
          announcementId: insertedRecord.announcement_id,
          propertyId: insertedRecord.property_id,
          residentName: insertedRecord.resident_name,
          role: insertedRecord.role,
          confirmedAt: insertedRecord.confirmed_at,
        },
        stats: {
          confirmedCount,
          totalProperties,
          percentage,
        },
      }),
      {
        status: 201,
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
        error: error.message || 'Error al registrar confirmación de lectura',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
};

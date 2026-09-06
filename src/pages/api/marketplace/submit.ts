import type { APIRoute } from 'astro';
import { getDb } from '../../../lib/db.ts';

const VALID_CATEGORIES = [
  'Gastronomía / Comida',
  'Vestimenta / Ropa',
  'Servicios Técnicos',
  'Gasfitería / Electricidad',
  'Belleza / Cuidado Personal',
  'Otros',
];

export const POST: APIRoute = async ({ request }) => {
  try {
    let payload: Record<string, any> = {};

    const contentType = request.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      payload = await request.json().catch(() => ({}));
    } else if (
      contentType.includes('application/x-www-form-urlencoded') ||
      contentType.includes('multipart/form-data')
    ) {
      const formData = await request.formData().catch(() => new FormData());
      for (const [key, value] of formData.entries()) {
        payload[key] = typeof value === 'string' ? value : value.name;
      }
    } else {
      payload = await request.json().catch(() => ({}));
    }

    const title = String(payload.title ?? payload.titulo ?? '').trim();
    const category = String(payload.category ?? payload.categoria ?? '').trim();
    const description = String(payload.description ?? payload.descripcion ?? '').trim();
    const entrepreneurName = String(
      payload.entrepreneurName ?? payload.entrepreneur_name ?? payload.nombre ?? ''
    ).trim();
    const propertyAddress = String(
      payload.propertyAddress ??
        payload.property_address ??
        payload.property ??
        payload.direccion ??
        ''
    ).trim();
    const phone = String(payload.phone ?? payload.telefono ?? payload.whatsapp ?? '').trim();
    const scheduleHours = String(
      payload.scheduleHours ??
        payload.schedule_hours ??
        payload.schedule ??
        payload.horario ??
        ''
    ).trim();
    const whatsappMessage = String(
      payload.whatsappMessage ??
        payload.whatsapp_message ??
        payload.whatsappMessageTemplate ??
        payload.mensaje ??
        ''
    ).trim();
    const imageUrl = String(
      payload.imageUrl ?? payload.image_url ?? payload.foto ?? ''
    ).trim();

    const errors: string[] = [];

    // Title validation: 3 - 80 chars
    if (!title || title.length < 3 || title.length > 80) {
      errors.push('El título comercial debe tener entre 3 y 80 caracteres.');
    }

    // Category enum validation
    if (!category || !VALID_CATEGORIES.includes(category)) {
      errors.push(
        `Categoría inválida. Debe ser una de: ${VALID_CATEGORIES.join(', ')}`
      );
    }

    // Description validation: 15 - 500 chars
    if (!description || description.length < 15 || description.length > 500) {
      errors.push('La descripción debe tener entre 15 y 500 caracteres.');
    }

    // Entrepreneur name: 3 - 80 chars
    if (!entrepreneurName || entrepreneurName.length < 3 || entrepreneurName.length > 80) {
      errors.push('El nombre del emprendedor debe tener entre 3 y 80 caracteres.');
    }

    // Property address: >= 3 chars
    if (!propertyAddress || propertyAddress.length < 3) {
      errors.push('La dirección / inmueble en la urbanización es obligatoria.');
    }

    // Phone: >= 9 digits
    const cleanPhone = phone.replace(/\D/g, '');
    if (!cleanPhone || cleanPhone.length < 9) {
      errors.push('El número de WhatsApp debe contener al menos 9 dígitos.');
    }

    // Schedule: >= 5 chars
    if (!scheduleHours || scheduleHours.length < 5) {
      errors.push('El horario de atención es obligatorio (mínimo 5 caracteres).');
    }

    if (errors.length > 0) {
      return new Response(
        JSON.stringify({
          success: false,
          code: 'VALIDATION_ERROR',
          errors,
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    const db = getDb();
    const insertStmt = db.prepare(`
      INSERT INTO marketplace_listings (
        title,
        description,
        category,
        entrepreneur_name,
        property_address,
        phone,
        whatsapp_message,
        image_url,
        schedule_hours,
        status,
        created_at,
        updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', datetime('now'), datetime('now'))
    `);

    const result = insertStmt.run(
      title,
      description,
      category,
      entrepreneurName,
      propertyAddress,
      phone,
      whatsappMessage || null,
      imageUrl || '/images/marketplace/default-business.svg',
      scheduleHours
    );

    const newId = Number(result.lastInsertRowid);

    return new Response(
      JSON.stringify({
        success: true,
        message:
          'Postulación recibida con éxito. Pendiente de aprobación administrativa.',
        id: newId,
        status: 'pending',
      }),
      {
        status: 201,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error: any) {
    return new Response(
      JSON.stringify({
        success: false,
        code: 'INTERNAL_ERROR',
        message: error.message || 'Error al procesar la postulación.',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
};

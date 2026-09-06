/**
 * WhatsApp Integration Utilities
 * Urbanización Los Laureles — Mercado Laureles (R3) & Recordatorios Comunitarios (R4)
 */

/**
 * Sanitizes phone numbers to standard E.164 without symbols (e.g. 51XXXXXXXXX).
 * Handles Peruvian mobile numbers (+51, spaces, hyphens, parentheses),
 * prepending 51 to 9-digit Peruvian numbers starting with 9.
 */
export function sanitizePhone(phone: string): string {
  if (!phone || typeof phone !== 'string') {
    throw new Error('El teléfono es obligatorio y debe ser un texto.');
  }

  // Strip all non-digit characters
  const clean = phone.replace(/\D/g, '');

  if (!clean) {
    throw new Error('El número telefónico no contiene dígitos válidos.');
  }

  // Prepend Peru country code (51) if standard 9-digit Peruvian mobile starting with 9
  if (clean.length === 9 && clean.startsWith('9')) {
    return `51${clean}`;
  }

  return clean;
}

/**
 * Formats a phone number for user-friendly UI display.
 * E.g. "51987654321" -> "+51 987 654 321"
 */
export function formatDisplayPhone(phone: string): string {
  if (!phone) return '';
  const clean = phone.replace(/\D/g, '');
  if (clean.length === 11 && clean.startsWith('519')) {
    return `+51 ${clean.slice(2, 5)} ${clean.slice(5, 8)} ${clean.slice(8)}`;
  }
  if (clean.length === 9 && clean.startsWith('9')) {
    return `+51 ${clean.slice(0, 3)} ${clean.slice(3, 6)} ${clean.slice(6)}`;
  }
  return phone;
}

/**
 * Generates direct WhatsApp chat URL with sanitized phone number and prefilled message.
 * Supports multiple invocation styles:
 * 1. (phone, template, businessName)
 * 2. (phone, title, entrepreneurName, customTemplate)
 * 3. (phone, message)
 */
export function generateWhatsAppLink(
  phone: string,
  arg2?: string | null,
  arg3?: string | null,
  arg4?: string | null
): string {
  const cleanPhone = sanitizePhone(phone);
  let message = '';

  // Case 1: 4 arguments provided: (phone, title, entrepreneurName, customTemplate)
  if (arg4 !== undefined && arg4 !== null) {
    const title = arg2 || '';
    const name = arg3 || '';
    const customTemplate = arg4;
    if (customTemplate && typeof customTemplate === 'string' && customTemplate.trim().length > 0) {
      message = customTemplate
        .replace(/\{title\}/g, title)
        .replace(/\{businessName\}/g, title)
        .replace(/\{name\}/g, name)
        .replace(/\{entrepreneur_name\}/g, name);
    } else {
      message = `¡Hola ${name}! Vi tu emprendimiento "${title}" en el Mercado Laureles. Quisiera consultar sobre tus productos y servicios.`;
    }
  }
  // Case 2: 3 arguments provided
  else if (arg3 !== undefined && arg3 !== null) {
    const rawArg2 = arg2 || '';
    // Check if arg2 contains placeholders {title}, {businessName}, {name}, {entrepreneur_name}
    if (/\{title\}|\{businessName\}|\{name\}|\{entrepreneur_name\}/i.test(rawArg2)) {
      message = rawArg2
        .replace(/\{title\}/g, arg3)
        .replace(/\{businessName\}/g, arg3)
        .replace(/\{name\}/g, arg3)
        .replace(/\{entrepreneur_name\}/g, arg3);
    } else if (rawArg2.startsWith('¡Hola') || rawArg2.startsWith('Hola') || rawArg2.length > 50) {
      // arg2 is an explicit message template
      message = rawArg2;
      if (arg3 && !message.includes(arg3)) {
        message = `${rawArg2} (${arg3})`;
      }
    } else {
      // arg2 is title, arg3 is entrepreneurName
      const title = rawArg2;
      const name = arg3;
      message = `¡Hola ${name}! Vi tu emprendimiento "${title}" en el Mercado Laureles. Quisiera consultar sobre tus productos y servicios.`;
    }
  }
  // Case 3: 2 arguments provided: (phone, message)
  else if (arg2) {
    message = arg2;
  }
  // Case 4: Only phone provided
  else {
    message = '¡Hola! Vi tu emprendimiento en el Mercado Laureles de la Urbanización Los Laureles y quisiera realizar una consulta.';
  }

  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message.trim())}`;
}

export interface WhatsAppReminderDetails {
  messageText: string;
  whatsappUrl: string;
  missingCount: number;
  confirmedCount: number;
  coveragePercent: number;
}

/**
 * Formats a WhatsApp reminder message grouped by Manzana for community groups.
 *
 * Overloads:
 * - (announcementTitle, announcementUrl, missingByManzana: Record<string, string[]>): string
 * - (announcementTitle, announcementUrl, totalCensus: number, missingProperties: any[]): WhatsAppReminderDetails
 */
export function generateWhatsAppReminderMessage(
  announcementTitle: string,
  announcementUrl: string,
  missingByManzana: Record<string, string[]>
): string;
export function generateWhatsAppReminderMessage(
  announcementTitle: string,
  announcementUrl: string,
  totalCensus: number,
  missingProperties: any[]
): WhatsAppReminderDetails;
export function generateWhatsAppReminderMessage(
  announcementTitle: string,
  announcementUrl: string,
  missingOrTotal: Record<string, string[]> | number,
  arg4?: any[]
): any {
  if (!announcementTitle || typeof announcementTitle !== 'string') {
    throw new Error('El título del comunicado es requerido.');
  }
  if (!announcementUrl || typeof announcementUrl !== 'string') {
    throw new Error('La URL del comunicado es requerida.');
  }

  let totalCensus = 52;
  let missingCount = 0;
  let formattedHouses = '';
  let isDetailedMode = false;

  if (typeof missingOrTotal === 'number') {
    // 4-arg mode: (title, url, totalCensus, missingProperties)
    isDetailedMode = true;
    totalCensus = missingOrTotal;
    const missingList = Array.isArray(arg4) ? arg4 : [];
    missingCount = missingList.length;

    const groupedByBlock: Record<string, string[]> = {};
    for (const item of missingList) {
      const block = item.block || item.manzana || 'Sin Manzana';
      const lot = item.lot || item.lote || item.unit_number || item.code || 'Lote desc.';
      if (!groupedByBlock[block]) {
        groupedByBlock[block] = [];
      }
      groupedByBlock[block].push(lot);
    }

    const blocks = Object.keys(groupedByBlock).sort();
    for (const block of blocks) {
      formattedHouses += `• *${block}:* ${groupedByBlock[block].join(', ')}\n`;
    }
  } else if (typeof missingOrTotal === 'object' && missingOrTotal !== null) {
    // 3-arg mode: (title, url, missingByManzana: Record<string, string[]>)
    const blocks = Object.keys(missingOrTotal).sort();
    for (const block of blocks) {
      const lots = missingOrTotal[block] || [];
      if (lots.length > 0) {
        missingCount += lots.length;
        formattedHouses += `• *${block}:* ${lots.join(', ')}\n`;
      }
    }
  }

  if (missingCount === 0) {
    formattedHouses = '• ¡Todas las casas han confirmado la lectura! (100% de cobertura)\n';
  }

  const confirmedCount = Math.max(0, totalCensus - missingCount);
  const coveragePercent = totalCensus > 0 ? Math.round((confirmedCount / totalCensus) * 100) : 0;

  const messageText = `📢 *URBANIZACIÓN LOS LAURELES — COMUNICADO OFICIAL*
📋 *Asunto:* ${announcementTitle.trim()}
🔗 *Leer y confirmar aquí:* ${announcementUrl.trim()}

Estimados vecinos, la Junta Directiva solicita a los propietarios e inquilinos revisar este comunicado importante para la convivencia y seguridad de nuestra comunidad.

📊 *Avance de confirmación:* ${confirmedCount}/${totalCensus} inmuebles (${coveragePercent}%)
⏳ *Inmuebles pendientes por confirmar (${missingCount}):*
${formattedHouses}👉 Por favor ingrese al enlace, lea el comunicado y registre su Manzana y Lote en el botón de confirmación. ¡Agradecemos su valiosa colaboración!`;

  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(messageText)}`;

  if (isDetailedMode) {
    return {
      messageText,
      whatsappUrl,
      missingCount,
      confirmedCount,
      coveragePercent,
      toString() {
        return messageText;
      },
    };
  }

  // Return string with metadata attached for full flexibility
  const str = new String(messageText) as any;
  str.messageText = messageText;
  str.whatsappUrl = whatsappUrl;
  str.missingCount = missingCount;
  str.confirmedCount = confirmedCount;
  str.coveragePercent = coveragePercent;
  str.toString = () => messageText;

  return messageText;
}

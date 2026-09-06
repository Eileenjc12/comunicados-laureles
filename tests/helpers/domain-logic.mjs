/**
 * Domain Logic Specifications & Reference Engines for Urbanización Los Laureles
 * Implements core domain behaviors specified in ORIGINAL_REQUEST.md & PROJECT.md
 */

// ==========================================
// 1. Residential Census Master Data (52 Properties)
// ==========================================
export const RESIDENTIAL_CENSUS = [
  // Manzana A (10 Lotes - Calle Los Rosales)
  { id: 1, block: 'Mz. A', lot: 'Lote 01', code: 'MZ-A-01', street: 'Calle Los Rosales 101', owner: 'Carlos Alberto Mendoza Silva', phone: '+51 987 111 001' },
  { id: 2, block: 'Mz. A', lot: 'Lote 02', code: 'MZ-A-02', street: 'Calle Los Rosales 103', owner: 'María Elena Paredes Ramos', phone: '+51 987 111 002' },
  { id: 3, block: 'Mz. A', lot: 'Lote 03', code: 'MZ-A-03', street: 'Calle Los Rosales 105', owner: 'Jorge Luis Villanueva Castro', phone: '+51 987 111 003' },
  { id: 4, block: 'Mz. A', lot: 'Lote 04', code: 'MZ-A-04', street: 'Calle Los Rosales 107', owner: 'Rosa Lucía Benites Morales', phone: '+51 987 111 004' },
  { id: 5, block: 'Mz. A', lot: 'Lote 05', code: 'MZ-A-05', street: 'Calle Los Rosales 109', owner: 'Héctor Manuel Quintana Torres', phone: '+51 987 111 005' },
  { id: 6, block: 'Mz. A', lot: 'Lote 06', code: 'MZ-A-06', street: 'Calle Los Rosales 111', owner: 'Gladys Patricia Huamán Ortiz', phone: '+51 987 111 006' },
  { id: 7, block: 'Mz. A', lot: 'Lote 07', code: 'MZ-A-07', street: 'Calle Los Rosales 113', owner: 'Víctor Raúl Espinoza Vega', phone: '+51 987 111 007' },
  { id: 8, block: 'Mz. A', lot: 'Lote 08', code: 'MZ-A-08', street: 'Calle Los Rosales 115', owner: 'Carmen Teresa Salazar Bravo', phone: '+51 987 111 008' },
  { id: 9, block: 'Mz. A', lot: 'Lote 09', code: 'MZ-A-09', street: 'Calle Los Rosales 117', owner: 'Eduardo Daniel Rivas Gómez', phone: '+51 987 111 009' },
  { id: 10, block: 'Mz. A', lot: 'Lote 10', code: 'MZ-A-10', street: 'Calle Los Rosales 119', owner: 'Silvia Mónica Cornejo Peña', phone: '+51 987 111 010' },

  // Manzana B (12 Lotes - Calle Los Álamos)
  { id: 11, block: 'Mz. B', lot: 'Lote 01', code: 'MZ-B-01', street: 'Calle Los Álamos 201', owner: 'Fernando José Alarcón Flores', phone: '+51 987 111 011' },
  { id: 12, block: 'Mz. B', lot: 'Lote 02', code: 'MZ-B-02', street: 'Calle Los Álamos 203', owner: 'Ana Cecilia Barrientos Luna', phone: '+51 987 111 012' },
  { id: 13, block: 'Mz. B', lot: 'Lote 03', code: 'MZ-B-03', street: 'Calle Los Álamos 205', owner: 'Manuel Alejandro Cárdenas Gil', phone: '+51 987 111 013' },
  { id: 14, block: 'Mz. B', lot: 'Lote 04', code: 'MZ-B-04', street: 'Calle Los Álamos 207', owner: 'Juana Isabel Domínguez Ríos', phone: '+51 987 111 014' },
  { id: 15, block: 'Mz. B', lot: 'Lote 05', code: 'MZ-B-05', street: 'Calle Los Álamos 209', owner: 'Roberto Carlos Estrada Pinto', phone: '+51 987 111 015' },
  { id: 16, block: 'Mz. B', lot: 'Lote 06', code: 'MZ-B-06', street: 'Calle Los Álamos 211', owner: 'Teresa De Jesús Figueroa Cruz', phone: '+51 987 111 016' },
  { id: 17, block: 'Mz. B', lot: 'Lote 07', code: 'MZ-B-07', street: 'Calle Los Álamos 213', owner: 'Gustavo Adolfo Gálvez León', phone: '+51 987 111 017' },
  { id: 18, block: 'Mz. B', lot: 'Lote 08', code: 'MZ-B-08', street: 'Calle Los Álamos 215', owner: 'Norma Beatriz Hidalgo Vera', phone: '+51 987 111 018' },
  { id: 19, block: 'Mz. B', lot: 'Lote 09', code: 'MZ-B-09', street: 'Calle Los Álamos 217', owner: 'César Augusto Iparraguirre Solís', phone: '+51 987 111 019' },
  { id: 20, block: 'Mz. B', lot: 'Lote 10', code: 'MZ-B-10', street: 'Calle Los Álamos 219', owner: 'Lucía Mercedes Jáuregui Cano', phone: '+51 987 111 020' },
  { id: 21, block: 'Mz. B', lot: 'Lote 11', code: 'MZ-B-11', street: 'Calle Los Álamos 221', owner: 'Oscar Enrique Loyola Montes', phone: '+51 987 111 021' },
  { id: 22, block: 'Mz. B', lot: 'Lote 12', code: 'MZ-B-12', street: 'Calle Los Álamos 223', owner: 'Yolanda Pilar Medina Soto', phone: '+51 987 111 022' },

  // Manzana C (10 Lotes - Jirón Las Acacias)
  { id: 23, block: 'Mz. C', lot: 'Lote 01', code: 'MZ-C-01', street: 'Jirón Las Acacias 301', owner: 'Javier Ignacio Navarro Campos', phone: '+51 987 111 023' },
  { id: 24, block: 'Mz. C', lot: 'Lote 02', code: 'MZ-C-02', street: 'Jirón Las Acacias 303', owner: 'Olga Rocío Ochoa Zambrano', phone: '+51 987 111 024' },
  { id: 25, block: 'Mz. C', lot: 'Lote 03', code: 'MZ-C-03', street: 'Jirón Las Acacias 305', owner: 'Pedro Pablo Quiroz Valdivia', phone: '+51 987 111 025' },
  { id: 26, block: 'Mz. C', lot: 'Lote 04', code: 'MZ-C-04', street: 'Jirón Las Acacias 307', owner: 'Sara Maritza Ramírez Leyva', phone: '+51 987 111 026' },
  { id: 27, block: 'Mz. C', lot: 'Lote 05', code: 'MZ-C-05', street: 'Jirón Las Acacias 309', owner: 'Raúl Enrique Salinas Miranda', phone: '+51 987 111 027' },
  { id: 28, block: 'Mz. C', lot: 'Lote 06', code: 'MZ-C-06', street: 'Jirón Las Acacias 311', owner: 'Miriam Esther Toledo Bustos', phone: '+51 987 111 028' },
  { id: 29, block: 'Mz. C', lot: 'Lote 07', code: 'MZ-C-07', street: 'Jirón Las Acacias 313', owner: 'Alfredo Martín Ugarte Ponce', phone: '+51 987 111 029' },
  { id: 30, block: 'Mz. C', lot: 'Lote 08', code: 'MZ-C-08', street: 'Jirón Las Acacias 315', owner: 'Delia Esperanza Vargas Prado', phone: '+51 987 111 030' },
  { id: 31, block: 'Mz. C', lot: 'Lote 09', code: 'MZ-C-09', street: 'Jirón Las Acacias 317', owner: 'Hugo Hernán Wong Carranza', phone: '+51 987 111 031' },
  { id: 32, block: 'Mz. C', lot: 'Lote 10', code: 'MZ-C-10', street: 'Jirón Las Acacias 319', owner: 'Beatriz Aurora Yáñez Chávez', phone: '+51 987 111 032' },

  // Manzana D (10 Lotes - Pasaje Los Cipreses)
  { id: 33, block: 'Mz. D', lot: 'Lote 01', code: 'MZ-D-01', street: 'Pasaje Los Cipreses 401', owner: 'Gonzalo Andrés Zapata Robles', phone: '+51 987 111 033' },
  { id: 34, block: 'Mz. D', lot: 'Lote 02', code: 'MZ-D-02', street: 'Pasaje Los Cipreses 403', owner: 'Adriana Jimena Acosta Bellido', phone: '+51 987 111 034' },
  { id: 35, block: 'Mz. D', lot: 'Lote 03', code: 'MZ-D-03', street: 'Pasaje Los Cipreses 405', owner: 'Emilio Tomás Bravo Calderón', phone: '+51 987 111 035' },
  { id: 36, block: 'Mz. D', lot: 'Lote 04', code: 'MZ-D-04', street: 'Pasaje Los Cipreses 407', owner: 'Clara Isabel Castañeda Dávila', phone: '+51 987 111 036' },
  { id: 37, block: 'Mz. D', lot: 'Lote 05', code: 'MZ-D-05', street: 'Pasaje Los Cipreses 409', owner: 'David Esteban Fuentes Fuentes', phone: '+51 987 111 037' },
  { id: 38, block: 'Mz. D', lot: 'Lote 06', code: 'MZ-D-06', street: 'Pasaje Los Cipreses 411', owner: 'Guillermo Felipe Guerra Lazo', phone: '+51 987 111 038' },
  { id: 39, block: 'Mz. D', lot: 'Lote 07', code: 'MZ-D-07', street: 'Pasaje Los Cipreses 413', owner: 'Helena Marcela Lozano Meza', phone: '+51 987 111 039' },
  { id: 40, block: 'Mz. D', lot: 'Lote 08', code: 'MZ-D-08', street: 'Pasaje Los Cipreses 415', owner: 'Julio César Naranjo Ojeda', phone: '+51 987 111 040' },
  { id: 41, block: 'Mz. D', lot: 'Lote 09', code: 'MZ-D-09', street: 'Pasaje Los Cipreses 417', owner: 'Karina Paola Pizarro Quintana', phone: '+51 987 111 041' },
  { id: 42, block: 'Mz. D', lot: 'Lote 10', code: 'MZ-D-10', street: 'Pasaje Los Cipreses 419', owner: 'Leonardo Favio Reátegui Saavedra', phone: '+51 987 111 042' },

  // Manzana E (10 Lotes - Avenida Los Laureles Principal)
  { id: 43, block: 'Mz. E', lot: 'Lote 01', code: 'MZ-E-01', street: 'Av. Los Laureles 501', owner: 'Marcos Antonio Tejada Urbina', phone: '+51 987 111 043' },
  { id: 44, block: 'Mz. E', lot: 'Lote 02', code: 'MZ-E-02', street: 'Av. Los Laureles 503', owner: 'Nelly Violeta Valera Vivanco', phone: '+51 987 111 044' },
  { id: 45, block: 'Mz. E', lot: 'Lote 03', code: 'MZ-E-03', street: 'Av. Los Laureles 505', owner: 'Walter Oswaldo Zamora Arce', phone: '+51 987 111 045' },
  { id: 46, block: 'Mz. E', lot: 'Lote 04', code: 'MZ-E-04', street: 'Av. Los Laureles 507', owner: 'Alicia Consuelo Cabrera Díaz', phone: '+51 987 111 046' },
  { id: 47, block: 'Mz. E', lot: 'Lote 05', code: 'MZ-E-05', street: 'Av. Los Laureles 509', owner: 'Bernardo José Córdova Erazo', phone: '+51 987 111 047' },
  { id: 48, block: 'Mz. E', lot: 'Lote 06', code: 'MZ-E-06', street: 'Av. Los Laureles 511', owner: 'Diana Carolina Falcón Garay', phone: '+51 987 111 048' },
  { id: 49, block: 'Mz. E', lot: 'Lote 07', code: 'MZ-E-07', street: 'Av. Los Laureles 513', owner: 'Esteban Daniel Guzmán Heredia', phone: '+51 987 111 049' },
  { id: 50, block: 'Mz. E', lot: 'Lote 08', code: 'MZ-E-08', street: 'Av. Los Laureles 515', owner: 'Flor De María Iriarte Jáuregui', phone: '+51 987 111 050' },
  { id: 51, block: 'Mz. E', lot: 'Lote 09', code: 'MZ-E-09', street: 'Av. Los Laureles 517', owner: 'Gerardo Alfonso Jurado Luque', phone: '+51 987 111 051' },
  { id: 52, block: 'Mz. E', lot: 'Lote 10', code: 'MZ-E-10', street: 'Av. Los Laureles 519', owner: 'Hilda Noemí Márquez Noriega', phone: '+51 987 111 052' }
];

export const TOTAL_CENSUS_PROPERTIES = RESIDENTIAL_CENSUS.length; // 52

// ==========================================
// 2. Emergency Contacts Directory Specification (R1)
// ==========================================
export const EMERGENCY_CONTACTS = [
  { id: 'porteria', name: 'Portería Principal (Garita 1)', phone: '+51 987 654 321', type: 'call_and_whatsapp', protocol: 'tel:+51987654321' },
  { id: 'vigilancia', name: 'Central de Vigilancia 24/7', phone: '(01) 456-7890', type: 'call', protocol: 'tel:014567890' },
  { id: 'administracion', name: 'Administración / Junta Directiva', phone: '+51 999 888 777', type: 'whatsapp', protocol: 'https://wa.me/51999888777' },
  { id: 'policia', name: 'Policía Nacional (Comisaría / Serenazgo)', phone: '105', type: 'call', protocol: 'tel:105' },
  { id: 'bomberos', name: 'Bomberos Voluntarios', phone: '116', type: 'call', protocol: 'tel:116' },
  { id: 'samu', name: 'SAMU / Emergencias Médicas', phone: '106', type: 'call', protocol: 'tel:106' }
];

// ==========================================
// 3. Taxonomies & Enums
// ==========================================
export const ANNOUNCEMENT_CATEGORIES = [
  'Urgente / Alertas',
  'Mantenimiento',
  'Convocatorias de Asamblea',
  'Normas de Convivencia',
  'Finanzas / Cuotas'
];

export const ANNOUNCEMENT_AUDIENCES = [
  'General',
  'Solo Propietarios',
  'Solo Inquilinos'
];

export const MARKETPLACE_CATEGORIES = [
  'Gastronomía / Comida',
  'Vestimenta / Ropa',
  'Servicios Técnicos',
  'Gasfitería / Electricidad',
  'Belleza / Cuidado Personal',
  'Otros'
];

export const RESIDENT_ROLES = ['Propietario', 'Inquilino'];

// ==========================================
// 4. WhatsApp Direct Link Generator (R3)
// ==========================================
/**
 * Sanitizes phone numbers to standard E.164 without symbols (e.g. 51XXXXXXXXX).
 * Handles Peruvian mobile numbers (+51, spaces, hyphens, parentheses),
 * prepending 51 to 9-digit Peruvian numbers starting with 9.
 */
export function sanitizePhone(phone) {
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
 * Sanitizes phone number and builds structured wa.me direct chat link.
 * Handles 9-digit Peruvian mobile numbers, existing country codes, and custom templates.
 */
export function generateWhatsAppLink(
  phone,
  title = '',
  entrepreneurName = '',
  customTemplate = null
) {
  const cleanPhone = sanitizePhone(phone);
  const defaultTemplate = `¡Hola ${entrepreneurName}! Vi tu emprendimiento "${title}" en el Mercado Laureles. Quisiera consultar sobre tus productos y servicios.`;

  let message = defaultTemplate;
  if (customTemplate && typeof customTemplate === 'string' && customTemplate.trim().length > 0) {
    message = customTemplate
      .replace(/\{title\}/g, title)
      .replace(/\{name\}/g, entrepreneurName)
      .replace(/\{entrepreneur_name\}/g, entrepreneurName);
  }

  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
}

// ==========================================
// 5. Quorum Progress Calculation Engine (R2)
// ==========================================
/**
 * Computes reading progress percentage with boundary clamping and status tiers.
 */
export function calculateQuorumProgress(confirmedCount, totalProperties = TOTAL_CENSUS_PROPERTIES) {
  if (typeof confirmedCount !== 'number' || isNaN(confirmedCount) || confirmedCount < 0) {
    confirmedCount = 0;
  }
  if (typeof totalProperties !== 'number' || isNaN(totalProperties) || totalProperties <= 0) {
    return {
      confirmedCount: 0,
      totalProperties: 0,
      percentage: 0.0,
      tier: 'low',
      tierLabel: 'Sin datos de padrón'
    };
  }

  // Clamped count
  const validConfirmed = Math.min(Math.max(0, confirmedCount), totalProperties);
  const rawPercentage = (validConfirmed / totalProperties) * 100.0;
  const percentage = Math.round(rawPercentage * 10) / 10; // 1 decimal place

  let tier = 'low';
  let tierLabel = 'Bajo quórum';

  if (percentage >= 70.0) {
    tier = 'high';
    tierLabel = 'Quórum reglamentario alcanzado';
  } else if (percentage >= 35.0) {
    tier = 'moderate';
    tierLabel = 'En proceso de notificación';
  }

  return {
    confirmedCount: validConfirmed,
    totalProperties,
    percentage,
    tier,
    tierLabel
  };
}

// ==========================================
// 6. WhatsApp Reminder Generator (R4)
// ==========================================
/**
 * Auto-generates structured copyable WhatsApp reminder text
 * with missing houses grouped compactly by Manzana.
 */
export function generateWhatsAppReminderMessage(
  announcementTitle,
  announcementUrl,
  missingOrTotal,
  arg4
) {
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

    const groupedByBlock = {};
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

  const messageText =
`📢 *URBANIZACIÓN LOS LAURELES — COMUNICADO OFICIAL*
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
      includes(str) {
        return messageText.includes(str);
      },
      indexOf(str) {
        return messageText.indexOf(str);
      },
      toString() {
        return messageText;
      }
    };
  }

  return messageText;
}

// ==========================================
// 7. CSV Attendance Report Generator with UTF-8 BOM (R4)
// ==========================================
/**
 * Generates official attendance / read confirmation CSV with UTF-8 BOM (\uFEFF)
 * for seamless compatibility with Microsoft Excel on Windows.
 */
export function generateAttendanceCsv(arg1, arg2, arg3) {
  let records = [];
  let options = {};

  if (typeof arg1 === 'string') {
    records = Array.isArray(arg2) ? arg2 : [];
    options = arg3 || {};
  } else if (Array.isArray(arg1)) {
    records = arg1;
    options = arg2 || {};
  }

  const { delimiter = ';', mode = 'full_census' } = options;
  const BOM = '\uFEFF'; // UTF-8 Byte Order Mark

  // Spanish headers required for assembly records
  const headers = [
    'Manzana',
    'Lote',
    'Codigo_Inmueble',
    'Direccion',
    'Residente',
    'Rol',
    'Fecha_Hora',
    'Estado'
  ];

  const lines = [headers.join(delimiter)];

  for (const rec of records) {
    if (mode === 'confirmed_only' && rec.status !== 'CONFIRMADO') {
      continue;
    }

    const row = [
      escapeCsvField(rec.block || rec.manzana || ''),
      escapeCsvField(rec.lot || rec.lote || ''),
      escapeCsvField(rec.code || ''),
      escapeCsvField(rec.street || rec.street_address || rec.address || ''),
      escapeCsvField(rec.resident_name || rec.residentName || rec.primary_owner_name || rec.owner_name || 'N/A'),
      escapeCsvField(rec.role || 'N/A'),
      escapeCsvField(rec.confirmed_at || rec.confirmedAt || 'Pendiente'),
      escapeCsvField(rec.status || (rec.confirmed_at || rec.confirmedAt ? 'CONFIRMADO' : 'PENDIENTE'))
    ];
    lines.push(row.join(delimiter));
  }

  return BOM + lines.join('\r\n');
}

function escapeCsvField(val) {
  const str = String(val ?? '');
  if (str.includes(';') || str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

// ==========================================
// 8. Validation Rules & Constraints
// ==========================================
export function validateReadConfirmationPayload(payload, existingConfirmations = [], properties = RESIDENTIAL_CENSUS) {
  const errors = [];
  const propertyId = Number(payload?.propertyId ?? payload?.property_id);
  const residentName = String(payload?.residentName ?? payload?.resident_name ?? '').trim();
  const role = String(payload?.role ?? payload?.resident_role ?? '').trim();

  // Property ID check
  if (!propertyId || isNaN(propertyId)) {
    errors.push('El ID de inmueble es obligatorio y debe ser numérico.');
  } else {
    const propExists = properties.some(p => p.id === propertyId);
    if (!propExists) {
      errors.push(`El inmueble con ID ${propertyId} no existe en el padrón oficial.`);
    }
  }

  // Resident Name check (min 3 chars, max 150)
  if (!residentName || residentName.length < 3) {
    errors.push('El nombre del residente debe tener al menos 3 caracteres.');
  } else if (residentName.length > 150) {
    errors.push('El nombre del residente no puede exceder 150 caracteres.');
  }

  // Role check
  if (!RESIDENT_ROLES.includes(role)) {
    errors.push(`El rol debe ser 'Propietario' o 'Inquilino'. Recibido: '${role}'`);
  }

  // Duplicate check on same property
  if (propertyId && !isNaN(propertyId)) {
    const isDuplicate = existingConfirmations.some(c => Number(c.propertyId ?? c.property_id) === propertyId);
    if (isDuplicate) {
      return {
        isValid: false,
        isDuplicate: true,
        errors: ['Este inmueble ya registró su confirmación de lectura previamente.']
      };
    }
  }

  return {
    isValid: errors.length === 0,
    isDuplicate: false,
    errors
  };
}

export function validateMarketplaceSubmissionPayload(payload) {
  const errors = [];
  const title = String(payload?.title ?? '').trim();
  const category = String(payload?.category ?? '').trim();
  const description = String(payload?.description ?? '').trim();
  const entrepreneurName = String(payload?.entrepreneurName ?? payload?.entrepreneur_name ?? '').trim();
  const property = String(payload?.propertyAddress ?? payload?.property ?? '').trim();
  const phone = String(payload?.phone ?? '').trim();
  const schedule = String(payload?.scheduleHours ?? payload?.schedule ?? '').trim();

  if (!title || title.length < 3 || title.length > 80) {
    errors.push('El título comercial debe tener entre 3 y 80 caracteres.');
  }
  if (!category || !MARKETPLACE_CATEGORIES.includes(category)) {
    errors.push(`Categoría inválida. Debe ser una de: ${MARKETPLACE_CATEGORIES.join(', ')}`);
  }
  if (!description || description.length < 15 || description.length > 500) {
    errors.push('La descripción debe tener entre 15 y 500 caracteres.');
  }
  if (!entrepreneurName || entrepreneurName.length < 3 || entrepreneurName.length > 80) {
    errors.push('El nombre del emprendedor debe tener entre 3 y 80 caracteres.');
  }
  if (!property || property.length < 3) {
    errors.push('La dirección / inmueble en la urbanización es obligatoria.');
  }
  const cleanPhone = phone.replace(/\D/g, '');
  if (!cleanPhone || cleanPhone.length < 9) {
    errors.push('El número de WhatsApp debe contener al menos 9 dígitos.');
  }
  if (!schedule || schedule.length < 5) {
    errors.push('El horario de atención es obligatorio (mínimo 5 caracteres).');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

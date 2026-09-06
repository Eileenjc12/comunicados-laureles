# Technical Specification & Architectural Blueprint: Mercado Laureles (R3) & Panel de Administración /admin (R4)

**Project:** Urbanización Los Laureles — Portal Comunitario y Web Residencial  
**Author:** explorer_survey_3 (Marketplace and Admin Explorer)  
**Date:** 2026-09-04  
**Framework Target:** Astro (SSR with Node adapter) + Node.js v24 native `node:sqlite`  
**Reference Document:** `d:/COMUNICADOS LAURELES/ORIGINAL_REQUEST.md`

---

## 1. Executive Summary & Problem Scope

This blueprint defines the architecture, data schemas, API routes, security controls, and user experience for two core modules of the Urbanización Los Laureles platform:
1. **R3 — Directorio de Emprendimientos y Servicios Vecinales ("Mercado Laureles")**: A mobile-optimized community commerce directory where residents can discover neighborhood services (food, clothing, repairs, beauty, plumbing, etc.), contact sellers directly via structured WhatsApp links (`https://wa.me/...`), and submit their own business applications via a public vetting form.
2. **R4 — Panel de Administración y Control Centralizado (`/admin`)**: A PIN-secured administrative dashboard enabling the Junta Directiva / Administrators to track real-time read confirmations per property, identify missing houses from the residential census, generate 1-click WhatsApp formatted reminder messages, manage official announcements (CRUD, pin, archive), moderate marketplace listings (1-click approve/reject/edit), and export official attendance/reading confirmation reports in CSV format with UTF-8 BOM for Microsoft Excel.

---

## 2. Shared Data Models & SQLite Schema (Node.js v24 Native `node:sqlite`)

The database utilizes Node.js v24 native `node:sqlite` (zero external C++ dependencies, single-file SQLite database `data/laureles.db`).

### 2.1 Table: `marketplace_listings`
Stores community business listings submitted by residents.

```sql
CREATE TABLE IF NOT EXISTS marketplace_listings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,                           -- e.g. "Pastelería Doña Rosa"
    description TEXT NOT NULL,                     -- Detailed description of products/services
    category TEXT NOT NULL CHECK(category IN (
        'Gastronomía / Comida',
        'Vestimenta / Ropa',
        'Servicios Técnicos',
        'Gasfitería / Electricidad',
        'Belleza / Cuidado Personal',
        'Otros'
    )),
    schedule TEXT NOT NULL,                        -- e.g. "Lun - Sáb: 8:00 AM - 6:00 PM"
    entrepreneur_name TEXT NOT NULL,               -- Neighbor full name
    property TEXT NOT NULL,                        -- Property address, e.g. "Mz A Lt 3"
    phone TEXT NOT NULL,                           -- 9-digit mobile phone or international
    whatsapp_message_template TEXT,                -- Custom prefilled message template
    image_url TEXT DEFAULT '/images/marketplace/default-business.svg',
    status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending', 'approved', 'rejected')),
    rejection_reason TEXT,                         -- Reason provided by admin if rejected
    is_featured INTEGER NOT NULL DEFAULT 0,        -- 1 = highlighted at top, 0 = regular
    created_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime'))
);

CREATE INDEX IF NOT EXISTS idx_marketplace_status ON marketplace_listings(status);
CREATE INDEX IF NOT EXISTS idx_marketplace_category ON marketplace_listings(category);
```

### 2.2 Table: `announcements` (Admin CRUD Scope)
Stores official administrative communications.

```sql
CREATE TABLE IF NOT EXISTS announcements (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    content TEXT NOT NULL,                         -- Markdown or sanitized HTML
    category TEXT NOT NULL CHECK(category IN (
        'Urgente / Alertas',
        'Mantenimiento',
        'Convocatorias de Asamblea',
        'Normas de Convivencia',
        'Finanzas / Cuotas'
    )),
    audience TEXT NOT NULL DEFAULT 'General' CHECK(audience IN (
        'General',
        'Solo Propietarios',
        'Solo Inquilinos'
    )),
    is_pinned INTEGER NOT NULL DEFAULT 0,          -- 1 = pinned at the top
    is_archived INTEGER NOT NULL DEFAULT 0,        -- 1 = archived/hidden from active board
    deadline TEXT,                                 -- Optional deadline (ISO8601 date string)
    author TEXT NOT NULL DEFAULT 'Junta Directiva',
    views_count INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime'))
);

CREATE INDEX IF NOT EXISTS idx_announcements_slug ON announcements(slug);
CREATE INDEX IF NOT EXISTS idx_announcements_pinned ON announcements(is_pinned, is_archived, created_at DESC);
```

### 2.3 Table: `census_properties` (Residential Census Master)
Preloaded census containing all official houses and blocks in Urbanización Los Laureles.

```sql
CREATE TABLE IF NOT EXISTS census_properties (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    block TEXT NOT NULL,                           -- e.g. "Mz A", "Mz B", "Mz C", "Mz D"
    lot TEXT NOT NULL,                             -- e.g. "Lt 1", "Lt 2", ..., "Lt 25"
    property_code TEXT UNIQUE NOT NULL,            -- Normalized unique code, e.g. "MZ-A-LT-01"
    display_name TEXT NOT NULL,                    -- Clean label, e.g. "Mz A Lt 1"
    owner_name TEXT,                               -- Registered owner name (for admin reference)
    is_active INTEGER NOT NULL DEFAULT 1
);

CREATE INDEX IF NOT EXISTS idx_census_property_code ON census_properties(property_code);
CREATE INDEX IF NOT EXISTS idx_census_block ON census_properties(block, lot);
```

### 2.4 Table: `announcement_reads` (Read Confirmations)
Stores neighbor confirmations linked to announcements and census properties.

```sql
CREATE TABLE IF NOT EXISTS announcement_reads (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    announcement_id INTEGER NOT NULL REFERENCES announcements(id) ON DELETE CASCADE,
    property_code TEXT NOT NULL REFERENCES census_properties(property_code),
    resident_name TEXT NOT NULL,
    resident_role TEXT NOT NULL CHECK(resident_role IN ('Propietario', 'Inquilino')),
    confirmed_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime')),
    ip_address TEXT,
    user_agent TEXT,
    UNIQUE(announcement_id, property_code)         -- Strictly prevents duplicate confirmations
);

CREATE INDEX IF NOT EXISTS idx_reads_announcement ON announcement_reads(announcement_id);
CREATE INDEX IF NOT EXISTS idx_reads_property ON announcement_reads(property_code);
```

### 2.5 Table: `admin_sessions` (Optional Stateful Token Storage)
Stores active administrative sessions when using token-based session auth.

```sql
CREATE TABLE IF NOT EXISTS admin_sessions (
    id TEXT PRIMARY KEY,                           -- Cryptographic token (32-byte hex)
    admin_identifier TEXT NOT NULL DEFAULT 'Administrador',
    created_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime')),
    expires_at TEXT NOT NULL                       -- ISO8601 string or epoch ms
);

CREATE INDEX IF NOT EXISTS idx_admin_sessions_expires ON admin_sessions(expires_at);
```

---

## 3. Requirement R3: Directorio "Mercado Laureles"

### 3.1 UX & Visual Presentation
- **Route:** `/mercado`
- **Mobile-First Priority:** The layout must be 100% responsive. Over 85% of traffic originates from WhatsApp group links.
- **Top Header & Description:**
  - Friendly community greeting: *"Mercado Laureles: Apoya y contrata el talento de nuestros vecinos"*.
  - Call to Action button: `[+ Postula tu Emprendimiento]` linking directly to `/mercado/postular` (or opening an accessible modal).
- **Category Filter Bar (Horizontal Scroll on Mobile):**
  - Interactive chip filters:
    1. `Todos` (Default)
    2. `Gastronomía / Comida` 🍲
    3. `Vestimenta / Ropa` 👗
    4. `Servicios Técnicos` 💻
    5. `Gasfitería / Electricidad` 🔧
    6. `Belleza / Cuidado Personal` 💇
    7. `Otros` 📦
  - Instant client-side filtering without full page reloads, using standard HTML/JS URL query parameter synchronization (`?categoria=gastronomia`).
- **Listing Cards Specification:**
  - **Header:** Image or high-contrast Category SVG icon + Category Badge.
  - **Title:** Business Name (e.g., *"Pastelería Casera Las Delicias"*).
  - **Neighbor & Address Badge:** *"Emprendedor(a): María Morales — Mz B Lt 8"*. Builds trust among neighbors.
  - **Description:** 2-3 lines of text describing specialties, delivery inside the urbanization, etc.
  - **Schedule Badge:** 🕒 *"Lun a Sáb 9:00 - 19:00"*.
  - **Primary Action (Direct WhatsApp Button):**
    - High-visibility green WhatsApp button with SVG WhatsApp logo.
    - Text: *"Pedir / Consultar por WhatsApp"*.
    - Target: `_blank` with `rel="noopener noreferrer"`.
    - Generates direct link via the WhatsApp helper function.

### 3.2 Direct WhatsApp Link Generation Engine
- **Specification:**
  `https://wa.me/<sanitized_phone>?text=<url_encoded_message>`
- **Sanitization Rules:**
  1. Remove all non-digit characters (spaces, dashes, parentheses, plus sign).
  2. Detect Peruvian mobile numbers (9 digits starting with `9`): Prepend Peru country code `51`.
  3. If already formatted with `51` (11 digits): Preserve as-is.
  4. If international: Retain valid country code digits.
- **Message Templating:**
  If the business owner defined a custom `whatsapp_message_template`, use it; otherwise use the default institutional template:
  `"¡Hola {entrepreneur_name}! Vi tu emprendimiento '{title}' en el Mercado Laureles. Quisiera realizar una consulta / pedido."`
- **TypeScript Implementation Reference:**
```typescript
export function generateWhatsAppLink(
  phone: string,
  title: string,
  entrepreneurName: string,
  customTemplate?: string | null
): string {
  // Strip non-numeric characters
  let cleanPhone = phone.replace(/\D/g, '');
  
  // Standardize 9-digit Peruvian mobiles to international format 51XXXXXXXXX
  if (cleanPhone.length === 9 && cleanPhone.startsWith('9')) {
    cleanPhone = `51${cleanPhone}`;
  }

  const defaultMessage = `¡Hola ${entrepreneurName}! Vi tu emprendimiento "${title}" en el Mercado Laureles. Quisiera consultar sobre tus productos y servicios.`;
  const message = (customTemplate && customTemplate.trim().length > 0)
    ? customTemplate.replace('{title}', title).replace('{name}', entrepreneurName)
    : defaultMessage;

  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
}
```

### 3.3 Public Submission Form for Neighbors (`/mercado/postular`)
- **Accessibility:** Open to all neighbors; does NOT require admin login.
- **Form Fields & Validation Rules:**

| Field Name | Type | Validation Rules | Error Message (ES) |
|---|---|---|---|
| `title` | Text | Required, 3 - 80 chars | "Ingresa el nombre comercial de tu negocio (3-80 caracteres)." |
| `category` | Select | Required, must match enum | "Selecciona un rubro válido de la lista." |
| `description` | Textarea | Required, 15 - 500 chars | "Describe tus productos o servicios (mínimo 15 caracteres)." |
| `entrepreneur_name` | Text | Required, 3 - 80 chars | "Indica tu nombre y apellido completo." |
| `property` | Select/Text | Required, validated against census | "Selecciona tu Manzana y Lote de la Urbanización Los Laureles." |
| `phone` | Tel | Required, 9 digits | "Ingresa un número de celular de WhatsApp válido (9 dígitos)." |
| `schedule` | Text | Required, 5 - 100 chars | "Indica tus días y horas de atención (ej. Lun a Sáb 9am-6pm)." |
| `whatsapp_message_template` | Text | Optional, max 200 chars | "El mensaje prellenado no debe superar los 200 caracteres." |
| `image_url` | Text/File | Optional, valid URL or file | "Formato de imagen no válido." |
| `honeypot_field` | Hidden | Must be empty (anti-bot) | Silent drop if filled |

- **State on Submission:**
  - Always created with `status = 'pending'`.
  - Stored in SQLite table `marketplace_listings`.
- **User Feedback & Confirmation:**
  - Upon submission, display an encouraging success modal or alert:
    > **¡Postulación Recibida con Éxito!**  
    > *Muchas gracias vecino(a) {entrepreneur_name}. Tu emprendimiento "{title}" ha sido enviado a la Junta Directiva de la Urbanización Los Laureles. Una vez verificado que resides en la comunidad ({property}), tu negocio será publicado en el Mercado Laureles.*
  - Return button: *"Volver al Directorio"*.

---

## 4. Requirement R4: Panel de Administración y Control Centralizado (`/admin`)

### 4.1 Security & Authentication Architecture
- **Zero-Setup Complexity:** Avoids external OAuth, third-party databases, or complex identity providers. Uses a secure, native PIN/Passcode mechanism.
- **Configuration:**
  - Environment variable: `ADMIN_PIN` (e.g., `ADMIN_PIN=laureles2026` or 6-digit numeric PIN).
  - Default fallback in local development: `123456`.
- **Session Protection Mechanism:**
  - **Token Generation:** Cryptographically random 256-bit token generated via Node.js native `node:crypto.randomBytes(32).toString('hex')`.
  - **Storage:** Stored in `admin_sessions` table with expiration timestamp (e.g., 24 hours).
  - **Cookie Delivery:**
    - Cookie Name: `laureles_admin_session`
    - Flags: `HttpOnly; Path=/; SameSite=Strict; Max-Age=86400` (`Secure` enabled when `NODE_ENV === 'production'`).
- **Astro Middleware Guard (`src/middleware.ts`):**
  - Automatically intercepts all requests matching:
    - `/admin` and `/admin/*` (except `/admin/login`)
    - `/api/admin/*`
  - Validates session token against SQLite `admin_sessions` and checks `expires_at > datetime('now', 'localtime')`.
  - If valid: Continues to route handler.
  - If invalid or missing:
    - For HTML routes: Redirects (`302`) to `/admin/login?redirect=${encodeURIComponent(pathname)}`.
    - For API routes: Returns HTTP `401 Unauthorized` with JSON `{ error: "No autorizado. Sesión inválida o expirada." }`.
- **Brute-Force Defense:**
  - In-memory or SQLite rate-limiting: Maximum 5 failed PIN attempts per IP within 15 minutes.
  - 6th attempt triggers HTTP 429 *"Demasiados intentos fallidos. Por favor espera 15 minutos."*

### 4.2 Dashboard Navigation & Visual Structure
The `/admin` panel is structured into four main operational views:
1. **Métricas y Control de Lecturas (`/admin` or `/admin/lecturas`):** Real-time percentage coverage, confirmed houses with resident name and role, and pending houses list.
2. **Gestor de Comunicados Oficiales (`/admin/comunicados`):** Full CRUD, pinning, and archiving of announcements.
3. **Gestor de Mercado Laureles (`/admin/mercado`):** Moderation queue (Pending, Approved, Rejected) with 1-click actions.
4. **Padrón Residencial (`/admin/padron`):** Directory of urbanization properties and stats.

---

### 4.3 Read Tracking & Census Coverage Engine
For every official announcement:
- **Total Residential Properties:** Count of active houses from `census_properties` (e.g., `TOTAL_PROPERTIES = 120`).
- **Confirmed Properties Count:** Distinct `property_code` entries in `announcement_reads` for the given `announcement_id`.
- **Coverage Percentage Formula:**
  $$\text{Cobertura (\%)} = \left( \frac{\text{Inmuebles Confirmados}}{\text{Total Inmuebles en Padrón}} \right) \times 100$$
  Rounded to 1 decimal place.
- **Visual Progress Bar:**
  - Color thresholds:
    - `< 40%`: Amber / Warning (`bg-amber-500`)
    - `40% - 79%`: Light Green / Progressing (`bg-lime-500`)
    - `>= 80%`: Vibrant Emerald / Quorum Achieved (`bg-emerald-600`)
- **Two Distinct Audit Lists:**
  1. **Inmuebles Confirmados (Tabla Filtrable):**
     - Columns: Manzana | Lote | Residente | Rol (Propietario / Inquilino) | Fecha y Hora de Confirmación.
     - Sorted by most recent confirmation first.
  2. **Inmuebles Pendientes (Faltan por Leer):**
     - Computed via SQL `LEFT JOIN` or `WHERE property_code NOT IN`:
       ```sql
       SELECT cp.block, cp.lot, cp.display_name, cp.property_code
       FROM census_properties cp
       WHERE cp.is_active = 1
         AND cp.property_code NOT IN (
           SELECT ar.property_code 
           FROM announcement_reads ar 
           WHERE ar.announcement_id = ?
         )
       ORDER BY cp.block ASC, CAST(SUBSTR(cp.lot, 4) AS INTEGER) ASC;
       ```
     - Grouped visually by Manzana (e.g., **Mz A:** Lt 2, Lt 5, Lt 9 | **Mz B:** Lt 1, Lt 4).

---

### 4.4 1-Click WhatsApp Reminder Tool (The Community WhatsApp Bridge)
Administrative boards communicate heavily through neighborhood WhatsApp groups. The tool eliminates manual transcription by dynamically generating structured, copyable text.

#### Message Structure & Formatting Rules:
1. Header with urbanization branding and announcement title.
2. Direct link to the public announcement (`https://<domain>/comunicados/<slug>`).
3. Total count and percentage of missing confirmations.
4. Clean, compact list of missing houses grouped by Manzana.
5. Polite call to action instructing residents to confirm their reading.

#### Formatting Algorithm:
```typescript
export function generateWhatsAppReminderMessage(
  announcementTitle: string,
  announcementUrl: string,
  totalCensus: number,
  missingProperties: Array<{ block: string; lot: string; display_name: string }>
): string {
  const missingCount = missingProperties.length;
  const confirmedCount = totalCensus - missingCount;
  const coveragePercent = Math.round((confirmedCount / totalCensus) * 100);

  // Group missing lots by Manzana (Block)
  const groupedByBlock: Record<string, string[]> = {};
  for (const item of missingProperties) {
    if (!groupedByBlock[item.block]) {
      groupedByBlock[item.block] = [];
    }
    groupedByBlock[item.block].push(item.lot);
  }

  let formattedHouses = '';
  for (const [block, lots] of Object.entries(groupedByBlock)) {
    formattedHouses += `• *${block}:* ${lots.join(', ')}\n`;
  }

  const message = 
`📢 *URBANIZACIÓN LOS LAURELES — COMUNICADO OFICIAL*
📋 *Asunto:* ${announcementTitle}
🔗 *Leer y confirmar aquí:* ${announcementUrl}

Estimados vecinos, la Junta Directiva solicita a los propietarios e inquilinos revisar este comunicado importante para la convivencia y seguridad de nuestra comunidad.

📊 *Avance de confirmación:* ${confirmedCount}/${totalCensus} inmuebles (${coveragePercent}%)
⏳ *Inmuebles pendientes por confirmar (${missingCount}):*
${formattedHouses}
👉 Por favor ingrese al enlace, lea el comunicado y registre su Manzana y Lote en el botón de confirmación. ¡Agradecemos su valiosa colaboración!`;

  return message;
}
```

#### UI Implementation:
- **Button 1:** `[📋 Copiar Recordatorio]`
  - Invokes `navigator.clipboard.writeText(message)`.
  - Shows instant visual feedback: *"¡Texto copiado al portapapeles! Listo para pegar en el grupo de WhatsApp."*
- **Button 2:** `[💬 Abrir en WhatsApp]`
  - Launches `https://wa.me/?text=${encodeURIComponent(message)}`.
  - Opens WhatsApp Web or native app with pre-filled text.

---

### 4.5 Official Announcements CRUD Engine
Allows administrators to manage communications with full lifecycle control:

1. **Create Announcement (`POST /api/admin/announcements`):**
   - Title, Category, Target Audience (`General`, `Solo Propietarios`, `Solo Inquilinos`).
   - Content: Multi-paragraph text or Markdown with bold/bullet support.
   - `is_pinned`: Checkbox to pin to the top of the wall.
   - `deadline`: Optional date/time picker (e.g. for assembly voting or quota payments).
   - Generates URL-friendly slug automatically: `titulo-del-comunicado-yyyy-mm-dd`.
2. **Edit Announcement (`PUT /api/admin/announcements/[id]`):**
   - Updates title, category, audience, content, pinned state, or deadline.
   - Tracks `updated_at`.
3. **Pin / Unpin Toggle (`PATCH /api/admin/announcements/[id]/pin`):**
   - 1-click toggle button.
   - Pinned announcements display prominent gold/amber pin badge on the public portal.
4. **Archive / Unarchive Toggle (`PATCH /api/admin/announcements/[id]/archive`):**
   - 1-click toggle. Archived announcements are removed from the active resident board and stored in `/comunicados/archivo`.
5. **Delete (`DELETE /api/admin/announcements/[id]`):**
   - Soft delete or hard delete with cascade deletion of related `announcement_reads`.

---

### 4.6 Marketplace Management Engine (`/admin/mercado`)
Moderation dashboard for neighborhood listings:
- **Tabbed Interface with Badges:**
  - **Pendientes:** Shows listings awaiting review (with bold notification badge counter, e.g., `(3)`).
  - **Aprobados:** Active listings currently visible on `/mercado`.
  - **Rechazados:** Inactive/declined listings with stored rejection reasons.
- **Listing Action Bar:**
  - **1-Click Aprobar (`PATCH /api/admin/marketplace/[id]/approve`):** Sets `status = 'approved'`. Instantly reflects on public `/mercado`.
  - **1-Click Rechazar (`PATCH /api/admin/marketplace/[id]/reject`):** Opens quick modal to input optional reason (e.g., *"Inmueble no coincide con el padrón"*), sets `status = 'rejected'`.
  - **Editar (`PUT /api/admin/marketplace/[id]`):** Modal to modify phone number, business description, schedule, or category if requested by neighbor.
  - **Destacar / Pin (`PATCH /api/admin/marketplace/[id]/feature`):** Toggles `is_featured = 1` to showcase featured weekend specials or community services.
  - **Eliminar (`DELETE /api/admin/marketplace/[id]`):** Permanently purges listing.

---

### 4.7 CSV Export Engine for Official Assemblies and Records
Formal urbanizations require physical or digital attendance proof for assemblies and legal quorum records.

- **Route:** `GET /api/admin/announcements/[id]/export-csv`
- **Query Parameter Support:**
  - `?mode=confirmed_only`: Exports only confirmed properties.
  - `?mode=full_census` (Default): Exports the full residential census, showing `ESTADO = CONFIRMADO` with resident details and `ESTADO = PENDIENTE` for missing properties.
- **Encoding & Compatibility Requirement:**
  - Must include **UTF-8 Byte Order Mark (`\uFEFF`)** at the start of the CSV file stream so that Microsoft Excel on Windows renders Spanish characters (`á`, `é`, `í`, `ó`, `ú`, `ñ`) properly without garbling.
  - Uses semicolon (`;`) or comma (`,`) delimiter standard for Spanish locale spreadsheet software.
- **CSV Column Schema:**
  1. `Manzana` (e.g. "Mz A")
  2. `Lote` (e.g. "Lt 3")
  3. `Codigo_Inmueble` (e.g. "MZ-A-LT-03")
  4. `Nombre_Residente` (e.g. "Carlos Rodríguez")
  5. `Rol` ("Propietario" / "Inquilino" / "N/A")
  6. `Fecha_Confirmacion` (e.g. "04/09/2026")
  7. `Hora_Confirmacion` (e.g. "19:45:12")
  8. `Estado` ("CONFIRMADO" / "PENDIENTE")
- **HTTP Response Headers:**
  - `Content-Type: text/csv; charset=utf-8`
  - `Content-Disposition: attachment; filename="constancia_lectura_${slug}_${date}.csv"`
  - `Cache-Control: no-cache, no-store, must-revalidate`

---

## 5. Exhaustive REST & Astro API Endpoints Specification

### 5.1 Public Marketplace Endpoints (`/api/marketplace/*`)

| Method | Endpoint | Description | Request Body / Params | Response |
|---|---|---|---|---|
| `GET` | `/api/marketplace` | List approved listings with optional category filter | `?category=Gastronomía / Comida` | `200 OK: { success: true, listings: [...] }` |
| `POST` | `/api/marketplace/submit` | Public neighbor business submission | `{ title, category, description, entrepreneur_name, property, phone, schedule, whatsapp_message_template }` | `201 Created: { success: true, message: "Enviado a revisión...", id: 12 }` |

### 5.2 Public Read Confirmation Endpoints (`/api/reads/*`)

| Method | Endpoint | Description | Request Body / Params | Response |
|---|---|---|---|---|
| `POST` | `/api/reads/confirm` | Resident confirms reading of announcement | `{ announcement_id, property_code, resident_name, resident_role }` | `200 OK: { success: true, coverage_percent: 64.5 }` or `409 Conflict: { error: "Inmueble ya confirmó" }` |
| `GET` | `/api/reads/stats/[announcement_id]` | Get public reading progress bar metrics | `announcement_id` in path | `200 OK: { confirmed: 45, total: 120, percent: 37.5 }` |

### 5.3 Administrative Endpoints (`/api/admin/*`) — Protected by Session Cookie

| Method | Endpoint | Description | Payload / Params | Response |
|---|---|---|---|---|
| `POST` | `/api/admin/login` | Authenticate with PIN and issue session cookie | `{ pin: "laureles2026" }` | `200 OK: { success: true }` + `Set-Cookie: laureles_admin_session=...` |
| `POST` | `/api/admin/logout` | Revoke session and clear cookie | None | `200 OK: { success: true }` + Cleared Cookie |
| `GET` | `/api/admin/metrics` | Global KPI summary for admin dashboard | None | `200 OK: { total_announcements, avg_coverage, pending_listings, total_census }` |
| `POST` | `/api/admin/announcements` | Create new official announcement | `{ title, category, audience, content, is_pinned, deadline }` | `201 Created: { success: true, announcement: {...} }` |
| `PUT` | `/api/admin/announcements/[id]` | Update announcement | Announcement fields | `200 OK: { success: true, announcement: {...} }` |
| `PATCH` | `/api/admin/announcements/[id]/pin` | Toggle pinned state | None | `200 OK: { success: true, is_pinned: 1 }` |
| `PATCH` | `/api/admin/announcements/[id]/archive` | Toggle archived state | None | `200 OK: { success: true, is_archived: 1 }` |
| `DELETE` | `/api/admin/announcements/[id]` | Delete announcement | None | `200 OK: { success: true }` |
| `GET` | `/api/admin/announcements/[id]/reads` | Get confirmed & missing houses for reminder/audit | None | `200 OK: { confirmed: [...], missing: [...] }` |
| `GET` | `/api/admin/announcements/[id]/export-csv` | Download CSV attendance report | `?mode=full_census` | `200 OK: Text CSV stream with UTF-8 BOM` |
| `GET` | `/api/admin/marketplace` | List listings by status (`pending`, `approved`, `rejected`) | `?status=pending` | `200 OK: { listings: [...] }` |
| `PATCH` | `/api/admin/marketplace/[id]/approve` | 1-click approve listing | None | `200 OK: { success: true, status: "approved" }` |
| `PATCH` | `/api/admin/marketplace/[id]/reject` | 1-click reject listing | `{ reason?: string }` | `200 OK: { success: true, status: "rejected" }` |
| `PUT` | `/api/admin/marketplace/[id]` | Edit business listing details | Listing fields | `200 OK: { success: true, listing: {...} }` |
| `DELETE` | `/api/admin/marketplace/[id]` | Delete business listing | None | `200 OK: { success: true }` |

---

## 6. Preloaded Seed Data Blueprint (R5 Alignment)

To enable realistic demonstration and testing out-of-the-box, the following seed data should be preloaded:

### 6.1 Sample Mercado Laureles Listings

```sql
INSERT INTO marketplace_listings (
    title, description, category, schedule, entrepreneur_name, property, phone, whatsapp_message_template, status, is_featured
) VALUES
(
    'Repostería & Tortas Doña Rosa',
    'Tortas personalizadas para cumpleaños, pies de limón, kekes caseros y bocaditos dulces para reuniones. Entregas a domicilio en toda la urbanización.',
    'Gastronomía / Comida',
    'Mar - Dom: 10:00 AM - 8:00 PM',
    'Rosa Paredes',
    'Mz B Lt 14',
    '987112233',
    '¡Hola Doña Rosa! Vi sus deliciosas tortas en Mercado Laureles. Quisiera cotizar una torta para este fin de semana.',
    'approved',
    1
),
(
    'Servicio Técnico & Redes Laureles',
    'Mantenimiento de computadoras, laptops, instalación de repetidores Wi-Fi, cámaras de seguridad y soporte remoto para vecinos.',
    'Servicios Técnicos',
    'Lun - Sáb: 9:00 AM - 7:00 PM',
    'Ing. Carlos Mendoza',
    'Mz D Lt 5',
    '991223344',
    '¡Hola Carlos! Vi tu servicio técnico en Mercado Laureles. Tengo un problema con mi computadora/red y requiero asistencia.',
    'approved',
    0
),
(
    'Gasfitería & Electricidad Don Lucho',
    'Especialista en fugas de agua, bombas de presión, termas, cambio de tableros eléctricos, cableado e iluminación LED. Atención de emergencias vecinales.',
    'Gasfitería / Electricidad',
    'Lun - Dom: 7:00 AM - 9:00 PM (Emergencias 24/7)',
    'Luis Huamán',
    'Mz A Lt 8',
    '976334455',
    '¡Hola Don Lucho! Lo contacto desde Urbanización Los Laureles para una urgencia de gasfitería/electricidad en mi casa.',
    'approved',
    1
),
(
    'Confecciones & Arreglos Carmen',
    'Bastas de pantalones, cambio de cierres, entalle de prendas, confección de cortinas y uniformes escolares.',
    'Vestimenta / Ropa',
    'Lun - Vie: 9:00 AM - 6:00 PM',
    'Carmen Valdivia',
    'Mz C Lt 20',
    '982445566',
    '¡Hola Sra. Carmen! Vi su taller de confecciones en Mercado Laureles. Quisiera consultar sobre el arreglo de unas prendas.',
    'approved',
    0
),
(
    'Studio de Belleza & Manicure Yanet',
    'Manicure rusa, pedicure spa, lifting de pestañas, depilación y peinados para eventos. Atención previa cita en la comodidad de la urbanización.',
    'Belleza / Cuidado Personal',
    'Mar - Sáb: 10:00 AM - 7:00 PM',
    'Yanet Castillo',
    'Mz E Lt 2',
    '998556677',
    '¡Hola Yanet! Vi tu studio de belleza en Mercado Laureles. Quisiera agendar una cita para esta semana.',
    'approved',
    0
),
(
    'Piqueos & Empanadas Caseras San Martín',
    'Empanadas horneadas de carne y pollo, tablas de quesos y piqueos listos para el lonche familiar.',
    'Gastronomía / Comida',
    'Jue - Dom: 4:00 PM - 9:00 PM',
    'Jorge San Martín',
    'Mz F Lt 11',
    '984667788',
    '¡Hola Jorge! Quisiera hacer un pedido de empanadas para hoy en la tarde.',
    'pending',
    0
);
```

### 6.2 Sample Census Properties (Total: 40 Houses Across Mz A to Mz D)
Preloads realistic blocks and lots with proper property codes:
- **Mz A:** Lt 1 to Lt 10 (`MZ-A-LT-01` ... `MZ-A-LT-10`)
- **Mz B:** Lt 1 to Lt 10 (`MZ-B-LT-01` ... `MZ-B-LT-10`)
- **Mz C:** Lt 1 to Lt 10 (`MZ-C-LT-01` ... `MZ-C-LT-10`)
- **Mz D:** Lt 1 to Lt 10 (`MZ-D-LT-01` ... `MZ-D-LT-10`)
Total residential base = 40 houses.

---

## 7. Edge Cases, Failure Modes & Mitigation Strategies

1. **Duplicate Read Confirmations:**
   - *Risk:* A resident clicks multiple times, skewing coverage percentages.
   - *Mitigation:* SQLite unique constraint `UNIQUE(announcement_id, property_code)` ensures database-level atomicity. API catches error and returns HTTP 409 with friendly Spanish message: *"El inmueble {property} ya cuenta con una confirmación registrada"*.
2. **Malformed Telephone Numbers for WhatsApp:**
   - *Risk:* Resident inputs `987-654-321`, `(01) 987654321`, or `+51 987 654 321`.
   - *Mitigation:* The `generateWhatsAppLink` sanitizer strips all non-digit characters and prepends `51` if length is 9 digits, guaranteeing clean URLs for `wa.me`.
3. **Session Hijacking / CSRF in Admin Panel:**
   - *Risk:* Unauthorized access to administrative CRUD actions.
   - *Mitigation:* `SameSite=Strict` cookie policy, `HttpOnly` flag prevents JavaScript access (XSS defense), and session timeout after 24 hours.
4. **Excel Encoding Glitches on CSV Export:**
   - *Risk:* Special characters like `ñ` and accents become garbled (`Ã±`) in Spanish Excel.
   - *Mitigation:* Writing `\uFEFF` (UTF-8 BOM) at the beginning of the file buffer forces Microsoft Excel to decode in UTF-8 automatically.
5. **Very Long Missing Houses List in WhatsApp:**
   - *Risk:* For announcements with 80+ missing houses, pasting a raw list causes text overflow in WhatsApp.
   - *Mitigation:* The reminder generator groups lots by Manzana (e.g. `Mz A: Lt 1, 3, 5, 8`), compressing the text by over 70% while remaining completely readable.

---

## 8. Implementation Checklist for Track B Engineers

- [ ] Create SQLite schema tables (`marketplace_listings`, `announcements`, `census_properties`, `announcement_reads`, `admin_sessions`).
- [ ] Implement `src/lib/db.ts` utilizing Node.js v24 native `node:sqlite`.
- [ ] Build WhatsApp link generator and test with international and 9-digit Peruvian numbers.
- [ ] Implement `/mercado` page with category filters and listing cards.
- [ ] Implement `/mercado/postular` submission form with validation and pending status.
- [ ] Implement `/admin/login` and PIN authentication middleware.
- [ ] Implement `/admin` metrics dashboard and read tracking view.
- [ ] Implement 1-Click WhatsApp Reminder generator with clipboard copy and web intent.
- [ ] Implement Announcements CRUD (create, edit, pin, archive, delete).
- [ ] Implement Marketplace moderation dashboard (pending, approve, reject, edit).
- [ ] Implement CSV export endpoint with UTF-8 BOM.
- [ ] Seed database with initial community listings and census records.

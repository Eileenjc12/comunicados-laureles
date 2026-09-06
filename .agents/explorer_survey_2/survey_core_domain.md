# Core Domain Specification: Requirements R1, R2, and R5
**Project:** Urbanización Los Laureles — Portal Comunitario y Web Residencial  
**Author:** explorer_survey_2 (Core Domain Explorer)  
**Date:** 2026-09-04  
**Target Runtime:** Node.js v24 (`node:sqlite`) & Astro Framework (SSR)

---

## 1. Executive Domain Architecture & Context

Urbanización Los Laureles is an organized residential community. Residents primarily access community information through mobile devices via links shared on official WhatsApp groups. 

The core domain comprises three tightly integrated functional pillars:
1. **R1: Institutional Portal & Official Announcements Board (Muro Institucional)**: A mobile-first, high-legibility web portal providing rapid access to emergency numbers, administrative contacts, and categorized official notices with search, filtering, and priority indicators.
2. **R2: Property-Level Read Confirmation & Engagement Tracking (Control de Lectura)**: A verifiable acknowledgment mechanism where each physical property (*inmueble*) records a single, authoritative read confirmation per announcement. It calculates real-time community quorum (progress bar) and tracks raw visit impressions.
3. **R5: Residential Census & Master Dataset (Padrón Residencial y Datos Semilla)**: Persistent storage in native Node.js v24 `node:sqlite` maintaining the official register of blocks (*Manzanas*) and houses/lots (*Casas/Lotes*), populated with realistic seed data.

```
+-----------------------------------------------------------------------------------+
|                           PORTAL WEB LOS LAURELES                                 |
|                                                                                   |
|  +-----------------------------------------------------------------------------+  |
|  | [R1] Header de Emergencia (Portería, Seguridad, Bomberos, Policía, Admin)    |  |
|  +-----------------------------------------------------------------------------+  |
|                                                                                   |
|  +-------------------------------------+  +------------------------------------+  |
|  | [R1] Muro de Comunicados Oficiales  |  | [R2] Detalle de Comunicado         |  |
|  | - Categorías y Destinatarios        |  | - Contador atómico de visitas      |  |
|  | - Buscador y filtros en tiempo real |  | - Barra de progreso de lectura %   |  |
|  | - Distintivos de urgencia y plazos  |  | - Formulario de Confirmación       |  |
|  +-------------------------------------+  +------------------------------------+  |
|                     |                                       |                     |
|                     v                                       v                     |
|  +-----------------------------------------------------------------------------+  |
|  | [R2 / R5] Base de Datos SQLite (node:sqlite Nativo)                         |  |
|  | - announcements (id, slug, title, category, audience, is_urgent, visits...) |  |
|  | - properties (padrón: manzana, lote, código único, propietario)             |  |
|  | - read_confirmations (announcement_id, property_id, UNIQUE constraint)     |  |
|  +-----------------------------------------------------------------------------+  |
+-----------------------------------------------------------------------------------+
```

---

## 2. Requirement R1: Institutional Portal & Announcements Board

### 2.1 Mobile-First Viewport & Responsive Design
- **Primary Audience Channel**: Mobile phones via WhatsApp link clicks.
- **Design Principles**:
  - **Zero-Friction Loading**: Minimal client-side JavaScript, server-side rendered (SSR) markup, optimized CSS.
  - **Readability & Typography**: Base font size `16px` (prevents auto-zoom on iOS Safari input focus); high-contrast slate text on white/light gray background.
  - **Touch Targets**: Minimum `44px × 44px` for interactive buttons, category pills, emergency links, and form inputs.
  - **Viewport Breakpoints**:
    - Mobile Portrait: `< 640px` (single-column cards, sticky bottom/top quick-actions, full-width selectors).
    - Tablet: `640px - 1024px` (two-column card grid, expanded header).
    - Desktop: `> 1024px` (max-width `1200px` centered, side-by-side announcements and emergency quick-access sidebar).

### 2.2 Header Institucional & Directorio de Emergencia
The portal header anchors community trust and provides 1-tap dial/chat actions for critical services:

| Service / Contact | Default Label | Channel / Protocol | Action / Display | Target Number / Link |
| :--- | :--- | :--- | :--- | :--- |
| **Portería Principal** | Garita 1 (Ingreso Vehicular) | `tel:` & WhatsApp | 1-Tap Call & Chat | `+51 987 654 321` |
| **Vigilancia 24/7** | Central de Seguridad Interna | `tel:` | Llamada inmediata | `(01) 456-7890` (Anexo 1) |
| **Administración** | Junta Directiva / Administración | WhatsApp & Email | Enviar Mensaje | `wa.me/51999888777` |
| **Policía Nacional** | Comisaría del Sector / Serenazgo | `tel:` | 1-Tap Call | `105` / `(01) 333-2211` |
| **Bomberos** | Bomberos Voluntarios | `tel:` | 1-Tap Call | `116` |
| **Emergencias Médicas** | Ambulancia / SAMU | `tel:` | 1-Tap Call | `106` |

**UI Presentation**:
- Prominent banner at the top of the homepage: "Directorio de Asistencia y Emergencias".
- Quick-call pills with distinct icons (shield, telephone, ambulance, police badge).
- Mobile sticky quick-dial drawer or accessible header accordion to avoid pushing announcements too far down while keeping emergencies 1 tap away.

### 2.3 Announcements Data Model (Muro de Comunicados)

#### Entity Schema: `announcements`
```sql
CREATE TABLE IF NOT EXISTS announcements (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL CHECK (length(trim(title)) >= 5),
    slug TEXT NOT NULL UNIQUE,
    summary TEXT NOT NULL,
    content TEXT NOT NULL,
    category TEXT NOT NULL CHECK (
        category IN (
            'Urgente / Alertas',
            'Mantenimiento',
            'Convocatorias de Asamblea',
            'Normas de Convivencia',
            'Finanzas / Cuotas'
        )
    ),
    audience TEXT NOT NULL DEFAULT 'General' CHECK (
        audience IN (
            'General',
            'Solo Propietarios',
            'Solo Inquilinos'
        )
    ),
    is_urgent INTEGER NOT NULL DEFAULT 0 CHECK (is_urgent IN (0, 1)),
    deadline_date TEXT DEFAULT NULL, -- ISO-8601 string: YYYY-MM-DD or YYYY-MM-DDTHH:MM:SS
    pinned INTEGER NOT NULL DEFAULT 0 CHECK (pinned IN (0, 1)),
    archived INTEGER NOT NULL DEFAULT 0 CHECK (archived IN (0, 1)),
    visit_count INTEGER NOT NULL DEFAULT 0 CHECK (visit_count >= 0),
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_announcements_slug ON announcements(slug);
CREATE INDEX IF NOT EXISTS idx_announcements_feed ON announcements(archived, pinned DESC, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_announcements_category ON announcements(category);
CREATE INDEX IF NOT EXISTS idx_announcements_audience ON announcements(audience);
```

#### Category Taxonomy & Visual Styling System
| Category Key | Visual Intent | Tailwind Classes | Badge Icon | Sample Subject |
| :--- | :--- | :--- | :--- | :--- |
| **Urgente / Alertas** | High alert, security, emergencies | `bg-red-100 text-red-800 border border-red-300` | 🚨 Alerta | Corte imprevisto de agua, portón averiado |
| **Mantenimiento** | Infrastructure, scheduled works | `bg-amber-100 text-amber-800 border border-amber-300` | 🛠️ Obras | Lavado de cisterna, podado comunal |
| **Convocatorias de Asamblea** | Formal assemblies, governance | `bg-blue-100 text-blue-800 border border-blue-300` | 🏛️ Asamblea | Asamblea General Ordinaria 2026 |
| **Normas de Convivencia** | Community rules, neighbor etiquette | `bg-emerald-100 text-emerald-800 border border-emerald-300` | 🤝 Convivencia | Horarios de ruido, tenencia de mascotas |
| **Finanzas / Cuotas** | Balances, maintenance fees, audits | `bg-purple-100 text-purple-800 border border-purple-300` | 💳 Finanzas | Rendición de cuentas semestral, cuota extra |

#### Priority & Deadline Indicators
- **High-Urgency Flag (`is_urgent = 1`)**:
  - Displays a highlighted red border on card: `border-l-4 border-l-red-600`.
  - Animated pulsing badge: `<span class="animate-pulse bg-red-600 text-white text-xs px-2 py-0.5 rounded-full font-bold">¡URGENTE!</span>`.
- **Pinned Flag (`pinned = 1`)**:
  - Always sorted before unpinned announcements in the active feed.
  - Pin badge: `<span class="bg-slate-100 text-slate-700 text-xs px-2 py-0.5 rounded flex items-center gap-1 font-medium">📌 Fijado</span>`.
- **Deadline Indicator (`deadline_date IS NOT NULL`)**:
  - If `deadline_date >= CURRENT_DATE`: Badge with remaining days e.g., "⏰ Plazo: Vence en 4 días (15/Sep)".
  - If `deadline_date < CURRENT_DATE`: Muted badge "⌛ Plazo Concluido".

### 2.4 Real-Time Search & Multi-Criteria Filtering
The filtering mechanism supports dual operation:
1. **Client-Side Instant Reactive Filtering (Zero-Latency)**:
   - Evaluates active DOM card attributes: `data-title`, `data-category`, `data-audience`, `data-date`.
   - Filters on every keystroke (`input` event with 150ms debounce) without HTTP requests.
   - Shows clean empty state ("No se encontraron comunicados con los filtros seleccionados") if no cards match.
2. **Server-Side URL Query State (Shareable Links)**:
   - Query parameters: `/?q=cisterna&cat=Mantenimiento&aud=General`
   - Initial SSR renders pre-filtered list; search input and select dropdowns hydrate with initial values.
   - Enables administration to share specific filtered views on WhatsApp (e.g., link directly to all "Convocatorias de Asamblea").

---

## 3. Requirement R2: Tracking & Read-Confirmation by Property

### 3.1 The Quorum Problem & Residential Integrity
In community administration, confirming that a message was received cannot be tracked by anonymous clicks or cookies. Legal validity for community assemblies and essential notices requires identifying **which physical property** has been notified.
- Multiple residents may live in a single house (husband, wife, adult children, or roommates).
- **Core Constraint**: A property must be counted **exactly once** per announcement.
- The confirmation record must record:
  - The physical property (`property_id`).
  - The specific resident who confirmed (`resident_name`).
  - Their legal relationship to the property (`role`: 'Propietario' or 'Inquilino').
  - The exact timestamp of confirmation (`confirmed_at`).

### 3.2 Read Confirmation Data Model

#### Entity Schema: `read_confirmations`
```sql
CREATE TABLE IF NOT EXISTS read_confirmations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    announcement_id INTEGER NOT NULL,
    property_id INTEGER NOT NULL,
    resident_name TEXT NOT NULL CHECK (length(trim(resident_name)) >= 3),
    role TEXT NOT NULL CHECK (role IN ('Propietario', 'Inquilino')),
    confirmed_at TEXT NOT NULL DEFAULT (datetime('now')),
    ip_address TEXT DEFAULT NULL,
    user_agent TEXT DEFAULT NULL,
    FOREIGN KEY (announcement_id) REFERENCES announcements(id) ON DELETE CASCADE,
    FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE RESTRICT,
    -- CRITICAL INTEGRITY CONSTRAINT:
    -- Prevents multiple confirmations for the same property on the same announcement
    CONSTRAINT uq_announcement_property UNIQUE (announcement_id, property_id)
);

CREATE INDEX IF NOT EXISTS idx_read_conf_announcement ON read_confirmations(announcement_id);
CREATE INDEX IF NOT EXISTS idx_read_conf_property ON read_confirmations(property_id);
```

### 3.3 Interactive Confirmation Form State Machine

```
   +----------------------------------------------------------------+
   |                        INITIAL STATE                           |
   | Resident views announcement; sees confirmation card at bottom. |
   +----------------------------------------------------------------+
                                   |
                                   v
   +----------------------------------------------------------------+
   |                        IN-FLIGHT SUBMISSION                    |
   | - Selects Manzana & Lote/Casa (or searchable single dropdown)  |
   | - Inputs Full Name (e.g. "Carlos Mendoza")                     |
   | - Selects Role ("Propietario" / "Inquilino")                   |
   | - Checks acknowledgment box and clicks "Confirmar Lectura"     |
   +----------------------------------------------------------------+
                                   |
         +-------------------------+-------------------------+
         |                                                   |
         v (Valid & Not yet confirmed)                       v (Duplicate Property)
+------------------------------------+             +------------------------------------+
|           SUCCESS STATE            |             |       ALREADY CONFIRMED STATE      |
| - Green verification badge         |             | - Informative warning banner       |
| - "¡Lectura registrada con éxito!" |             | - "Este inmueble (Mz. B Lote 04)   |
| - Timestamp & property confirmed   |             |    ya registró su lectura el       |
| - Progress bar auto-updates (+1)   |             |    04/09/2026 por Carlos Mendoza"  |
+------------------------------------+             +------------------------------------+
```

### 3.4 Community Progress Bar & Quorum Metrics
The progress bar visualizes community engagement and peer accountability:

$$\text{Porcentaje de Confirmación} = \left( \frac{\text{COUNT}(\text{read\_confirmations WHERE announcement\_id} = A)}{\text{COUNT}(\text{properties WHERE is\_active} = 1)} \right) \times 100$$

#### SQL Metric Query (Native node:sqlite):
```sql
SELECT 
    COUNT(rc.id) AS confirmed_count,
    (SELECT COUNT(*) FROM properties WHERE is_active = 1) AS total_properties,
    ROUND(
        (CAST(COUNT(rc.id) AS REAL) / (SELECT COUNT(*) FROM properties WHERE is_active = 1)) * 100.0,
        1
    ) AS progress_percentage
FROM read_confirmations rc
WHERE rc.announcement_id = :announcement_id;
```

#### Progress Bar UI Tiers
- **Tier 1: Low Quorum (< 35%)**:
  - Color: Crimson / Amber (`bg-amber-500`).
  - Caption: *"12 de 52 inmuebles han confirmado (23.1%) — Por debajo del quórum mínimo"*.
- **Tier 2: Moderate Quorum (35% - 69%)**:
  - Color: Blue / Sky (`bg-blue-600`).
  - Caption: *"28 de 52 inmuebles han confirmado (53.8%) — En proceso de notificación"*.
- **Tier 3: High Quorum / Official Quorum Reached (>= 70%)**:
  - Color: Emerald Green (`bg-emerald-600`).
  - Caption: *"42 de 52 inmuebles han confirmado (80.8%) — ¡Quórum reglamentario alcanzado!"*.

### 3.5 Atomic Visit Counter Mechanics
- **Difference from Read Confirmation**:
  - `visit_count` measures global card clicks and page reads (impressions).
  - Helps administration determine whether residents opened the notice but forgot to fill out the confirmation form.
- **Atomic SQL Update**:
  ```sql
  UPDATE announcements 
  SET visit_count = visit_count + 1 
  WHERE id = ?;
  ```
- **Debouncing / Deduplication**:
  - Client stores `localStorage.getItem('viewed_announcement_' + id)`.
  - If viewed within the last 24 hours, the client does not fire the view increment request, avoiding counter inflation from manual page reloads.

---

## 4. Requirement R5: Residential Census & Master Seed Data

### 4.1 Census Architecture for "Urbanización Los Laureles"
Urbanización Los Laureles is organized into 5 residential blocks (*Manzanas A, B, C, D, E*) totaling **52 structured properties**:
- **Manzana A**: 10 Lots (Casas 01 a 10) — Calle Los Rosales
- **Manzana B**: 12 Lots (Casas 01 a 12) — Calle Los Álamos
- **Manzana C**: 10 Lots (Casas 01 a 10) — Jirón Las Acacias
- **Manzana D**: 10 Lots (Casas 01 a 10) — Pasaje Los Cipreses
- **Manzana E**: 10 Lots (Casas 01 a 10) — Avenida Los Laureles Principal

#### Entity Schema: `properties`
```sql
CREATE TABLE IF NOT EXISTS properties (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    block_name TEXT NOT NULL, -- e.g., 'Mz. A', 'Mz. B'
    unit_number TEXT NOT NULL, -- e.g., 'Lote 01', 'Lote 02'
    code TEXT NOT NULL UNIQUE, -- e.g., 'MZ-A-01' (standardized alphanumeric code)
    street_address TEXT NOT NULL, -- e.g., 'Calle Los Rosales 101'
    primary_owner_name TEXT NOT NULL,
    contact_phone TEXT DEFAULT NULL,
    is_active INTEGER NOT NULL DEFAULT 1 CHECK (is_active IN (0, 1)),
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_properties_code ON properties(code);
CREATE INDEX IF NOT EXISTS idx_properties_block ON properties(block_name);
```

### 4.2 Complete Master Seed Dataset

#### 4.2.1 Census Dataset (52 Active Properties)
```sql
INSERT OR IGNORE INTO properties (block_name, unit_number, code, street_address, primary_owner_name, contact_phone) VALUES
-- Manzana A (10 Lotes - Calle Los Rosales)
('Mz. A', 'Lote 01', 'MZ-A-01', 'Calle Los Rosales 101', 'Carlos Alberto Mendoza Silva', '+51 987 111 001'),
('Mz. A', 'Lote 02', 'MZ-A-02', 'Calle Los Rosales 103', 'María Elena Paredes Ramos', '+51 987 111 002'),
('Mz. A', 'Lote 03', 'MZ-A-03', 'Calle Los Rosales 105', 'Jorge Luis Villanueva Castro', '+51 987 111 003'),
('Mz. A', 'Lote 04', 'MZ-A-04', 'Calle Los Rosales 107', 'Rosa Lucía Benites Morales', '+51 987 111 004'),
('Mz. A', 'Lote 05', 'MZ-A-05', 'Calle Los Rosales 109', 'Héctor Manuel Quintana Torres', '+51 987 111 005'),
('Mz. A', 'Lote 06', 'MZ-A-06', 'Calle Los Rosales 111', 'Gladys Patricia Huamán Ortiz', '+51 987 111 006'),
('Mz. A', 'Lote 07', 'MZ-A-07', 'Calle Los Rosales 113', 'Víctor Raúl Espinoza Vega', '+51 987 111 007'),
('Mz. A', 'Lote 08', 'MZ-A-08', 'Calle Los Rosales 115', 'Carmen Teresa Salazar Bravo', '+51 987 111 008'),
('Mz. A', 'Lote 09', 'MZ-A-09', 'Calle Los Rosales 117', 'Eduardo Daniel Rivas Gómez', '+51 987 111 009'),
('Mz. A', 'Lote 10', 'MZ-A-10', 'Calle Los Rosales 119', 'Silvia Mónica Cornejo Peña', '+51 987 111 010'),

-- Manzana B (12 Lotes - Calle Los Álamos)
('Mz. B', 'Lote 01', 'MZ-B-01', 'Calle Los Álamos 201', 'Fernando José Alarcón Flores', '+51 987 111 011'),
('Mz. B', 'Lote 02', 'MZ-B-02', 'Calle Los Álamos 203', 'Ana Cecilia Barrientos Luna', '+51 987 111 012'),
('Mz. B', 'Lote 03', 'MZ-B-03', 'Calle Los Álamos 205', 'Manuel Alejandro Cárdenas Gil', '+51 987 111 013'),
('Mz. B', 'Lote 04', 'MZ-B-04', 'Calle Los Álamos 207', 'Juana Isabel Domínguez Ríos', '+51 987 111 014'),
('Mz. B', 'Lote 05', 'MZ-B-05', 'Calle Los Álamos 209', 'Roberto Carlos Estrada Pinto', '+51 987 111 015'),
('Mz. B', 'Lote 06', 'MZ-B-06', 'Calle Los Álamos 211', 'Teresa De Jesús Figueroa Cruz', '+51 987 111 016'),
('Mz. B', 'Lote 07', 'MZ-B-07', 'Calle Los Álamos 213', 'Gustavo Adolfo Gálvez León', '+51 987 111 017'),
('Mz. B', 'Lote 08', 'MZ-B-08', 'Calle Los Álamos 215', 'Norma Beatriz Hidalgo Vera', '+51 987 111 018'),
('Mz. B', 'Lote 09', 'MZ-B-09', 'Calle Los Álamos 217', 'César Augusto Iparraguirre Solís', '+51 987 111 019'),
('Mz. B', 'Lote 10', 'MZ-B-10', 'Calle Los Álamos 219', 'Lucía Mercedes Jáuregui Cano', '+51 987 111 020'),
('Mz. B', 'Lote 11', 'MZ-B-11', 'Calle Los Álamos 221', 'Oscar Enrique Loyola Montes', '+51 987 111 021'),
('Mz. B', 'Lote 12', 'MZ-B-12', 'Calle Los Álamos 223', 'Yolanda Pilar Medina Soto', '+51 987 111 022'),

-- Manzana C (10 Lotes - Jirón Las Acacias)
('Mz. C', 'Lote 01', 'MZ-C-01', 'Jirón Las Acacias 301', 'Javier Ignacio Navarro Campos', '+51 987 111 023'),
('Mz. C', 'Lote 02', 'MZ-C-02', 'Jirón Las Acacias 303', 'Olga Rocío Ochoa Zambrano', '+51 987 111 024'),
('Mz. C', 'Lote 03', 'MZ-C-03', 'Jirón Las Acacias 305', 'Pedro Pablo Quiroz Valdivia', '+51 987 111 025'),
('Mz. C', 'Lote 04', 'MZ-C-04', 'Jirón Las Acacias 307', 'Sara Maritza Ramírez Leyva', '+51 987 111 026'),
('Mz. C', 'Lote 05', 'MZ-C-05', 'Jirón Las Acacias 309', 'Raúl Enrique Salinas Miranda', '+51 987 111 027'),
('Mz. C', 'Lote 06', 'MZ-C-06', 'Jirón Las Acacias 311', 'Miriam Esther Toledo Bustos', '+51 987 111 028'),
('Mz. C', 'Lote 07', 'MZ-C-07', 'Jirón Las Acacias 313', 'Alfredo Martín Ugarte Ponce', '+51 987 111 029'),
('Mz. C', 'Lote 08', 'MZ-C-08', 'Jirón Las Acacias 315', 'Delia Esperanza Vargas Prado', '+51 987 111 030'),
('Mz. C', 'Lote 09', 'MZ-C-09', 'Jirón Las Acacias 317', 'Hugo Hernán Wong Carranza', '+51 987 111 031'),
('Mz. C', 'Lote 10', 'MZ-C-10', 'Jirón Las Acacias 319', 'Beatriz Aurora Yáñez Chávez', '+51 987 111 032'),

-- Manzana D (10 Lotes - Pasaje Los Cipreses)
('Mz. D', 'Lote 01', 'MZ-D-01', 'Pasaje Los Cipreses 401', 'Gonzalo Andrés Zapata Robles', '+51 987 111 033'),
('Mz. D', 'Lote 02', 'MZ-D-02', 'Pasaje Los Cipreses 403', 'Adriana Jimena Acosta Bellido', '+51 987 111 034'),
('Mz. D', 'Lote 03', 'MZ-D-03', 'Pasaje Los Cipreses 405', 'Emilio Tomás Bravo Calderón', '+51 987 111 035'),
('Mz. D', 'Lote 04', 'MZ-D-04', 'Pasaje Los Cipreses 407', 'Clara Isabel Castañeda Dávila', '+51 987 111 036'),
('Mz. D', 'Lote 05', 'MZ-D-05', 'Pasaje Los Cipreses 409', 'David Esteban Fuentes Fuentes', '+51 987 111 037'),
('Mz. D', 'Lote 06', 'MZ-D-06', 'Pasaje Los Cipreses 411', 'Guillermo Felipe Guerra Lazo', '+51 987 111 038'),
('Mz. D', 'Lote 07', 'MZ-D-07', 'Pasaje Los Cipreses 413', 'Helena Marcela Lozano Meza', '+51 987 111 039'),
('Mz. D', 'Lote 08', 'MZ-D-08', 'Pasaje Los Cipreses 415', 'Julio César Naranjo Ojeda', '+51 987 111 040'),
('Mz. D', 'Lote 09', 'MZ-D-09', 'Pasaje Los Cipreses 417', 'Karina Paola Pizarro Quintana', '+51 987 111 041'),
('Mz. D', 'Lote 10', 'MZ-D-10', 'Pasaje Los Cipreses 419', 'Leonardo Favio Reátegui Saavedra', '+51 987 111 042'),

-- Manzana E (10 Lotes - Avenida Los Laureles Principal)
('Mz. E', 'Lote 01', 'MZ-E-01', 'Av. Los Laureles 501', 'Marcos Antonio Tejada Urbina', '+51 987 111 043'),
('Mz. E', 'Lote 02', 'MZ-E-02', 'Av. Los Laureles 503', 'Nelly Violeta Valera Vivanco', '+51 987 111 044'),
('Mz. E', 'Lote 03', 'MZ-E-03', 'Av. Los Laureles 505', 'Walter Oswaldo Zamora Arce', '+51 987 111 045'),
('Mz. E', 'Lote 04', 'MZ-E-04', 'Av. Los Laureles 507', 'Alicia Consuelo Cabrera Díaz', '+51 987 111 046'),
('Mz. E', 'Lote 05', 'MZ-E-05', 'Av. Los Laureles 509', 'Bernardo José Córdova Erazo', '+51 987 111 047'),
('Mz. E', 'Lote 06', 'MZ-E-06', 'Av. Los Laureles 511', 'Diana Carolina Falcón Garay', '+51 987 111 048'),
('Mz. E', 'Lote 07', 'MZ-E-07', 'Av. Los Laureles 513', 'Esteban Daniel Guzmán Heredia', '+51 987 111 049'),
('Mz. E', 'Lote 08', 'MZ-E-08', 'Av. Los Laureles 515', 'Flor De María Iriarte Jáuregui', '+51 987 111 050'),
('Mz. E', 'Lote 09', 'MZ-E-09', 'Av. Los Laureles 517', 'Gerardo Alfonso Jurado Luque', '+51 987 111 051'),
('Mz. E', 'Lote 10', 'MZ-E-10', 'Av. Los Laureles 519', 'Hilda Noemí Márquez Noriega', '+51 987 111 052');
```

#### 4.2.2 Sample Official Announcements Seed Data
5 highly realistic notices representing each category and audience:

```sql
INSERT OR IGNORE INTO announcements (
    id, title, slug, summary, content, category, audience, is_urgent, deadline_date, pinned, archived, visit_count, created_at
) VALUES 
(
    1,
    'Convocatoria Oficial: Asamblea General Ordinaria de Residentes 2026',
    'asamblea-general-ordinaria-2026',
    'La Junta Directiva convoca formalmente a todos los propietarios a la Asamblea General para tratar el balance anual y elección del nuevo comité.',
    '# Convocatoria a Asamblea General Ordinaria 2026\n\nEstimados vecinos y propietarios de la **Urbanización Los Laureles**:\n\nDe conformidad con el Estatuto Vecinal vigente, la Junta Directiva convoca a sesión de **Asamblea General Ordinaria** de carácter obligatorio.\n\n### Datos de la Sesión:\n- **Fecha:** Sábado 20 de Septiembre de 2026\n- **Primera Citación:** 19:00 horas (Quórum estatutario: 50% + 1)\n- **Segunda Citación:** 19:30 horas (Válida con los presentes)\n- **Lugar:** Salón Comunal de la Urbanización (o enlace virtual vía Google Meet)\n\n### Tabla de Temas (Orden del Día):\n1. Lectura y aprobación del Acta de la Asamblea anterior.\n2. Informe de gestión económica y rendición del balance financiero 2025-2026.\n3. Aprobación del presupuesto para la renovación del sistema de cámaras de seguridad perimetral.\n4. Elección del Comité Electoral para la renovación de Junta Directiva periodo 2026-2028.\n\n> **Nota:** Se solicita a cada propietario registrar su confirmación de lectura en el formulario inferior para verificar el quórum previo de la citación.',
    'Convocatorias de Asamblea',
    'Solo Propietarios',
    0,
    '2026-09-20',
    1,
    0,
    148,
    '2026-09-01 10:00:00'
),
(
    2,
    'Mantenimiento Preventivo Semestral de Cisterna y Bombas de Agua',
    'mantenimiento-cisterna-bombas-agua-septiembre',
    'Corte programado del servicio de agua potable este jueves de 08:00 a 16:00 hrs por limpieza, desinfección y mantenimiento técnico de electrobombas.',
    '# Mantenimiento Preventivo de Cisterna y Electrobombas\n\nEstimados vecinos (Propietarios e Inquilinos):\n\nSe informa que este **Jueves 10 de Septiembre de 2026**, la empresa de saneamiento ambiental *HidroServicios S.A.C.* ejecutará el lavado integral, desinfección certificada de la cisterna principal y mantenimiento preventivo de las dos bombas hidroneumáticas de la urbanización.\n\n### Horario de Suspensión Temporal:\n- **Inicio de corte:** 08:00 hrs.\n- **Restablecimiento gradual:** 16:00 hrs a 17:30 hrs.\n\n### Recomendaciones para todos los hogares:\n1. Almacenar agua potable en recipientes limpios con debida anticipación para el consumo del día.\n2. Mantener cerradas las llaves de paso durante el trabajo para evitar ingreso de sedimentos a las cañerías internas.\n3. El personal técnico estará debidamente acreditado y supervisado por la portería y la administración.\n\nAgradecemos su comprensión y colaboración para mantener la salubridad y operatividad de nuestros equipos comunitarios.',
    'Mantenimiento',
    'General',
    1,
    '2026-09-10',
    1,
    0,
    215,
    '2026-09-02 08:30:00'
),
(
    3,
    'Normas de Convivencia: Control de Ruidos Molestos y Manejo de Mascotas en Áreas Comunes',
    'normas-convivencia-ruidos-y-mascotas',
    'Recordatorio estricto sobre horarios de silencio vecinal y uso obligatorio de correa y recojo de excretas de mascotas en parques y pasajes.',
    '# Disposiciones Obligatorias de Convivencia Vecinal\n\nCon el propósito de salvaguardar la tranquilidad, el descanso y el orden de todas las familias de **Los Laureles**, la Junta Directiva recuerda el cumplimiento irrestricto de las normas aprobadas en asamblea:\n\n### 1. Ruidos y Reuniones Sociales:\n- Los días de semana (Lunes a Jueves), el límite máximo para música y ruido perceptible fuera del inmueble es a las **22:00 hrs**.\n- Los días Viernes, Sábados y vísperas de feriado, el horario límite es a las **01:00 hrs** del día siguiente.\n- Queda terminantemente prohibido estacionar vehículos con volumen de audio alto en las vías internas.\n\n### 2. Tenencia Responsable de Mascotas:\n- Todo canino debe circular por veredas y parques provisto obligatoriamente de **correa y collar** en compañía de un adulto responsable.\n- Es deber ciudadano e insoslayable portar bolsas para el **inmediato recojo de deposiciones**.\n- Las razas de manejo especial deben utilizar bozal reglamentario según Ley N° 27596.\n\nEl incumplimiento reiterado dará lugar a la aplicación de sanciones y multas en la cuota de mantenimiento respectiva.',
    'Normas de Convivencia',
    'General',
    0,
    NULL,
    0,
    0,
    92,
    '2026-09-03 14:15:00'
),
(
    4,
    'Cierre Financiero Agosto 2026 y Publicación de Estado de Cuotas de Mantenimiento',
    'cierre-financiero-agosto-2026-estado-cuotas',
    'Balance contable disponible con ingresos, egresos por seguridad y áreas verdes, y lista de inmuebles al día.',
    '# Rendición de Cuentas: Balance Mensual Agosto 2026\n\nEstimados vecinos copropietarios:\n\nEn cumplimiento del compromiso de absoluta transparencia, adjuntamos el resumen financiero correspondiente al mes de Agosto 2026:\n\n### Resumen Contable:\n- **Ingresos por Cuotas Ordinarias (52 casas):** S/. 7,800.00 (92% de recaudación)\n- **Ingresos por uso de Salón Comunal:** S/. 350.00\n- **Egresos Operativos:**\n  - Servicio de Seguridad y Vigilancia 24/7 (2 guardias): S/. 4,200.00\n  - Servicio de Jardinería y Mantenimiento de Parques: S/. 1,100.00\n  - Consumo de Energía Eléctrica Común (Alumbrado interno y bombas): S/. 890.00\n  - Mantenimiento menor de portón levadizo: S/. 280.00\n- **Superávit del mes a Fondo de Reserva:** S/. 1,680.00\n\nEl detalle pormenorizado con comprobantes de pago escaneados se encuentra en la carpeta física de administración en garita y puede solicitarse digitalmente por WhatsApp.',
    'Finanzas / Cuotas',
    'Solo Propietarios',
    0,
    '2026-09-15',
    0,
    0,
    64,
    '2026-09-03 18:00:00'
),
(
    5,
    'Alerta Urgente: Reparación Inmediata de Alumbrado en Pasaje Los Cipreses y Portón 2',
    'alerta-reparacion-alumbrado-pasaje-cipreses',
    'Falla en el circuito secundario del Pasaje Los Cipreses será subsanada por cuadrilla técnica eléctrica hoy a partir de las 18:30 hrs.',
    '# Alerta de Mantenimiento Urgente\n\nSe pone en conocimiento de los residentes de la **Manzana D (Pasaje Los Cipreses)** que se ha detectado una desconexión en el transformador auxiliar del alumbrado público interno.\n\n- Cuadrilla de técnicos electricistas ingresará hoy a las **18:30 hrs** para el reemplazo del interruptor termomagnético y cableado averiado.\n- Durante las maniobras (estimadas en 45 minutos), habrá breves parpadeos en el alumbrado comunal.\n- Rogamos a los conductores circular a baja velocidad por la presencia de escaleras y conos de señalización en la vía.\n\nPersonal de garita brindará apoyo de tránsito en el sector.',
    'Urgente / Alertas',
    'General',
    1,
    NULL,
    0,
    0,
    110,
    '2026-09-04 16:30:00'
);
```

#### 4.2.3 Initial Sample Read Confirmations (Demonstration Quorum)
To demonstrate realistic progress bar metrics immediately upon system startup, preload confirmations for announcement 1 and announcement 2:

```sql
-- Confirmations for Announcement 1 (Asamblea General - 21 confirmed out of 52 = 40.4%)
INSERT OR IGNORE INTO read_confirmations (announcement_id, property_id, resident_name, role, confirmed_at) VALUES
(1, 1, 'Carlos Alberto Mendoza Silva', 'Propietario', '2026-09-01 11:20:00'),
(1, 2, 'María Elena Paredes Ramos', 'Propietario', '2026-09-01 11:45:00'),
(1, 3, 'Jorge Luis Villanueva Castro', 'Propietario', '2026-09-01 12:10:00'),
(1, 5, 'Héctor Manuel Quintana Torres', 'Propietario', '2026-09-01 13:05:00'),
(1, 7, 'Víctor Raúl Espinoza Vega', 'Propietario', '2026-09-01 14:22:00'),
(1, 11, 'Fernando José Alarcón Flores', 'Propietario', '2026-09-01 15:30:00'),
(1, 12, 'Ana Cecilia Barrientos Luna', 'Propietario', '2026-09-01 16:15:00'),
(1, 14, 'Juana Isabel Domínguez Ríos', 'Propietario', '2026-09-01 17:00:00'),
(1, 15, 'Roberto Carlos Estrada Pinto', 'Propietario', '2026-09-01 18:40:00'),
(1, 17, 'Gustavo Adolfo Gálvez León', 'Propietario', '2026-09-01 19:12:00'),
(1, 23, 'Javier Ignacio Navarro Campos', 'Propietario', '2026-09-02 09:10:00'),
(1, 25, 'Pedro Pablo Quiroz Valdivia', 'Propietario', '2026-09-02 10:35:00'),
(1, 27, 'Raúl Enrique Salinas Miranda', 'Propietario', '2026-09-02 11:50:00'),
(1, 29, 'Alfredo Martín Ugarte Ponce', 'Propietario', '2026-09-02 14:05:00'),
(1, 33, 'Gonzalo Andrés Zapata Robles', 'Propietario', '2026-09-02 15:20:00'),
(1, 35, 'Emilio Tomás Bravo Calderón', 'Propietario', '2026-09-02 16:45:00'),
(1, 37, 'David Esteban Fuentes Fuentes', 'Propietario', '2026-09-03 08:30:00'),
(1, 43, 'Marcos Antonio Tejada Urbina', 'Propietario', '2026-09-03 10:15:00'),
(1, 45, 'Walter Oswaldo Zamora Arce', 'Propietario', '2026-09-03 11:40:00'),
(1, 47, 'Bernardo José Córdova Erazo', 'Propietario', '2026-09-03 13:00:00'),
(1, 51, 'Gerardo Alfonso Jurado Luque', 'Propietario', '2026-09-04 09:20:00');

-- Confirmations for Announcement 2 (Mantenimiento Cisterna - 38 confirmed out of 52 = 73.1% High Quorum)
INSERT OR IGNORE INTO read_confirmations (announcement_id, property_id, resident_name, role, confirmed_at)
SELECT 2, id, primary_owner_name, 'Propietario', '2026-09-02 12:00:00'
FROM properties
WHERE id IN (1,2,3,4,5,6,7,8,9,11,12,13,14,15,16,18,19,23,24,25,26,27,28,30,33,34,35,36,37,39,40,43,44,45,46,47,48,50);
```

---

## 5. API Endpoints & Core Domain Interaction Contracts

In Astro SSR mode, API routes are defined under `src/pages/api/` and use native Request/Response objects.

### 5.1 Endpoint: `GET /api/announcements`
- **Purpose**: Retrieve paginated or filtered list of active announcements.
- **Query Params**:
  - `q` (string, optional): search term in title, summary, or content.
  - `category` (string, optional): exact match on category.
  - `audience` (string, optional): exact match on audience ('General', 'Solo Propietarios', 'Solo Inquilinos').
  - `include_archived` (boolean, optional, default false).
- **Response Format (`application/json`)**:
  ```json
  {
    "success": true,
    "total": 5,
    "data": [
      {
        "id": 1,
        "title": "Convocatoria Oficial: Asamblea General Ordinaria de Residentes 2026",
        "slug": "asamblea-general-ordinaria-2026",
        "summary": "La Junta Directiva convoca formalmente...",
        "category": "Convocatorias de Asamblea",
        "audience": "Solo Propietarios",
        "is_urgent": 0,
        "deadline_date": "2026-09-20",
        "pinned": 1,
        "visit_count": 148,
        "created_at": "2026-09-01 10:00:00",
        "read_stats": {
          "confirmed_properties": 21,
          "total_properties": 52,
          "percentage": 40.4
        }
      }
    ]
  }
  ```

### 5.2 Endpoint: `GET /api/announcements/[slug]`
- **Purpose**: Get single announcement detail with read confirmation status for a specific property or general quorum stats.
- **Response Format**: Includes full markdown/html content and current confirmation metrics.

### 5.3 Endpoint: `POST /api/announcements/[id]/confirm`
- **Purpose**: Submit property read confirmation.
- **Request Body (`application/json`)**:
  ```json
  {
    "property_id": 14,
    "resident_name": "Juana Isabel Domínguez Ríos",
    "role": "Propietario",
    "declaration_agreed": true
  }
  ```
- **Validation Rules**:
  1. `announcement_id` must exist and not be archived.
  2. `property_id` must exist in `properties` table and have `is_active = 1`.
  3. `resident_name` trimmed length must be between 3 and 150 characters.
  4. `role` must be strictly `'Propietario'` or `'Inquilino'`.
  5. `declaration_agreed` must be strictly `true`.
- **Handling & Responses**:
  - **Success (201 Created)**:
    ```json
    {
      "success": true,
      "message": "Lectura confirmada exitosamente para Mz. B Lote 04.",
      "confirmation": {
        "id": 105,
        "announcement_id": 1,
        "property_code": "MZ-B-04",
        "property_label": "Mz. B Lote 04 - Calle Los Álamos 207",
        "resident_name": "Juana Isabel Domínguez Ríos",
        "role": "Propietario",
        "confirmed_at": "2026-09-04T18:30:00Z"
      },
      "stats": {
        "confirmed_count": 22,
        "total_properties": 52,
        "percentage": 42.3
      }
    }
    ```
  - **Conflict / Duplicate (409 Conflict)**:
    When `UNIQUE(announcement_id, property_id)` is violated:
    ```json
    {
      "success": false,
      "code": "ALREADY_CONFIRMED",
      "message": "El inmueble Mz. B Lote 04 ya registró su confirmación de lectura previamente.",
      "existing_confirmation": {
        "resident_name": "Juana Isabel Domínguez Ríos",
        "role": "Propietario",
        "confirmed_at": "2026-09-01 17:00:00"
      }
    }
    ```
  - **Bad Request (400)**:
    ```json
    {
      "success": false,
      "code": "VALIDATION_ERROR",
      "errors": ["El nombre del residente debe tener al menos 3 caracteres."]
    }
    ```

### 5.4 Endpoint: `POST /api/announcements/[id]/view`
- **Purpose**: Increment visit counter atomically.
- **Handling**:
  ```typescript
  db.prepare("UPDATE announcements SET visit_count = visit_count + 1 WHERE id = ?").run(announcementId);
  ```
- **Response**: `{ "success": true, "visit_count": 149 }`

### 5.5 Endpoint: `GET /api/census/properties`
- **Purpose**: Supplies structured list of all properties for the frontend selector dropdown.
- **Output**:
  ```json
  [
    {
      "id": 1,
      "block": "Mz. A",
      "unit": "Lote 01",
      "code": "MZ-A-01",
      "label": "Mz. A - Lote 01 (Calle Los Rosales 101)",
      "primary_owner": "Carlos Alberto Mendoza Silva"
    }
  ]
  ```

---

## 6. Implementation Architecture in Astro & Native `node:sqlite`

### 6.1 Database Connection Module (`src/lib/db.ts`)
Using Node.js v24 native `node:sqlite`:

```typescript
import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';
import fs from 'node:fs';

const DB_PATH = process.env.DATABASE_PATH || path.join(process.cwd(), 'data', 'laureles.db');

// Ensure data directory exists
const dbDir = path.dirname(DB_PATH);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

// Singleton connection
let dbInstance: DatabaseSync | null = null;

export function getDb(): DatabaseSync {
  if (!dbInstance) {
    dbInstance = new DatabaseSync(DB_PATH);
    // Performance and integrity pragmas
    dbInstance.exec(`
      PRAGMA journal_mode = WAL;
      PRAGMA foreign_keys = ON;
      PRAGMA synchronous = NORMAL;
      PRAGMA busy_timeout = 5000;
    `);
    initTablesAndSeed(dbInstance);
  }
  return dbInstance;
}
```

### 6.2 Transaction Safety & Concurrency
Because `node:sqlite` uses `DatabaseSync`, database operations are synchronous within the Node.js event loop, preventing race conditions during read confirmation inserts. WAL (`Write-Ahead Logging`) mode allows non-blocking concurrent reads while writes are committed efficiently to disk.

---

## 7. Comprehensive Testing Matrix for Core Domain (Tiers 1-4)

| Test Tier | Scenario | Input / Action | Expected Outcome |
| :--- | :--- | :--- | :--- |
| **Tier 1: Feature Coverage** | Create Confirmation | POST valid `property_id: 10`, `resident_name: 'Silvia Cornejo'`, `role: 'Propietario'` | 201 Created; record persisted in SQLite; progress bar increments |
| **Tier 1: Feature Coverage** | Search Filter | Query `?q=cisterna` | Returns only Announcement #2 |
| **Tier 1: Feature Coverage** | Category Filter | Click "Convocatorias de Asamblea" pill | Only shows notices with category matching 'Convocatorias de Asamblea' |
| **Tier 1: Feature Coverage** | Visit Counter | POST to `/api/announcements/1/view` | `visit_count` increments atomically by 1 |
| **Tier 2: Boundary & Constraints** | Duplicate Confirmation | POST confirmation for same `property_id` twice on announcement 1 | Second request rejected with 409 Conflict and informative error |
| **Tier 2: Boundary & Constraints** | Invalid Property | POST with `property_id: 9999` (non-existent) | 400 Bad Request; Census validation rejects invalid ID |
| **Tier 2: Boundary & Constraints** | Short Resident Name | POST with `resident_name: 'Jo'` (< 3 chars) | 400 Bad Request; validation message returned |
| **Tier 2: Boundary & Constraints** | Progress Bar Range | 0 confirmed vs 52 confirmed | Math clamps between 0.0% and 100.0%; no division by zero if census empty |
| **Tier 3: Combinatorial** | Multi-Filter Combination | `?category=Mantenimiento&audience=General&q=agua` | Correctly filters the intersection of all active predicates |
| **Tier 3: Combinatorial** | Both Roles on Property | Owner confirms, then Tenant tries to confirm same property | Database rejects second confirmation, respecting physical property uniqueness |
| **Tier 4: Real-World Workflow** | Mobile WhatsApp Flow | User lands on `/comunicados/mantenimiento-cisterna-bombas-agua-septiembre` from WhatsApp link | Header shows emergency contacts; content renders in markdown; resident confirms property in 3 taps; receives immediate visual proof |

---

## 8. Summary of Deliverables & Recommendations for Implementation Track

1. **Astro Pages Structure**:
   - `src/pages/index.astro`: Institutional Portal homepage with Emergency Directory header, Filter bar, Search input, and Announcements feed.
   - `src/pages/comunicados/[slug].astro`: Announcement detail page with full content, Emergency header, Community Progress Bar, and Interactive Read Confirmation Form.
   - `src/pages/api/announcements/index.ts`: GET announcements list with search/filters.
   - `src/pages/api/announcements/[id]/confirm.ts`: POST read confirmation handler with census validation.
   - `src/pages/api/announcements/[id]/view.ts`: POST atomic visit counter increment.
   - `src/pages/api/census/properties.ts`: GET census properties for form dropdown.
2. **Database Engine**:
   - `src/lib/db.ts`: Native `node:sqlite` connection with WAL mode and automatic migration/seeding on startup.
3. **Data Integrity**:
   - Maintain `UNIQUE(announcement_id, property_id)` to safeguard community metrics.
   - 52 realistic properties seeded across Manzanas A through E.
   - 5 sample announcements covering all 5 categories.

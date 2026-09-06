# Technical Stack Specification Survey: Astro + Node.js v24 Native `node:sqlite`
**Project:** Portal Comunitario y Web Residencial Urbanización Los Laureles  
**Author:** spec_miner_survey_1 (Teamwork Technical Stack Spec Miner)  
**Date:** 2026-09-04  
**Target Directory:** `d:/COMUNICADOS LAURELES`  
**Reference Document:** `ORIGINAL_REQUEST.md`

---

## 1. Executive Summary

This specification survey establishes the complete technical foundation for the Urbanización Los Laureles community portal. As mandated by `ORIGINAL_REQUEST.md`, the platform is designed as an all-in-one web portal centralizing official administrative announcements, residential read tracking per property with WhatsApp reminder generation, and a local community business directory ("Mercado Laureles").

The core architectural constraints are:
1. **Zero External Database Daemons & Zero Native C++ Compilation**: Leveraging Node.js v24's native, built-in `node:sqlite` module (`DatabaseSync`), which completely eliminates dependencies on `better-sqlite3`, `sqlite3`, `node-gyp`, Python, or C++ compilers.
2. **On-Demand SSR Framework**: Utilizing Astro in Server-Side Rendering (SSR) mode with `@astrojs/node` in `standalone` mode (`output: 'server'`), delivering high-speed dynamic server rendering, file-based routing, and REST API endpoints.
3. **Mobile-First WhatsApp-Optimized Responsive UX**: Styled with Tailwind CSS, explicitly engineered for residents opening announcements directly from mobile WhatsApp messages, featuring touch targets >= 44px, sober contemporary design, and instant visual urgency cues.

---

## 2. Execution Environment & Package Configuration

### 2.1 Host Environment Characteristics
- **Operating System:** Windows (NT kernel, strict file locking semantics).
- **Runtime Target:** Node.js v24 LTS/Current (with native `node:sqlite` built-in).
- **Module System:** ES Modules (`"type": "module"` in `package.json`).
- **Initial Workspace State:** The existing `package.json` defines `"type": "commonjs"` without framework dependencies. It must be updated to `"type": "module"` with Astro, `@astrojs/node`, and Tailwind CSS.

### 2.2 Recommended `package.json` Specification
```json
{
  "name": "comunicados-laureles",
  "version": "1.0.0",
  "description": "Portal Comunitario y Web Residencial Urbanización Los Laureles",
  "type": "module",
  "scripts": {
    "dev": "astro dev --host",
    "build": "astro build",
    "preview": "astro preview",
    "start": "node ./dist/server/entry.mjs"
  },
  "dependencies": {
    "@astrojs/node": "^8.3.0",
    "@astrojs/tailwind": "^5.1.0",
    "astro": "^4.16.0",
    "tailwindcss": "^3.4.10"
  },
  "devDependencies": {
    "@types/node": "^22.5.0",
    "typescript": "^5.5.4"
  }
}
```

*Note on `node:sqlite`:* It is a Node.js standard library module (`node:sqlite`). It is NOT installed via npm and requires no entry in `dependencies`.

---

## 3. Node.js v24 Native `node:sqlite` In-Depth Technical Specification

The `node:sqlite` module provides a synchronous, thread-safe binding to the embedded SQLite library included within the Node.js binary.

### 3.1 Module Import
```javascript
import { DatabaseSync, StatementSync, Session, backup, constants } from 'node:sqlite';
```

### 3.2 `DatabaseSync` API Specification
- **Constructor:** `new DatabaseSync(location[, options])`
  - `location`: File path (string, Buffer, or URL) or `':memory:'` for in-memory databases. Recommended relative path: `data/laureles.db` resolved via `path.resolve()`.
  - `options`:
    - `open` (`boolean`, default: `true`): Opens database immediately upon instantiation.
    - `readOnly` (`boolean`, default: `false`): Open in read-only mode.
    - `enableForeignKeyConstraints` (`boolean`, default: `true`): Enforces foreign key constraints at connection level.
    - `timeout` (`number`, default: `0`): Busy timeout in milliseconds for file locks. Crucial for Windows to prevent immediate `SQLITE_BUSY` errors (set to `5000` ms).
    - `allowExtension` (`boolean`, default: `false`): Restricts loading untrusted C extensions.
- **Methods:**
  - `database.open()`: Opens the connection if initialized with `open: false`.
  - `database.close()`: Closes connection. Throws if prepared statements or transactions remain open.
  - `database.exec(sql: string): void`: Executes one or more raw SQL commands (semicolon-separated). Used for schema migration, DDL (`CREATE TABLE`), and PRAGMAs. Does not return rows.
  - `database.prepare(sql: string): StatementSync`: Compiles and returns a prepared statement.
  - `database.function(name: string, optionsOrFn, maybeFn): void`: Registers a custom SQL scalar function in JavaScript.
  - `database.aggregate(name: string, options): void`: Registers a custom SQL aggregate function (with `start` and `step`).
  - `database.createSession([options]): Session`: Creates a change tracking session.
  - `database.applyChangeset(changeset: Uint8Array[, options]): void`: Applies binary changesets.

### 3.3 `StatementSync` API Specification
Prepared statements are cached and compiled query handles.
- **`statement.run(...params): { lastInsertRowid: number | bigint, changes: number | bigint }`**:
  Executes DML queries (`INSERT`, `UPDATE`, `DELETE`).
- **`statement.get(...params): Record<string, any> | undefined`**:
  Executes query and returns the first row as an object with column names as keys, or `undefined` if no matching row.
- **`statement.all(...params): Record<string, any>[]`**:
  Executes query and returns all matching rows as an array of plain JavaScript objects.
- **`statement.iterate(...params): IterableIterator<Record<string, any>>`**:
  Returns a generator yielding rows one by one for memory-efficient iteration.
- **`statement.setAllowBareNamedParameters(enabled: boolean): void`**:
  When set to `true`, permits binding JavaScript objects with bare keys (`{ name: 'val' }`) to SQL named parameters (`:name`).
- **`statement.setReadBigInts(enabled: boolean): void`**:
  When set to `true`, SQLite `INTEGER` values exceeding JavaScript safe integer range are returned as `BigInt`.
- **`statement.columns(): Array<{ name: string, column: string | null, table: string | null, database: string | null, type: string | null }>`**:
  Returns column metadata for query output.

### 3.4 Parameter Binding Rules
1. **Positional Parameters (`?` or `?1`, `?2`)**:
   Passed as variable arguments: `statement.all(val1, val2)`.
2. **Named Parameters (`:param`, `@param`, `$param`)**:
   Passed as an object: `statement.all({ ':param': val })`, or `statement.all({ param: val })` if `statement.setAllowBareNamedParameters(true)` is activated.
3. **Data Type Mappings:**
   - JS `string` <-> SQLite `TEXT`
   - JS `number` <-> SQLite `INTEGER` / `REAL`
   - JS `bigint` <-> SQLite `INTEGER`
   - JS `null` / `undefined` <-> SQLite `NULL`
   - JS `Uint8Array` / `Buffer` <-> SQLite `BLOB`
   - JS `boolean` -> Must be bound as `1` or `0` (or SQLite `INTEGER`), as passing raw objects/symbols throws unsupported type errors.

### 3.5 Essential PRAGMAs & Reliability Configuration
To guarantee zero corruption, high performance, and Windows compatibility, the database singleton must execute the following PRAGMAs on startup:
```sql
PRAGMA journal_mode = WAL;         -- Enables Write-Ahead Logging (concurrent reads & writes)
PRAGMA synchronous = NORMAL;       -- Balances speed with safety in WAL mode
PRAGMA foreign_keys = ON;          -- Enforces relational integrity on constraints
PRAGMA busy_timeout = 5000;        -- Waits up to 5000ms if a file lock is encountered
PRAGMA cache_size = -2000;         -- Allocates ~2MB page cache
```

### 3.6 Transaction Control Pattern
Since `DatabaseSync` does not expose a higher-level transaction wrapper method, transactions must follow an explicit `BEGIN` / `COMMIT` / `ROLLBACK` try-catch block:
```typescript
export function runTransaction<T>(fn: () => T): T {
  db.exec('BEGIN TRANSACTION');
  try {
    const result = fn();
    db.exec('COMMIT');
    return result;
  } catch (err) {
    db.exec('ROLLBACK');
    throw err;
  }
}
```

---

## 4. Astro SSR Architecture & Node Adapter Specification

### 4.1 Configuration: `astro.config.mjs`
```javascript
import { defineConfig } from 'astro/config';
import node from '@astrojs/node';
import tailwind from '@astrojs/tailwind';

export default defineConfig({
  output: 'server',
  adapter: node({
    mode: 'standalone', // Self-contained server listening on process.env.PORT || 4321
  }),
  integrations: [
    tailwind({
      applyBaseStyles: true,
    }),
  ],
  server: {
    port: 4321,
    host: true, // Listens on 0.0.0.0 for mobile LAN testing
  },
});
```

### 4.2 Database Singleton Pattern (`src/lib/db.ts`)
Because Astro SSR in `standalone` mode runs as a persistent Node.js process, a module-level singleton keeps a single open connection across all SSR requests and API calls:
```typescript
// src/lib/db.ts
import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';
import fs from 'node:fs';

const DB_DIR = path.resolve(process.cwd(), 'data');
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

const DB_PATH = path.join(DB_DIR, 'laureles.db');
const db = new DatabaseSync(DB_PATH, {
  timeout: 5000,
  enableForeignKeyConstraints: true,
});

// Configure WAL mode and pragmas
db.exec(`
  PRAGMA journal_mode = WAL;
  PRAGMA synchronous = NORMAL;
  PRAGMA foreign_keys = ON;
  PRAGMA busy_timeout = 5000;
`);

export default db;
```

### 4.3 API Routes / Server Endpoints (`APIRoute`)
Astro provides Web API-compliant `Request` and `Response` interfaces for endpoints in `src/pages/api/`.

#### Confirmation of Read Endpoint (`src/pages/api/reads.ts`)
```typescript
import type { APIRoute } from 'astro';
import db from '../../lib/db';

export const POST: APIRoute = async ({ request }) => {
  try {
    const data = await request.json();
    const { announcementId, block, houseNumber, fullName, role } = data;

    if (!announcementId || !block || !houseNumber || !fullName || !role) {
      return new Response(JSON.stringify({ error: 'Todos los campos son obligatorios' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Verify property exists in residential census
    const censusCheck = db.prepare('SELECT id FROM residential_census WHERE block = ? AND house_number = ?').get(block, houseNumber);
    if (!censusCheck) {
      return new Response(JSON.stringify({ error: 'El inmueble indicado no figura en el padrón oficial' }), {
        status: 422,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Insert confirmation (unique index on announcement_id + block + house_number prevents duplicates)
    const insertStmt = db.prepare(`
      INSERT INTO announcement_reads (announcement_id, block, house_number, full_name, role, read_at)
      VALUES (?, ?, ?, ?, ?, datetime('now', 'localtime'))
    `);

    insertStmt.run(announcementId, block, houseNumber, fullName, role);

    return new Response(JSON.stringify({ success: true, message: 'Lectura confirmada exitosamente' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    if (err.message && err.message.includes('UNIQUE constraint failed')) {
      return new Response(JSON.stringify({ error: 'Este inmueble ya confirmó la lectura de este comunicado' }), {
        status: 409,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    return new Response(JSON.stringify({ error: 'Error interno del servidor', details: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
```

#### CSV Export Endpoint (`src/pages/api/export-reads.ts`)
```typescript
import type { APIRoute } from 'astro';
import db from '../../lib/db';

export const GET: APIRoute = async ({ request }) => {
  const url = new URL(request.url);
  const announcementId = url.searchParams.get('announcementId');

  let query = `
    SELECT 
      c.block AS "Manzana/Torre",
      c.house_number AS "Casa/Apto",
      r.full_name AS "Vecino que Confirmó",
      r.role AS "Rol",
      r.read_at AS "Fecha y Hora Confirmación",
      CASE WHEN r.id IS NOT NULL THEN 'CONFIRMADO' ELSE 'PENDIENTE' END AS "Estado"
    FROM residential_census c
    LEFT JOIN announcement_reads r 
      ON c.block = r.block AND c.house_number = r.house_number AND r.announcement_id = ?
    ORDER BY c.block ASC, CAST(c.house_number AS INTEGER) ASC
  `;

  const rows = db.prepare(query).all(announcementId || 0);

  // Generate CSV with UTF-8 BOM for Excel compatibility
  const BOM = '\uFEFF';
  const headers = ['"Manzana/Torre"', '"Casa/Apto"', '"Vecino que Confirmó"', '"Rol"', '"Fecha y Hora"', '"Estado"'];
  const csvLines = rows.map((r: any) => 
    `"${r['Manzana/Torre']}","${r['Casa/Apto']}","${r['Vecino que Confirmó'] || ''}","${r['Rol'] || ''}","${r['Fecha y Hora Confirmación'] || ''}","${r['Estado']}"`
  );

  const csvContent = BOM + [headers.join(','), ...csvLines].join('\r\n');

  return new Response(csvContent, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="constancia_lecturas_comunicado_${announcementId}.csv"`,
      'Cache-Control': 'no-store',
    },
  });
};
```

---

## 5. Responsive Mobile-First & WhatsApp Optimization Specification

### 5.1 Design Principles for Residents on WhatsApp
Residents access announcements by clicking links shared in community WhatsApp groups (e.g. `https://laureles.comunidad/comunicados/convocatoria-asamblea`).

1. **Tap Target Accessibility:** Touch targets (buttons, links, form inputs) must have a minimum interactive height of `48px` (`h-12` or `min-h-[44px]`).
2. **Instant Visual Hierarchy:**
   - Urgent banners: `bg-red-600 text-white font-bold p-3 rounded-lg shadow-sm animate-pulse`
   - Category badges:
     - *Urgente / Alertas:* Red (`bg-red-100 text-red-800 border-red-200`)
     - *Mantenimiento:* Amber (`bg-amber-100 text-amber-800 border-amber-200`)
     - *Convocatorias:* Blue (`bg-blue-100 text-blue-800 border-blue-200`)
     - *Normas de Convivencia:* Emerald (`bg-emerald-100 text-emerald-800 border-emerald-200`)
     - *Finanzas / Cuotas:* Purple (`bg-purple-100 text-purple-800 border-purple-200`)
3. **Progress Bar for Community Read-Confirmation:**
   - Displayed prominently at top of announcement: "78% de los inmuebles han confirmado lectura (156 de 200 casas)".
   - Color coded: Red (<50%), Yellow (50-79%), Green (>=80%).
4. **WhatsApp Direct Links ("Mercado Laureles"):**
   - Format: `https://wa.me/{country_code}{phone_number}?text={encoded_text}`
   - Pre-filled message example:
     `Hola [Nombre Negocio], vi su emprendimiento en Mercado Laureles y deseo hacer una consulta.`
   - Encoded using `encodeURIComponent()`.
5. **1-Click WhatsApp Reminder Tool (/admin):**
   - Query all census houses that have not yet confirmed for a specific announcement.
   - Format WhatsApp message:
     ```text
     📢 *RECORDATORIO URGENTE - URBANIZACIÓN LOS LAURELES*
     Comunicado: *[Título del Comunicado]*
     Enlace directo para confirmar: [URL]
     
     Inmuebles pendientes de confirmación ([Total Pendientes]):
     - Mz A: Casa 3, Casa 5, Casa 12
     - Mz B: Casa 1, Casa 8
     ...
     Por favor confirmar su lectura ingresando al enlace. ¡Muchas gracias!
     ```
   - Client-side copy button using `navigator.clipboard.writeText()` with visual "Copiado al portapapeles" feedback.

---

## 6. Features Discovered

| # | Category | Feature | Description | Inputs | Outputs | Error Behavior | Discovered Via |
|---|----------|---------|-------------|--------|---------|----------------|----------------|
| 1 | Runtime Database | `DatabaseSync` Constructor | Instantiates synchronous SQLite database connection | `path: string`, `options: { timeout, enableForeignKeyConstraints, readonly, open }` | `DatabaseSync` instance | Throws `ERR_SQLITE_ERR` if path invalid or permissions denied | Node.js v24 API Specs |
| 2 | Runtime Database | `db.exec()` | Executes raw multi-statement SQL strings without returning rows | `sql: string` | `void` | Throws error if SQL syntax invalid or constraint violated | Node.js v24 API Specs |
| 3 | Runtime Database | `db.prepare()` | Compiles SQL statement into prepared query handle | `sql: string` | `StatementSync` instance | Throws syntax error if query malformed | Node.js v24 API Specs |
| 4 | Query Execution | `statement.run()` | Executes DML statement (`INSERT`, `UPDATE`, `DELETE`) | Bound parameter values | `{ lastInsertRowid: number, changes: number }` | Throws `UNIQUE constraint failed` or `CHECK constraint failed` | Node.js v24 API Specs |
| 5 | Query Execution | `statement.get()` | Fetches single row as JavaScript object | Bound parameter values | `Record<string, any>` or `undefined` | Throws if parameter binding types mismatch | Node.js v24 API Specs |
| 6 | Query Execution | `statement.all()` | Fetches all matching rows as array of objects | Bound parameter values | `Array<Record<string, any>>` | Throws if parameter binding types mismatch | Node.js v24 API Specs |
| 7 | Query Execution | `statement.iterate()` | Memory-efficient row-by-row iterator | Bound parameter values | `IterableIterator<Record<string, any>>` | Throws during iteration if connection interrupted | Node.js v24 API Specs |
| 8 | Parameter Binding | `statement.setAllowBareNamedParameters()` | Allows object keys without `:` or `@` prefix for named parameters | `enabled: boolean` | `void` | If false, binding bare object keys throws unsupported parameter error | Node.js v24 API Specs |
| 9 | Parameter Binding | `statement.setReadBigInts()` | Toggles return of 64-bit integers as native JS `BigInt` | `enabled: boolean` | `void` | Throws if non-boolean passed | Node.js v24 API Specs |
| 10 | Query Inspection | `statement.columns()` | Returns column schema metadata for prepared statement | None | `Array<{ name, column, table, database, type }>` | Returns empty array for statements without results | Node.js v24 API Specs |
| 11 | Concurrency | WAL Journal Mode | Write-Ahead Logging allows non-blocking simultaneous readers and one writer | `PRAGMA journal_mode = WAL;` | String (`"wal"`) | Falls back to rollback journal on read-only filesystems | SQLite Architecture |
| 12 | Lock Handling | SQLite Busy Timeout | Configures retry loop when file lock is held by another handle | `PRAGMA busy_timeout = 5000;` | `void` | If lock persists beyond timeout, throws `SQLITE_BUSY` | SQLite Architecture |
| 13 | Backup Engine | `node:sqlite.backup()` | Non-blocking database file backup to disk | `sourceDb: DatabaseSync`, `destPath: string`, `options` | `Promise<number>` (pages transferred) | Rejects promise if disk full or destination unwritable | Node.js v24 API Specs |
| 14 | Change Tracking | `Session` Class | Tracks table row alterations and serializes binary changesets | `db.createSession()` | `Session` instance | Throws if table not in session tracking scope | Node.js v24 API Specs |
| 15 | SSR Architecture | Astro Node Adapter (`@astrojs/node`) | Hosts Astro server endpoints and SSR page rendering on Node.js | `astro.config.mjs` with `output: 'server'` | Node.js HTTP server entry point | Crashes if configured port already in use | Astro SSR Documentation |
| 16 | API Routing | Astro `APIRoute` Handlers | Web-standard Request/Response endpoints for REST operations | `({ request, params, cookies, redirect })` | Standard Web `Response` | Unhandled exceptions trigger HTTP 500 internal server error | Astro Routing Docs |
| 17 | Export Service | CSV Streaming Endpoint | Sends UTF-8 encoded CSV with Excel BOM for read compliance | HTTP GET with query params | HTTP Response with `Content-Type: text/csv` | Returns 400/404 if announcement not found | Web Standards / RFC 4180 |
| 18 | Styling System | Mobile-First Tailwind | Utility classes apply mobile layout by default, responsive with `md:` and `lg:` | `tailwind.config.mjs` + Astro integration | Generated scoped CSS bundle | Unused classes purged in production build | Tailwind CSS Docs |
| 19 | Admin Security | PIN / Passcode Protection | Simple administration session auth via signed/encrypted cookie or bearer header | PIN entered in `/admin` login | HTTP 200 + session cookie or HTTP 401 Unauthorized | Rejects invalid PIN with visual alert | Requirement R4 |
| 20 | External Bridge | WhatsApp Deep Linking | Direct trigger for resident chat with prefilled text | `https://wa.me/{phone}?text={encoded}` | Native WhatsApp or Web client open | Broken link if phone number contains spaces or invalid chars | WhatsApp URL Scheme |

---

## 7. Edge Cases

| # | Feature | Input | Observed Behavior |
|---|---------|-------|-------------------|
| 1 | `DatabaseSync.close()` on Windows | Closing database while prepared statements are active in memory | Windows file handle locking causes `EBUSY` or prevents file deletion/rename until process exits or statement GC occurs |
| 2 | Duplicate Property Read Confirmation | Submitting confirmation with already confirmed `(announcement_id, block, house_number)` | SQLite throws `SQLITE_CONSTRAINT_UNIQUE`; API must catch and return HTTP 409 Conflict with friendly Spanish message |
| 3 | Unknown Property in Read Form | Submitting confirmation for non-existent block/house (e.g. "Mz Z Casa 999") | Census query returns `undefined`; API rejects with HTTP 422 Unprocessable Entity ("Inmueble no figura en el padrón") |
| 4 | Positional vs Named Parameter Binding | Passing plain JS object `{ id: 1 }` to query with `WHERE id = ?` | Throws "Unsupported type" error because object is treated as a single parameter value rather than positional list |
| 5 | Bare Named Parameter Binding | Passing `{ name: 'Juan' }` to query `WHERE name = :name` without setting allow bare | Throws parameter binding error; requires either `:name` key or `statement.setAllowBareNamedParameters(true)` |
| 6 | Boolean Values in Node:SQLite | Binding JS `true` or `false` directly to SQL parameter | Node.js `node:sqlite` treats boolean strictly; recommended to explicitly pass `1` or `0` to prevent runtime type exceptions |
| 7 | CSV Export Special Characters | Resident names with commas, accents, quotes or semicolons (e.g. `García, Jr. "Pepe"`) | Must wrap fields in double quotes and escape internal quotes (`""`) with UTF-8 BOM (`\uFEFF`) so Excel opens without corruption |
| 8 | WhatsApp Pre-filled URL Encoding | Long missing houses list with spaces, newlines, and asterisks | Must run through `encodeURIComponent()` to avoid URL truncation or malformed URI syntax in mobile browsers |
| 9 | Mobile In-App Browser Viewport | Opening announcement inside WhatsApp embedded Webview (iOS / Android) | WhatsApp webview modifies viewport height (`100vh` bug); must use `min-h-screen` or `svh`/`dvh` viewport units in CSS |
| 10 | Concurrency in WAL Mode | Concurrent write transactions during peak announcement confirmation | Single writer lock is held; `PRAGMA busy_timeout = 5000` queues waiting writes up to 5 seconds before throwing `SQLITE_BUSY` |
| 11 | Empty or Blank Filter Searches | Submitting search query with whitespace or empty category | Query must treat empty strings as wildcards (`LIKE '%'`) rather than returning zero matches |
| 12 | Inactive / Pending Business Listings | Unapproved submissions queried on public "Mercado Laureles" page | Must strictly filter `WHERE status = 'aprobado'` so pending or rejected businesses remain hidden from public view |

---

## 8. Database Schema Design for Los Laureles

Based on all requirements in `ORIGINAL_REQUEST.md`, the persistent SQLite schema requires five core relational tables:

```sql
-- 1. Residential Census (Padrón Oficial)
CREATE TABLE IF NOT EXISTS residential_census (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  block TEXT NOT NULL,                  -- Manzana / Torre (ej. "Mz A", "Mz B", "Torre 1")
  house_number TEXT NOT NULL,           -- Casa / Apto (ej. "01", "12", "101")
  owner_name TEXT NOT NULL,             -- Propietario registrado
  resident_type TEXT DEFAULT 'propietario', -- 'propietario' | 'inquilino'
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(block, house_number)
);

-- 2. Official Announcements (Muro de Comunicados)
CREATE TABLE IF NOT EXISTS announcements (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  summary TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT NOT NULL,               -- 'urgente', 'mantenimiento', 'convocatoria', 'convivencia', 'finanzas'
  target_audience TEXT DEFAULT 'todos', -- 'todos', 'propietarios', 'inquilinos'
  is_urgent INTEGER DEFAULT 0,          -- 1 = Urgente (badge destacado)
  deadline_date TEXT,                   -- Fecha límite (opcional)
  is_pinned INTEGER DEFAULT 0,          -- 1 = Fijado en la parte superior
  is_archived INTEGER DEFAULT 0,        -- 1 = Archivado
  views_count INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 3. Read Tracking & Confirmations (Confirmación de Lectura)
CREATE TABLE IF NOT EXISTS announcement_reads (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  announcement_id INTEGER NOT NULL,
  block TEXT NOT NULL,
  house_number TEXT NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL,                   -- 'propietario' | 'inquilino'
  read_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (announcement_id) REFERENCES announcements(id) ON DELETE CASCADE,
  UNIQUE(announcement_id, block, house_number) -- Un solo registro por casa por comunicado
);

-- 4. Neighborhood Business Directory (Mercado Laureles)
CREATE TABLE IF NOT EXISTS marketplace_listings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  category TEXT NOT NULL,               -- 'comida', 'ropa', 'servicios', 'gasfiteria', 'belleza', 'otros'
  description TEXT NOT NULL,
  schedule TEXT,                        -- Horario de atención
  owner_name TEXT NOT NULL,
  block TEXT NOT NULL,
  house_number TEXT NOT NULL,
  whatsapp_number TEXT NOT NULL,        -- Número de WhatsApp (ej. '51987654321')
  image_url TEXT,                       -- Foto o ícono representativo
  status TEXT DEFAULT 'pendiente',      -- 'pendiente', 'aprobado', 'rechazado'
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 5. Administration Audit & Credentials
CREATE TABLE IF NOT EXISTS admin_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);
```

---

## 9. Recommendations & Implementation Roadmap

1. **Phase 1: Project Initialization & Persistence Engine (Milestone 1)**
   - Update `package.json` with `"type": "module"` and required Astro/Tailwind dependencies.
   - Configure `astro.config.mjs` with `output: 'server'` and `@astrojs/node` standalone adapter.
   - Implement `src/lib/db.ts` database singleton with automated schema execution and initial seed migration (structured census with ~50-100 real Laureles properties, 3 seed announcements, and sample marketplace listings).

2. **Phase 2: Public Portal & Announcements Board (Milestone 2)**
   - Implement responsive layout with navigation, emergency directory, gatehouse contact, and administration contacts.
   - Build announcements feed with category filtering, search bar (client or server-driven), and urgency indicators.

3. **Phase 3: Interactive Read Confirmation & Metrics (Milestone 3)**
   - Implement read confirmation form on announcement detail page (`/comunicados/[slug]`).
   - Implement server API route `/api/reads` with census verification and duplicate blocking.
   - Calculate and display live community read percentage bar.

4. **Phase 4: Mercado Laureles Directory (Milestone 4)**
   - Implement `/mercado` catalog with category chips (Comida, Ropa, Servicios, etc.).
   - Create WhatsApp action button with dynamic prefilled message generator.
   - Create public submission modal/form posting to `/api/listings` with `pendiente` status.

5. **Phase 5: Administration Control Center (Milestone 5)**
   - Build `/admin` protected dashboard with PIN passcode auth.
   - Detail view of read confirmations: list of confirmed properties and missing properties.
   - 1-Click WhatsApp reminder copy tool with missing property breakdown.
   - CSV export route (`/api/export-reads?announcementId=...`).
   - Announcements management (CRUD) and marketplace listings vetting (Approve/Reject).

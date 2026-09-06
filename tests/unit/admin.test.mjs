import test, { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import crypto from 'node:crypto';
import { getDb, initSchema, seedDatabase, closeDb } from '../../src/lib/db.ts';
import {
  validateAdminPin,
  createAdminSession,
  validateAdminSession,
  deleteAdminSession,
  ADMIN_SESSION_COOKIE,
  SESSION_EXPIRY_SECONDS
} from '../../src/lib/auth.ts';
import { generateAttendanceCsv } from '../../src/lib/csv.ts';

describe('Urbanización Los Laureles — Admin & Management Unit Suite (Milestone 5 / R4)', () => {
  let db;
  const dbPath = path.resolve(process.cwd(), 'data', 'laureles.db');

  before(() => {
    db = getDb(dbPath);
    initSchema(db);
    seedDatabase(db);
  });

  after(() => {
    closeDb();
  });

  // ==========================================
  // 1. PIN Authentication & Session Management (auth.ts)
  // ==========================================
  describe('1. Admin PIN Authentication & Session Token Issuance', () => {
    it('should validate default PINs (1234 and 123456) when ADMIN_PIN is unset', () => {
      const originalEnv = process.env.ADMIN_PIN;
      delete process.env.ADMIN_PIN;

      assert.strictEqual(validateAdminPin('1234'), true, 'Default PIN 1234 should be accepted');
      assert.strictEqual(validateAdminPin('123456'), true, 'E2E Default PIN 123456 should be accepted');
      assert.strictEqual(validateAdminPin(1234), true, 'Numeric 1234 should be accepted');

      process.env.ADMIN_PIN = originalEnv;
    });

    it('should respect custom ADMIN_PIN environment variable', () => {
      const originalEnv = process.env.ADMIN_PIN;
      process.env.ADMIN_PIN = 'custom_secret_pin_2026';

      assert.strictEqual(validateAdminPin('custom_secret_pin_2026'), true);
      assert.strictEqual(validateAdminPin('1234'), false);
      assert.strictEqual(validateAdminPin('123456'), false);

      if (originalEnv !== undefined) {
        process.env.ADMIN_PIN = originalEnv;
      } else {
        delete process.env.ADMIN_PIN;
      }
    });

    it('should reject invalid, empty, or non-string PIN attempts', () => {
      assert.strictEqual(validateAdminPin('wrong_pin'), false);
      assert.strictEqual(validateAdminPin('0000'), false);
      assert.strictEqual(validateAdminPin(''), false);
      assert.strictEqual(validateAdminPin('   '), false);
      assert.strictEqual(validateAdminPin(null), false);
      assert.strictEqual(validateAdminPin(undefined), false);
    });

    it('should generate a 256-bit cryptographically secure session token in database', () => {
      const token = createAdminSession(db);
      assert.ok(token, 'Token must not be empty');
      assert.strictEqual(token.length, 64, 'Token must be a 64-char hexadecimal string (32 bytes / 256 bits)');
      assert.match(token, /^[0-9a-f]{64}$/i, 'Token must match hex pattern');

      // Verify persistence in SQLite admin_sessions
      const row = db.prepare('SELECT * FROM admin_sessions WHERE token = ?').get(token);
      assert.ok(row, 'Session must exist in admin_sessions table');
      assert.strictEqual(row.token, token);
      assert.ok(row.expires_at, 'Session must have an expires_at timestamp');

      // Verify expiration is in the future
      const expiresAt = new Date(row.expires_at).getTime();
      assert.ok(expiresAt > Date.now(), 'Session must not be expired upon creation');
    });

    it('should validate valid active session tokens and reject non-existent or expired tokens', () => {
      const token = createAdminSession(db);
      assert.strictEqual(validateAdminSession(db, token), true, 'Fresh session must be valid');

      // Non-existent tokens
      assert.strictEqual(validateAdminSession(db, 'non_existent_token_12345'), false);
      assert.strictEqual(validateAdminSession(db, ''), false);
      assert.strictEqual(validateAdminSession(db, null), false);

      // Expired token simulation
      const expiredToken = crypto.randomBytes(32).toString('hex');
      const pastTime = new Date(Date.now() - 3600 * 1000).toISOString(); // 1 hour ago
      db.prepare("INSERT INTO admin_sessions (token, created_at, expires_at) VALUES (?, datetime('now', '-2 hours'), ?)").run(expiredToken, pastTime);

      assert.strictEqual(validateAdminSession(db, expiredToken), false, 'Expired session must return false');
    });

    it('should properly revoke sessions upon logout (deleteAdminSession)', () => {
      const token = createAdminSession(db);
      assert.strictEqual(validateAdminSession(db, token), true);

      deleteAdminSession(db, token);
      assert.strictEqual(validateAdminSession(db, token), false, 'Revoked session must no longer be valid');

      const check = db.prepare('SELECT * FROM admin_sessions WHERE token = ?').get(token);
      assert.strictEqual(check, undefined, 'Session record must be deleted from admin_sessions');
    });
  });

  // ==========================================
  // 2. CSV Attendance Export & UTF-8 BOM Verification (csv.ts)
  // ==========================================
  describe('2. CSV Export Generation & UTF-8 BOM Integrity', () => {
    it('should prepend UTF-8 Byte Order Mark (\\uFEFF) to guarantee Excel accents rendering', () => {
      const sampleRows = [
        {
          manzana: 'Mz. A',
          lote: 'Lote 01',
          address: 'Calle Los Rosales 101',
          residentName: 'Carlos Alberto Mendoza Silva',
          role: 'Propietario',
          confirmedAt: '2026-09-01T11:20:00Z',
          confirmed: true,
          status: 'CONFIRMADO'
        }
      ];

      const csv = generateAttendanceCsv('Asamblea 2026', sampleRows);
      assert.ok(csv.startsWith('\uFEFF'), 'CSV output must strictly start with \\uFEFF (UTF-8 BOM)');
    });

    it('should produce standard Spanish header columns separated by semicolon delimiter', () => {
      const csv = generateAttendanceCsv('Asamblea 2026', []);
      const lines = csv.replace(/^\uFEFF/, '').split('\r\n');
      const headerLine = lines[0];

      const expectedHeaders = [
        'Manzana',
        'Lote',
        'Codigo_Inmueble',
        'Direccion',
        'Residente',
        'Rol',
        'Fecha_Hora',
        'Estado'
      ];

      assert.strictEqual(headerLine, expectedHeaders.join(';'), 'Headers must match exact Spanish schema');
    });

    it('should handle full_census mode vs confirmed_only mode properly', () => {
      const rows = [
        { manzana: 'Mz. A', lote: 'Lote 01', residentName: 'Vecino 1', confirmed: true, status: 'CONFIRMADO', confirmedAt: '2026-09-01T10:00:00Z' },
        { manzana: 'Mz. A', lote: 'Lote 02', residentName: 'Vecino 2', confirmed: false, status: 'PENDIENTE', confirmedAt: null },
        { manzana: 'Mz. A', lote: 'Lote 03', residentName: 'Vecino 3', confirmed: true, status: 'CONFIRMADO', confirmedAt: '2026-09-01T12:00:00Z' }
      ];

      const fullCsv = generateAttendanceCsv('Test', rows, { mode: 'full_census' });
      const fullLines = fullCsv.replace(/^\uFEFF/, '').trim().split('\r\n');
      assert.strictEqual(fullLines.length, 4, '1 header + 3 rows = 4 lines in full census mode');

      const confirmedCsv = generateAttendanceCsv('Test', rows, { mode: 'confirmed_only' });
      const confirmedLines = confirmedCsv.replace(/^\uFEFF/, '').trim().split('\r\n');
      assert.strictEqual(confirmedLines.length, 3, '1 header + 2 confirmed rows = 3 lines in confirmed_only mode');
    });

    it('should safely escape commas, semicolons, and quotes in text fields', () => {
      const rowWithSpecialChars = [
        {
          manzana: 'Mz. A',
          lote: 'Lote 05',
          address: 'Calle Los Rosales 109, Dpto "B"; interior',
          residentName: 'Gómez, Carlos & "Socio"',
          role: 'Propietario',
          confirmed: true
        }
      ];

      const csv = generateAttendanceCsv('Test Special', rowWithSpecialChars);
      assert.ok(csv.includes('"Calle Los Rosales 109, Dpto ""B""; interior"'));
      assert.ok(csv.includes('"Gómez, Carlos & ""Socio"""'));
    });
  });

  // ==========================================
  // 3. Read Coverage & Missing Houses Calculations
  // ==========================================
  describe('3. Read Coverage Statistics & Missing Houses Grouping', () => {
    it('should calculate accurate coverage percentage for Announcement 1 (seeded with 21 reads)', () => {
      const totalCensus = 52;
      const countResult = db.prepare('SELECT COUNT(DISTINCT property_id) as count FROM read_confirmations WHERE announcement_id = 1').get();
      const confirmedCount = countResult.count;
      assert.strictEqual(confirmedCount, 21, 'Announcement 1 should have exactly 21 seeded confirmations');

      const rawPercentage = (confirmedCount / totalCensus) * 100;
      const percentage = Math.round(rawPercentage * 10) / 10;
      assert.strictEqual(percentage, 40.4, '21/52 must equal exactly 40.4% coverage');
    });

    it('should accurately list all missing (pending) properties partitioned across blocks', () => {
      const totalCensusProperties = db.prepare('SELECT * FROM census_properties WHERE is_active = 1').all();
      assert.strictEqual(totalCensusProperties.length, 52);

      const confirmedPropertyIds = new Set(
        db.prepare('SELECT property_id FROM read_confirmations WHERE announcement_id = 1').all().map(r => r.property_id)
      );

      const missing = totalCensusProperties.filter(p => !confirmedPropertyIds.has(p.id));
      assert.strictEqual(missing.length, 31, '52 total - 21 confirmed = 31 missing houses');

      // Group missing by block (Manzana)
      const grouped = {};
      for (const item of missing) {
        if (!grouped[item.manzana]) grouped[item.manzana] = [];
        grouped[item.manzana].push(item.lote);
      }

      assert.ok(grouped['Mz. A'], 'Manzana A must have missing houses');
      assert.ok(grouped['Mz. B'], 'Manzana B must have missing houses');
      assert.ok(grouped['Mz. C'], 'Manzana C must have missing houses');
      assert.ok(grouped['Mz. D'], 'Manzana D must have missing houses');
      assert.ok(grouped['Mz. E'], 'Manzana E must have missing houses');
    });
  });

  // ==========================================
  // 4. 1-Click WhatsApp Reminder Format Generation
  // ==========================================
  describe('4. WhatsApp Reminder Message Format & Grouping Engine', () => {
    it('should format announcement reminder with title, public URL, progress stats and compact block grouping', () => {
      const title = 'Convocatoria Oficial: Asamblea General 2026';
      const url = 'https://loslaureles.pe/comunicados/asamblea-general-ordinaria-2026';
      const totalCensus = 52;
      const missingList = [
        { manzana: 'Mz. A', lote: 'Lote 04' },
        { manzana: 'Mz. A', lote: 'Lote 06' },
        { manzana: 'Mz. B', lote: 'Lote 02' }
      ];

      const missingCount = missingList.length;
      const confirmedCount = totalCensus - missingCount;
      const coveragePercent = Math.round((confirmedCount / totalCensus) * 100);

      const groupedByBlock = {};
      for (const item of missingList) {
        if (!groupedByBlock[item.manzana]) groupedByBlock[item.manzana] = [];
        groupedByBlock[item.manzana].push(item.lote);
      }

      let formattedHouses = '';
      for (const [block, lots] of Object.entries(groupedByBlock)) {
        formattedHouses += `• *${block}:* ${lots.join(', ')}\n`;
      }

      const msg =
`📢 *URBANIZACIÓN LOS LAURELES — COMUNICADO OFICIAL*
📋 *Asunto:* ${title}
🔗 *Leer y confirmar aquí:* ${url}

Estimados vecinos, la Junta Directiva solicita a los propietarios e inquilinos revisar este comunicado importante para la convivencia y seguridad de nuestra comunidad.

📊 *Avance de confirmación:* ${confirmedCount}/${totalCensus} inmuebles (${coveragePercent}%)
⏳ *Inmuebles pendientes por confirmar (${missingCount}):*
${formattedHouses}👉 Por favor ingrese al enlace, lea el comunicado y registre su Manzana y Lote en el botón de confirmación. ¡Agradecemos su valiosa colaboración!`;

      assert.ok(msg.includes('URBANIZACIÓN LOS LAURELES'));
      assert.ok(msg.includes(title));
      assert.ok(msg.includes(url));
      assert.ok(msg.includes('• *Mz. A:* Lote 04, Lote 06'));
      assert.ok(msg.includes('• *Mz. B:* Lote 02'));
      assert.ok(msg.includes('49/52 inmuebles (94%)'));
    });
  });

  // ==========================================
  // 5. Official Announcements CRUD Operations
  // ==========================================
  describe('5. Announcements CRUD Persistence in SQLite', () => {
    let createdId;
    const testSlug = `test-announcement-${Date.now()}`;

    it('should create and persist a new announcement', () => {
      const stmt = db.prepare(`
        INSERT INTO announcements (
          title, slug, summary, content, category, audience,
          is_urgent, deadline_date, pinned, archived, visit_count, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 0, datetime('now'), datetime('now'))
      `);

      const info = stmt.run(
        'Prueba Unitaria de Comunicado para Auditoría',
        testSlug,
        'Resumen de prueba unitaria para validar persistencia.',
        '# Contenido de Prueba\n\nEste es un comunicado de verificación.',
        'Mantenimiento',
        'General',
        1,
        '2026-10-31',
        0
      );

      createdId = Number(info.lastInsertRowid);
      assert.ok(createdId > 0, 'New announcement ID must be positive');

      const created = db.prepare('SELECT * FROM announcements WHERE id = ?').get(createdId);
      assert.strictEqual(created.title, 'Prueba Unitaria de Comunicado para Auditoría');
      assert.strictEqual(created.slug, testSlug);
      assert.strictEqual(created.is_urgent, 1);
      assert.strictEqual(created.pinned, 0);
      assert.strictEqual(created.archived, 0);
    });

    it('should update announcement details and updated_at timestamp', () => {
      const updateStmt = db.prepare(`
        UPDATE announcements
        SET title = ?, summary = ?, category = ?, is_urgent = ?, updated_at = datetime('now')
        WHERE id = ?
      `);

      updateStmt.run(
        'Título Modificado por Administrador',
        'Resumen modificado exitosamente.',
        'Urgente / Alertas',
        0,
        createdId
      );

      const updated = db.prepare('SELECT * FROM announcements WHERE id = ?').get(createdId);
      assert.strictEqual(updated.title, 'Título Modificado por Administrador');
      assert.strictEqual(updated.category, 'Urgente / Alertas');
      assert.strictEqual(updated.is_urgent, 0);
    });

    it('should toggle pinned and archived states correctly', () => {
      // Toggle Pin to 1
      db.prepare('UPDATE announcements SET pinned = 1 WHERE id = ?').run(createdId);
      let row = db.prepare('SELECT pinned, archived FROM announcements WHERE id = ?').get(createdId);
      assert.strictEqual(row.pinned, 1);

      // Toggle Pin back to 0
      db.prepare('UPDATE announcements SET pinned = 0 WHERE id = ?').run(createdId);
      row = db.prepare('SELECT pinned, archived FROM announcements WHERE id = ?').get(createdId);
      assert.strictEqual(row.pinned, 0);

      // Toggle Archive to 1
      db.prepare('UPDATE announcements SET archived = 1 WHERE id = ?').run(createdId);
      row = db.prepare('SELECT pinned, archived FROM announcements WHERE id = ?').get(createdId);
      assert.strictEqual(row.archived, 1);
    });

    it('should delete the announcement and verify removal', () => {
      db.prepare('DELETE FROM announcements WHERE id = ?').run(createdId);
      const row = db.prepare('SELECT * FROM announcements WHERE id = ?').get(createdId);
      assert.strictEqual(row, undefined, 'Announcement must be deleted from SQLite');
    });
  });

  // ==========================================
  // 6. Marketplace Moderation Status Transitions
  // ==========================================
  describe('6. Mercado Laureles Moderation & Status Updates', () => {
    let testListingId;

    before(() => {
      const stmt = db.prepare(`
        INSERT INTO marketplace_listings (
          title, description, category, entrepreneur_name,
          property_address, phone, schedule_hours, status, created_at, updated_at
        ) VALUES (
          'Prueba Cafetería del Parque',
          'Café de especialidad y pasteles caseros para vecinos.',
          'Gastronomía / Comida',
          'Carolina Mendoza',
          'Mz. C Lote 02',
          '987112233',
          'Lun-Vie 8am-6pm',
          'pending',
          datetime('now'),
          datetime('now')
        )
      `);
      const info = stmt.run();
      testListingId = Number(info.lastInsertRowid);
    });

    after(() => {
      if (testListingId) {
        db.prepare('DELETE FROM marketplace_listings WHERE id = ?').run(testListingId);
      }
    });

    it('should start with pending status', () => {
      const listing = db.prepare('SELECT status FROM marketplace_listings WHERE id = ?').get(testListingId);
      assert.strictEqual(listing.status, 'pending');
    });

    it('should transition status from pending to approved', () => {
      db.prepare("UPDATE marketplace_listings SET status = 'approved', updated_at = datetime('now') WHERE id = ?").run(testListingId);

      const listing = db.prepare('SELECT status FROM marketplace_listings WHERE id = ?').get(testListingId);
      assert.strictEqual(listing.status, 'approved', 'Listing status must be approved');
    });

    it('should transition status to rejected with admin notes', () => {
      db.prepare("UPDATE marketplace_listings SET status = 'rejected', admin_notes = ?, updated_at = datetime('now') WHERE id = ?")
        .run('Inmueble no registrado en el padrón', testListingId);

      const listing = db.prepare('SELECT status, admin_notes FROM marketplace_listings WHERE id = ?').get(testListingId);
      assert.strictEqual(listing.status, 'rejected');
      assert.strictEqual(listing.admin_notes, 'Inmueble no registrado en el padrón');
    });

    it('should enforce CHECK constraint on status column', () => {
      assert.throws(
        () => {
          db.prepare("UPDATE marketplace_listings SET status = 'invalid_status_enum' WHERE id = ?").run(testListingId);
        },
        /CHECK constraint failed/i,
        'Database must reject invalid marketplace status values'
      );
    });
  });
});

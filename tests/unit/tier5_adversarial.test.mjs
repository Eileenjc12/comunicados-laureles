import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import { getDb, initSchema, seedDatabase, closeDb } from '../../src/lib/db.ts';
import {
  sanitizePhone,
  formatDisplayPhone,
  generateWhatsAppLink,
  generateWhatsAppReminderMessage,
} from '../../src/lib/whatsapp.ts';
import { generateAttendanceCsv } from '../../src/lib/csv.ts';
import {
  validateAdminPin,
  createAdminSession,
  validateAdminSession,
  deleteAdminSession,
  ADMIN_SESSION_COOKIE,
  SESSION_EXPIRY_SECONDS
} from '../../src/lib/auth.ts';

describe('Tier 5 Adversarial Coverage Hardening Suite (Milestone 6)', () => {
  let db;

  before(() => {
    db = getDb(':memory:');
    initSchema(db);
    seedDatabase(db);
  });

  after(() => {
    closeDb();
  });

  // =========================================================================
  // 1. Quorum Anti-Inflation & Physical Unit Unique Constraints
  // =========================================================================
  describe('1. Quorum Anti-Inflation & Physical Unit Unique Constraints', () => {
    it('should enforce SQLite UNIQUE constraint on (announcement_id, property_id) for duplicate submissions', () => {
      // Clean property 25 on announcement 2 first
      db.prepare('DELETE FROM read_confirmations WHERE announcement_id = 2 AND property_id = 25').run();

      // First confirmation as Propietario
      db.prepare(`
        INSERT INTO read_confirmations (announcement_id, property_id, resident_name, role)
        VALUES (2, 25, 'Silvia Cornejo', 'Propietario')
      `).run();

      // Second confirmation as Inquilino for SAME announcement and property MUST fail
      assert.throws(
        () => {
          db.prepare(`
            INSERT INTO read_confirmations (announcement_id, property_id, resident_name, role)
            VALUES (2, 25, 'Inquilino Juan Pérez', 'Inquilino')
          `).run();
        },
        (err) => {
          assert.match(err.message, /UNIQUE constraint failed/i);
          return true;
        },
        'SQLite UNIQUE constraint must block multiple confirmations for the same physical unit'
      );

      // Clean up
      db.prepare('DELETE FROM read_confirmations WHERE announcement_id = 2 AND property_id = 25').run();
    });

    it('should allow the same property to confirm distinct announcements', () => {
      // Clean property 26 on announcements 1 and 2
      db.prepare('DELETE FROM read_confirmations WHERE property_id = 26 AND announcement_id IN (1, 2)').run();

      db.prepare(`
        INSERT INTO read_confirmations (announcement_id, property_id, resident_name, role)
        VALUES (1, 26, 'Carlos Mendoza', 'Propietario')
      `).run();

      db.prepare(`
        INSERT INTO read_confirmations (announcement_id, property_id, resident_name, role)
        VALUES (2, 26, 'Carlos Mendoza', 'Propietario')
      `).run();

      const count = db.prepare('SELECT COUNT(*) as count FROM read_confirmations WHERE property_id = 26').get();
      assert.strictEqual(count.count, 2, 'Same property can confirm distinct announcements');

      // Clean up
      db.prepare('DELETE FROM read_confirmations WHERE property_id = 26 AND announcement_id IN (1, 2)').run();
    });

    it('should prevent ghost properties via foreign key constraint RESTRICT', () => {
      assert.throws(
        () => {
          db.prepare(`
            INSERT INTO read_confirmations (announcement_id, property_id, resident_name, role)
            VALUES (1, 999999, 'Fantasma', 'Propietario')
          `).run();
        },
        (err) => {
          assert.match(err.message, /FOREIGN KEY constraint failed/i);
          return true;
        },
        'Foreign key constraint must reject non-existent property_id'
      );
    });

    it('should prevent invalid roles and short names via CHECK constraints', () => {
      assert.throws(
        () => {
          db.prepare(`
            INSERT INTO read_confirmations (announcement_id, property_id, resident_name, role)
            VALUES (1, 30, 'Válido', 'Administrador')
          `).run();
        },
        /CHECK constraint failed/i
      );

      assert.throws(
        () => {
          db.prepare(`
            INSERT INTO read_confirmations (announcement_id, property_id, resident_name, role)
            VALUES (1, 30, '  A  ', 'Propietario')
          `).run();
        },
        /CHECK constraint failed/i
      );
    });
  });

  // =========================================================================
  // 2. WhatsApp Direct Link Generation & Peruvian Phone Normalization
  // =========================================================================
  describe('2. WhatsApp Direct Link Generation & Peruvian Phone Normalization', () => {
    it('should normalize exotic Peruvian mobile variations to standard 51XXXXXXXXX E.164 format', () => {
      const inputs = [
        '987654321',
        '987 654 321',
        '987-654-321',
        '987.654.321',
        '+51 987 654 321',
        '+51 (987) 654-321',
        '+51-987-654-321',
        '51987654321',
        '  +51 987 654 321  '
      ];

      for (const input of inputs) {
        const sanitized = sanitizePhone(input);
        assert.strictEqual(sanitized, '51987654321', `Failed for input: "${input}"`);

        const link = generateWhatsAppLink(input, 'Bodega San Martín', 'Don José');
        assert.ok(link.startsWith('https://wa.me/51987654321?text='));
      }
    });

    it('should throw clear exceptions on malformed and non-digit phone numbers', () => {
      assert.throws(() => sanitizePhone(''), /El teléfono es obligatorio/);
      assert.throws(() => sanitizePhone('   '), /no contiene dígitos válidos/);
      assert.throws(() => sanitizePhone('abc-def'), /no contiene dígitos válidos/);
      assert.throws(() => sanitizePhone('+++---'), /no contiene dígitos válidos/);
    });

    it('should correctly escape and percent-encode Spanish diacritics and special characters in templates', () => {
      const link = generateWhatsAppLink(
        '987654321',
        'Panadería & Pastelería "El Cañón"',
        'María José Ñandú',
        '¡Hola {name}! ¿Tienen "{title}" disponible hoy? ¡Gracias!'
      );

      const url = new URL(link);
      const text = url.searchParams.get('text');
      assert.strictEqual(text, '¡Hola María José Ñandú! ¿Tienen "Panadería & Pastelería "El Cañón"" disponible hoy? ¡Gracias!');
      assert.ok(!link.includes(' '), 'URL must not contain raw unencoded spaces');
    });
  });

  // =========================================================================
  // 3. Missing Houses Reminder Grouping & Text Boundary Limits
  // =========================================================================
  describe('3. Missing Houses Reminder Grouping & Text Boundary Limits', () => {
    it('should group missing houses neatly by Manzana in alphabetical order', () => {
      const missingMap = {
        'Mz. D': ['Lt 01', 'Lt 02'],
        'Mz. B': ['Lt 05'],
        'Mz. A': ['Lt 03', 'Lt 04'],
        'Mz. C': ['Lt 09']
      };

      const msg = generateWhatsAppReminderMessage(
        'Convocatoria Asamblea General',
        'https://loslaureles.pe/comunicados/asamblea-general',
        missingMap
      );

      assert.ok(msg.includes('URBANIZACIÓN LOS LAURELES'));
      assert.ok(msg.includes('https://loslaureles.pe/comunicados/asamblea-general'));

      const posA = msg.indexOf('• *Mz. A:*');
      const posB = msg.indexOf('• *Mz. B:*');
      const posC = msg.indexOf('• *Mz. C:*');
      const posD = msg.indexOf('• *Mz. D:*');

      assert.ok(posA !== -1 && posB !== -1 && posC !== -1 && posD !== -1);
      assert.ok(posA < posB, 'Mz. A must precede Mz. B');
      assert.ok(posB < posC, 'Mz. B must precede Mz. C');
      assert.ok(posC < posD, 'Mz. C must precede Mz. D');
    });

    it('should keep worst-case 52 pending houses message well under WhatsApp length limits', () => {
      const fullMap = {
        'Mz. A': ['Lt 01', 'Lt 02', 'Lt 03', 'Lt 04', 'Lt 05', 'Lt 06', 'Lt 07', 'Lt 08', 'Lt 09', 'Lt 10'],
        'Mz. B': ['Lt 01', 'Lt 02', 'Lt 03', 'Lt 04', 'Lt 05', 'Lt 06', 'Lt 07', 'Lt 08', 'Lt 09', 'Lt 10', 'Lt 11', 'Lt 12'],
        'Mz. C': ['Lt 01', 'Lt 02', 'Lt 03', 'Lt 04', 'Lt 05', 'Lt 06', 'Lt 07', 'Lt 08', 'Lt 09', 'Lt 10'],
        'Mz. D': ['Lt 01', 'Lt 02', 'Lt 03', 'Lt 04', 'Lt 05', 'Lt 06', 'Lt 07', 'Lt 08', 'Lt 09', 'Lt 10'],
        'Mz. E': ['Lt 01', 'Lt 02', 'Lt 03', 'Lt 04', 'Lt 05', 'Lt 06', 'Lt 07', 'Lt 08', 'Lt 09', 'Lt 10']
      };

      const msg = generateWhatsAppReminderMessage(
        'Convocatoria Asamblea General 2026',
        'https://loslaureles.pe/comunicados/asamblea-general-ordinaria-2026',
        fullMap
      );

      assert.ok(msg.includes('Inmuebles pendientes por confirmar (52):'));
      assert.ok(msg.length < 1500, `Message length ${msg.length} must be compact (< 1500 chars)`);
    });

    it('should display celebratory notice on 100% quorum coverage', () => {
      const emptyMap = { 'Mz. A': [], 'Mz. B': [] };
      const msg = generateWhatsAppReminderMessage(
        'Mantenimiento Completado',
        'https://loslaureles.pe/comunicados/mantenimiento',
        emptyMap
      );

      assert.ok(msg.includes('100% de cobertura'));
      assert.ok(msg.includes('¡Todas las casas han confirmado la lectura!'));
    });
  });

  // =========================================================================
  // 4. Excel Attendance CSV Export Compatibility
  // =========================================================================
  describe('4. Excel Attendance CSV Export Compatibility', () => {
    it('should strictly prepend UTF-8 BOM (\\uFEFF) to CSV output', () => {
      const csv = generateAttendanceCsv('Asamblea', []);
      assert.ok(csv.startsWith('\uFEFF'), 'CSV must start with UTF-8 BOM');
      assert.strictEqual(csv.charCodeAt(0), 0xFEFF, 'First character code must be 0xFEFF');
    });

    it('should output Spanish column headers separated by semicolon', () => {
      const csv = generateAttendanceCsv('Asamblea', []);
      const lines = csv.replace(/^\uFEFF/, '').split('\r\n');
      const expected = 'Manzana;Lote;Codigo_Inmueble;Direccion;Residente;Rol;Fecha_Hora;Estado';
      assert.strictEqual(lines[0], expected);
    });

    it('should properly escape delimiters, quotes, and newlines in data fields', () => {
      const rows = [
        {
          manzana: 'Mz. A',
          lote: 'Lote 01',
          code: 'MZ-A-01',
          address: 'Calle Los Rosales 101, Dpto "B"; piso 2',
          residentName: 'Gómez, Carlos & "Hermanos"',
          role: 'Propietario',
          confirmedAt: '2026-09-04T12:00:00Z',
          confirmed: true,
          status: 'CONFIRMADO'
        }
      ];

      const csv = generateAttendanceCsv('Asamblea', rows);
      assert.ok(csv.includes('"Calle Los Rosales 101, Dpto ""B""; piso 2"'));
      assert.ok(csv.includes('"Gómez, Carlos & ""Hermanos"""'));
    });
  });

  // =========================================================================
  // 5. Admin Authentication, Entropy, Expiration & Route Guard Protection
  // =========================================================================
  describe('5. Admin Authentication, Entropy, Expiration & Route Guards', () => {
    it('should validate default PINs and reject invalid attempts', () => {
      assert.strictEqual(validateAdminPin('1234'), true);
      assert.strictEqual(validateAdminPin('123456'), true);
      assert.strictEqual(validateAdminPin('0000'), false);
      assert.strictEqual(validateAdminPin(''), false);
      assert.strictEqual(validateAdminPin('    '), false);
      assert.strictEqual(validateAdminPin(null), false);
    });

    it('should issue a 256-bit cryptographically secure session token (64 hex chars)', () => {
      const token = createAdminSession(db);
      assert.strictEqual(token.length, 64, 'Token must be 64 hex characters (256 bits)');
      assert.match(token, /^[0-9a-f]{64}$/, 'Token must be valid hex');

      // Verify token exists in database
      assert.strictEqual(validateAdminSession(db, token), true, 'Session must be valid');
    });

    it('should reject expired session tokens', () => {
      const expiredToken = crypto.randomBytes(32).toString('hex');
      const pastTime = new Date(Date.now() - 3600 * 1000).toISOString();
      db.prepare("INSERT INTO admin_sessions (token, created_at, expires_at) VALUES (?, datetime('now', '-2 hours'), ?)").run(expiredToken, pastTime);

      assert.strictEqual(validateAdminSession(db, expiredToken), false, 'Expired session must return false');
    });

    it('should delete and invalidate session upon logout', () => {
      const token = createAdminSession(db);
      assert.strictEqual(validateAdminSession(db, token), true);

      deleteAdminSession(db, token);
      assert.strictEqual(validateAdminSession(db, token), false, 'Revoked session must return false');
    });
  });

  // =========================================================================
  // 6. SQL Injection Resilience & Parameterized Query Immunity
  // =========================================================================
  describe('6. SQL Injection Resilience & Parameterized Query Immunity', () => {
    it('should safely store SQL injection strings as literal text across all models', () => {
      const payloads = [
        "Robert'); DROP TABLE read_confirmations; --",
        "' OR '1'='1",
        "'; DELETE FROM announcements; --",
        "' UNION SELECT NULL, NULL, NULL --"
      ];

      for (const payload of payloads) {
        // Test in announcements
        const slug = `slug-${crypto.randomBytes(4).toString('hex')}`;
        const annStmt = db.prepare(`
          INSERT INTO announcements (title, slug, summary, content, category)
          VALUES (?, ?, 'Resumen seguro', 'Contenido seguro', 'Mantenimiento')
        `);
        const annRes = annStmt.run(payload, slug);
        const annId = Number(annRes.lastInsertRowid);

        const fetchedAnn = db.prepare('SELECT title FROM announcements WHERE id = ?').get(annId);
        assert.strictEqual(fetchedAnn.title, payload, 'Announcement title must store payload literally');

        // Test in marketplace_listings
        const mktStmt = db.prepare(`
          INSERT INTO marketplace_listings (title, description, category, entrepreneur_name, property_address, phone, status)
          VALUES ('Negocio Seguro', ?, 'Otros', ?, 'Mz A Lt 1', '987654321', 'pending')
        `);
        const mktRes = mktStmt.run(payload, payload);
        const mktId = Number(mktRes.lastInsertRowid);

        const fetchedMkt = db.prepare('SELECT description, entrepreneur_name FROM marketplace_listings WHERE id = ?').get(mktId);
        assert.strictEqual(fetchedMkt.description, payload);
        assert.strictEqual(fetchedMkt.entrepreneur_name, payload);

        // Clean up
        db.prepare('DELETE FROM announcements WHERE id = ?').run(annId);
        db.prepare('DELETE FROM marketplace_listings WHERE id = ?').run(mktId);
      }

      // Verify all tables survived without damage
      const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all().map(t => t.name);
      assert.ok(tables.includes('census_properties'));
      assert.ok(tables.includes('announcements'));
      assert.ok(tables.includes('read_confirmations'));
      assert.ok(tables.includes('marketplace_listings'));
      assert.ok(tables.includes('admin_sessions'));
    });
  });
});

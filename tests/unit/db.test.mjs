import test, { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import fs from 'node:fs';
import { getDb, initSchema, seedDatabase, closeDb } from '../../src/lib/db.ts';

describe('Urbanización Los Laureles — Database & Seed Suite (Milestone 1)', () => {
  let db;
  const dbPath = path.resolve(process.cwd(), 'data', 'laureles.db');

  before(() => {
    // Ensure clean initialization of singleton database
    db = getDb(dbPath);
    initSchema(db);
    seedDatabase(db);
  });

  after(() => {
    // Cleanup temporary test data if any, and close connection
    closeDb();
  });

  describe('1. SQLite Engine & WAL Configuration', () => {
    it('should operate in WAL (Write-Ahead Logging) journal mode', () => {
      const modeResult = db.prepare('PRAGMA journal_mode;').get();
      assert.ok(modeResult, 'PRAGMA journal_mode returned a result');
      const mode = (modeResult.journal_mode || Object.values(modeResult)[0]).toLowerCase();
      assert.strictEqual(mode, 'wal', `Expected journal_mode to be "wal", got "${mode}"`);
    });

    it('should have busy_timeout set to 5000ms for high-concurrency safety', () => {
      const timeoutResult = db.prepare('PRAGMA busy_timeout;').get();
      assert.ok(timeoutResult, 'PRAGMA busy_timeout returned a result');
      const timeout = Number(timeoutResult.timeout || Object.values(timeoutResult)[0]);
      assert.strictEqual(timeout, 5000, `Expected busy_timeout to be 5000, got ${timeout}`);
    });

    it('should have foreign key constraints enabled', () => {
      const fkResult = db.prepare('PRAGMA foreign_keys;').get();
      assert.ok(fkResult, 'PRAGMA foreign_keys returned a result');
      const fk = Number(fkResult.foreign_keys || Object.values(fkResult)[0]);
      assert.strictEqual(fk, 1, `Expected foreign_keys to be 1 (enabled), got ${fk}`);
    });

    it('should have created all required tables in schema', () => {
      const tables = db
        .prepare("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'")
        .all()
        .map((r) => r.name);

      const requiredTables = [
        'census_properties',
        'announcements',
        'read_confirmations',
        'marketplace_listings',
        'admin_sessions',
      ];

      for (const table of requiredTables) {
        assert.ok(tables.includes(table), `Expected table "${table}" to exist in schema. Found: ${tables.join(', ')}`);
      }
    });
  });

  describe('2. Residential Census Master Dataset (52 Properties)', () => {
    it('should have exactly 52 total residential properties seeded', () => {
      const countResult = db.prepare('SELECT COUNT(*) as count FROM census_properties').get();
      assert.strictEqual(countResult.count, 52, `Expected 52 residential properties, got ${countResult.count}`);
    });

    it('should distribute properties accurately across Manzanas A, B, C, D, and E', () => {
      const distribution = db
        .prepare('SELECT manzana, COUNT(*) as count FROM census_properties GROUP BY manzana ORDER BY manzana')
        .all();

      const distMap = Object.fromEntries(distribution.map((d) => [d.manzana, d.count]));

      assert.strictEqual(distMap['Mz. A'], 10, 'Manzana A must have exactly 10 lots');
      assert.strictEqual(distMap['Mz. B'], 12, 'Manzana B must have exactly 12 lots');
      assert.strictEqual(distMap['Mz. C'], 10, 'Manzana C must have exactly 10 lots');
      assert.strictEqual(distMap['Mz. D'], 10, 'Manzana D must have exactly 10 lots');
      assert.strictEqual(distMap['Mz. E'], 10, 'Manzana E must have exactly 10 lots');
    });

    it('should ensure all properties have valid street addresses, owners, and active status', () => {
      const properties = db.prepare('SELECT * FROM census_properties').all();

      for (const prop of properties) {
        assert.ok(prop.id > 0, 'Property must have a valid autoincrement ID');
        assert.ok(prop.manzana && prop.manzana.startsWith('Mz.'), `Invalid manzana format: ${prop.manzana}`);
        assert.ok(prop.lote && prop.lote.startsWith('Lote'), `Invalid lote format: ${prop.lote}`);
        assert.ok(prop.address && prop.address.length > 5, `Invalid street address: ${prop.address}`);
        assert.ok(prop.owner_name && prop.owner_name.length > 3, `Invalid owner name: ${prop.owner_name}`);
        assert.strictEqual(prop.is_active, 1, `Property ${prop.id} should be active (is_active = 1)`);
      }
    });

    it('should enforce unique constraint on manzana + lote', () => {
      assert.throws(
        () => {
          db.prepare(
            'INSERT INTO census_properties (manzana, lote, address, owner_name) VALUES (?, ?, ?, ?)'
          ).run('Mz. A', 'Lote 01', 'Calle Duplicate 999', 'Homónimo');
        },
        (err) => {
          assert.match(err.message, /UNIQUE constraint failed/i);
          return true;
        }
      );
    });
  });

  describe('3. Official Announcements Seed Data (5 Categories)', () => {
    it('should have at least 5 official announcements seeded', () => {
      const countResult = db.prepare('SELECT COUNT(*) as count FROM announcements').get();
      assert.ok(countResult.count >= 5, `Expected at least 5 announcements, got ${countResult.count}`);
    });

    it('should cover all required institutional categories', () => {
      const categories = db
        .prepare('SELECT DISTINCT category FROM announcements')
        .all()
        .map((r) => r.category);

      const requiredCategories = [
        'Urgente / Alertas',
        'Mantenimiento',
        'Convocatorias de Asamblea',
        'Normas de Convivencia',
        'Finanzas / Cuotas',
      ];

      for (const cat of requiredCategories) {
        assert.ok(categories.includes(cat), `Category "${cat}" must be present in announcements seed data`);
      }
    });

    it('should correctly store priority, urgency, audience, and deadlines', () => {
      // Urgent announcement
      const urgentAnn = db.prepare('SELECT * FROM announcements WHERE category = ?').get('Urgente / Alertas');
      assert.ok(urgentAnn, 'Urgent announcement exists');
      assert.strictEqual(urgentAnn.is_urgent, 1, 'Urgent announcement must have is_urgent = 1');

      // Pinned assembly announcement
      const asambleaAnn = db.prepare('SELECT * FROM announcements WHERE category = ?').get('Convocatorias de Asamblea');
      assert.ok(asambleaAnn, 'Asamblea announcement exists');
      assert.strictEqual(asambleaAnn.pinned, 1, 'Asamblea announcement must be pinned');
      assert.strictEqual(asambleaAnn.audience, 'Solo Propietarios', 'Asamblea announcement must target Solo Propietarios');
      assert.ok(asambleaAnn.deadline_date !== null, 'Asamblea announcement must have a deadline date');
    });
  });

  describe('4. Mercado Laureles Seed Data (6 Approved Community Listings)', () => {
    it('should have at least 6 approved marketplace listings seeded', () => {
      const listings = db.prepare('SELECT * FROM marketplace_listings WHERE status = "approved"').all();
      assert.ok(listings.length >= 6, `Expected at least 6 approved listings, got ${listings.length}`);
    });

    it('should cover diverse commercial categories including food, repairs, apparel, and personal care', () => {
      const categories = db
        .prepare('SELECT DISTINCT category FROM marketplace_listings WHERE status = "approved"')
        .all()
        .map((r) => r.category);

      assert.ok(categories.includes('Gastronomía / Comida'), 'Missing Gastronomía / Comida category');
      assert.ok(categories.includes('Servicios Técnicos'), 'Missing Servicios Técnicos category');
      assert.ok(categories.includes('Gasfitería / Electricidad'), 'Missing Gasfitería / Electricidad category');
      assert.ok(categories.includes('Vestimenta / Ropa'), 'Missing Vestimenta / Ropa category');
      assert.ok(categories.includes('Belleza / Cuidado Personal'), 'Missing Belleza / Cuidado Personal category');
    });

    it('should validate all listings have entrepreneur name, valid phone, and WhatsApp message prefill', () => {
      const listings = db.prepare('SELECT * FROM marketplace_listings WHERE status = "approved"').all();

      for (const item of listings) {
        assert.ok(item.title.length >= 3, `Title too short for listing ${item.id}`);
        assert.ok(item.entrepreneur_name.length >= 3, `Missing entrepreneur name for listing ${item.id}`);
        assert.ok(item.phone && item.phone.length >= 8, `Invalid phone for listing ${item.id}`);
        assert.ok(
          item.whatsapp_message && item.whatsapp_message.length > 10,
          `Missing or short WhatsApp template for listing ${item.id}`
        );
        assert.ok(item.property_address.length >= 4, `Missing property address for listing ${item.id}`);
      }
    });
  });

  describe('5. Read Confirmation Constraints & Verification Mechanics', () => {
    const testAnnId = 1;
    const testPropId = 50; // Mz. E Lote 08

    it('should have initial demonstration quorum confirmations seeded for Announcement 1 (21 properties)', () => {
      const ann1Reads = db
        .prepare('SELECT COUNT(*) as count FROM read_confirmations WHERE announcement_id = 1')
        .get();
      assert.ok(
        ann1Reads.count >= 21,
        `Expected at least 21 confirmations for Announcement 1, got ${ann1Reads.count}`
      );
    });


    it('should allow inserting a valid read confirmation for a census property', () => {
      // Ensure clean state for test property
      db.prepare('DELETE FROM read_confirmations WHERE announcement_id = ? AND property_id = ?').run(
        testAnnId,
        testPropId
      );

      const insertStmt = db.prepare(`
        INSERT INTO read_confirmations (announcement_id, property_id, resident_name, role)
        VALUES (?, ?, ?, ?)
      `);

      const result = insertStmt.run(testAnnId, testPropId, 'Flor De María Iriarte', 'Propietario');
      assert.ok(result.lastInsertRowid > 0, 'Confirmation successfully inserted');

      const record = db
        .prepare('SELECT * FROM read_confirmations WHERE announcement_id = ? AND property_id = ?')
        .get(testAnnId, testPropId);

      assert.ok(record, 'Read confirmation was found in database');
      assert.strictEqual(record.resident_name, 'Flor De María Iriarte');
      assert.strictEqual(record.role, 'Propietario');
    });

    it('should throw an error on duplicate confirmation for the same announcement and property (anti-cheat quorum constraint)', () => {
      const duplicateStmt = db.prepare(`
        INSERT INTO read_confirmations (announcement_id, property_id, resident_name, role)
        VALUES (?, ?, ?, ?)
      `);

      assert.throws(
        () => {
          // Attempting second read confirmation for the same property on the same announcement
          duplicateStmt.run(testAnnId, testPropId, 'Esposo de Flor', 'Inquilino');
        },
        (err) => {
          assert.match(
            err.message,
            /UNIQUE constraint failed/i,
            'Expected SQLite UNIQUE constraint failed error on duplicate confirmation'
          );
          return true;
        }
      );
    });

    it('should enforce foreign key constraint and reject non-existent property', () => {
      const invalidPropStmt = db.prepare(`
        INSERT INTO read_confirmations (announcement_id, property_id, resident_name, role)
        VALUES (?, ?, ?, ?)
      `);

      assert.throws(
        () => {
          invalidPropStmt.run(testAnnId, 999999, 'Fantasma', 'Propietario');
        },
        (err) => {
          assert.match(err.message, /FOREIGN KEY constraint failed/i);
          return true;
        }
      );
    });

    it('should clean up the test confirmation row after testing', () => {
      db.prepare('DELETE FROM read_confirmations WHERE announcement_id = ? AND property_id = ?').run(
        testAnnId,
        testPropId
      );

      const check = db
        .prepare('SELECT * FROM read_confirmations WHERE announcement_id = ? AND property_id = ?')
        .get(testAnnId, testPropId);

      assert.strictEqual(check, undefined, 'Test confirmation row cleaned up');
    });
  });

  describe('6. Atomic Visit Counter Mechanics', () => {
    it('should atomically increment the visit_count column by exactly 1 on update', () => {
      const initialRow = db.prepare('SELECT visit_count FROM announcements WHERE id = 1').get();
      const initialCount = initialRow.visit_count;

      // Simulate atomic view increment
      db.prepare('UPDATE announcements SET visit_count = visit_count + 1 WHERE id = 1').run();

      const updatedRow = db.prepare('SELECT visit_count FROM announcements WHERE id = 1').get();
      assert.strictEqual(
        updatedRow.visit_count,
        initialCount + 1,
        `Expected visit_count to increase from ${initialCount} to ${initialCount + 1}, got ${updatedRow.visit_count}`
      );

      // Restore initial count
      db.prepare('UPDATE announcements SET visit_count = ? WHERE id = 1').run(initialCount);
    });
  });
});

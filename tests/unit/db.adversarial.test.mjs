import { describe, it, before, after, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import fs from 'node:fs';
import { getDb, initSchema, seedDatabase, closeDb } from '../../src/lib/db.ts';

describe('Adversarial Stress Suite — Milestone 1 (R5 - SQLite & Schema Hardening)', () => {
  let db;
  const testDbPath = path.resolve(process.cwd(), 'data', 'laureles_adversarial.db');

  before(() => {
    // Clean any leftover test database file
    if (fs.existsSync(testDbPath)) {
      try {
        fs.unlinkSync(testDbPath);
      } catch {
        // ignore
      }
    }
    db = getDb(testDbPath);
  });

  after(() => {
    closeDb();
    // Clean up temporary test db files
    try {
      if (fs.existsSync(testDbPath)) fs.unlinkSync(testDbPath);
      if (fs.existsSync(`${testDbPath}-wal`)) fs.unlinkSync(`${testDbPath}-wal`);
      if (fs.existsSync(`${testDbPath}-shm`)) fs.unlinkSync(`${testDbPath}-shm`);
    } catch {
      // ignore
    }
  });

  describe('1. Database Lifecycle & Singleton Integrity', () => {
    it('should return identical connection instance on consecutive getDb() calls without arguments', () => {
      const db1 = getDb();
      const db2 = getDb();
      assert.strictEqual(db1, db2, 'getDb() must return the exact same singleton instance');
    });

    it('should close connection cleanly and allow reopening with getDb()', () => {
      const tempPath = path.resolve(process.cwd(), 'data', 'temp_lifecycle.db');
      const tempDb = getDb(tempPath);
      assert.ok(tempDb, 'Temporary DB initialized');

      // Default singleton should remain accessible
      const mainDb = getDb();
      assert.ok(mainDb, 'Main DB remains accessible');

      // Clean up temp file
      try {
        tempDb.close();
        if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
        if (fs.existsSync(`${tempPath}-wal`)) fs.unlinkSync(`${tempPath}-wal`);
        if (fs.existsSync(`${tempPath}-shm`)) fs.unlinkSync(`${tempPath}-shm`);
      } catch {
        // ignore
      }
    });

    it('should safely handle repeated closeDb() invocations without throwing', () => {
      assert.doesNotThrow(() => {
        closeDb();
        closeDb();
        closeDb();
      }, 'Repeated closeDb calls must be idempotent no-ops');

      // Re-establish for subsequent tests
      db = getDb(testDbPath);
    });

    it('should initialize schema and seeds properly in an in-memory database (:memory:)', () => {
      const memDb = getDb(':memory:');
      assert.ok(memDb, 'In-memory DB instance created');

      const propCount = memDb.prepare('SELECT COUNT(*) as count FROM census_properties').get();
      assert.strictEqual(propCount.count, 52, 'In-memory DB must seed all 52 census properties');

      const annCount = memDb.prepare('SELECT COUNT(*) as count FROM announcements').get();
      assert.strictEqual(annCount.count, 5, 'In-memory DB must seed 5 announcements');

      const listCount = memDb.prepare('SELECT COUNT(*) as count FROM marketplace_listings').get();
      assert.strictEqual(listCount.count, 6, 'In-memory DB must seed 6 marketplace listings');

      const readCount = memDb.prepare('SELECT COUNT(*) as count FROM read_confirmations').get();
      assert.strictEqual(readCount.count, 21, 'In-memory DB must seed 21 demo confirmations');

      memDb.close();
    });
  });

  describe('2. Idempotency Stress Test', () => {
    it('should maintain exact table counts after 5 consecutive seedDatabase() calls', () => {
      for (let i = 0; i < 5; i++) {
        initSchema(db);
        seedDatabase(db);
      }

      const propCount = db.prepare('SELECT COUNT(*) as count FROM census_properties').get();
      assert.strictEqual(propCount.count, 52, 'Census properties count must remain exactly 52');

      const annCount = db.prepare('SELECT COUNT(*) as count FROM announcements').get();
      assert.strictEqual(annCount.count, 5, 'Announcements count must remain exactly 5');

      const listCount = db.prepare('SELECT COUNT(*) as count FROM marketplace_listings').get();
      assert.strictEqual(listCount.count, 6, 'Marketplace listings count must remain exactly 6');

      const readCount = db.prepare('SELECT COUNT(*) as count FROM read_confirmations').get();
      assert.strictEqual(readCount.count, 21, 'Read confirmations count must remain exactly 21');
    });
  });

  describe('3. Unique Constraint Hardening (Anti-Inflation & Anti-Collision)', () => {
    it('should reject duplicate read confirmation for same announcement and property', () => {
      // Announcement 1, Property 1 is already seeded
      const existing = db.prepare('SELECT * FROM read_confirmations WHERE announcement_id = 1 AND property_id = 1').get();
      assert.ok(existing, 'Property 1 already confirmed Announcement 1');

      assert.throws(
        () => {
          db.prepare(`
            INSERT INTO read_confirmations (announcement_id, property_id, resident_name, role)
            VALUES (1, 1, 'Inquilino Intruso', 'Inquilino')
          `).run();
        },
        (err) => {
          assert.match(err.message, /UNIQUE constraint failed/i);
          return true;
        },
        'Must block duplicate read confirmation row'
      );
    });

    it('should reject duplicate (manzana, lote) pair in census_properties', () => {
      assert.throws(
        () => {
          db.prepare(`
            INSERT INTO census_properties (manzana, lote, address, owner_name)
            VALUES ('Mz. B', 'Lote 05', 'Calle Falsa 123', 'Duplicado')
          `).run();
        },
        (err) => {
          assert.match(err.message, /UNIQUE constraint failed/i);
          return true;
        },
        'Must prevent duplicate property registration in census'
      );
    });

    it('should reject duplicate URL slug in announcements', () => {
      assert.throws(
        () => {
          db.prepare(`
            INSERT INTO announcements (title, slug, summary, content, category)
            VALUES ('Otro Título Válido', 'asamblea-general-ordinaria-2026', 'Resumen', 'Contenido', 'Convocatorias de Asamblea')
          `).run();
        },
        (err) => {
          assert.match(err.message, /UNIQUE constraint failed/i);
          return true;
        },
        'Must prevent duplicate announcement slugs'
      );
    });

    it('should reject duplicate session token in admin_sessions', () => {
      const token = 'test-token-uuid-12345';
      db.prepare(`
        INSERT OR REPLACE INTO admin_sessions (token, expires_at)
        VALUES (?, datetime('now', '+1 day'))
      `).run(token);

      assert.throws(
        () => {
          db.prepare(`
            INSERT INTO admin_sessions (token, expires_at)
            VALUES (?, datetime('now', '+2 days'))
          `).run(token);
        },
        (err) => {
          assert.match(err.message, /UNIQUE constraint failed/i);
          return true;
        },
        'Must prevent duplicate admin session tokens'
      );

      // Clean up
      db.prepare('DELETE FROM admin_sessions WHERE token = ?').run(token);
    });
  });

  describe('4. Foreign Key Constraints & Referential Integrity', () => {
    it('should reject read confirmation for non-existent property_id', () => {
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
        }
      );
    });

    it('should reject read confirmation for non-existent announcement_id', () => {
      assert.throws(
        () => {
          db.prepare(`
            INSERT INTO read_confirmations (announcement_id, property_id, resident_name, role)
            VALUES (999999, 10, 'Vecino Real', 'Propietario')
          `).run();
        },
        (err) => {
          assert.match(err.message, /FOREIGN KEY constraint failed/i);
          return true;
        }
      );
    });

    it('should cascade delete read_confirmations when announcement is deleted', () => {
      // Create temporary announcement
      const annResult = db.prepare(`
        INSERT INTO announcements (title, slug, summary, content, category)
        VALUES ('Comunicado Temporal Cascada', 'temporal-cascada-test', 'Resumen', 'Contenido', 'Mantenimiento')
      `).run();
      const annId = Number(annResult.lastInsertRowid);

      // Add read confirmation for property 10
      db.prepare(`
        INSERT INTO read_confirmations (announcement_id, property_id, resident_name, role)
        VALUES (?, 10, 'Residente Test Cascada', 'Propietario')
      `).run(annId);

      const beforeDelete = db.prepare('SELECT COUNT(*) as count FROM read_confirmations WHERE announcement_id = ?').get(annId);
      assert.strictEqual(beforeDelete.count, 1, 'Read confirmation was inserted');

      // Delete announcement
      db.prepare('DELETE FROM announcements WHERE id = ?').run(annId);

      // Verify cascade deletion
      const afterDelete = db.prepare('SELECT COUNT(*) as count FROM read_confirmations WHERE announcement_id = ?').get(annId);
      assert.strictEqual(afterDelete.count, 0, 'Read confirmation must be automatically cascade deleted');
    });

    it('should RESTRICT deletion of census property if referenced by read_confirmations', () => {
      // Property 1 has read confirmations on announcement 1
      assert.throws(
        () => {
          db.prepare('DELETE FROM census_properties WHERE id = 1').run();
        },
        (err) => {
          assert.match(err.message, /FOREIGN KEY constraint failed/i);
          return true;
        },
        'Must restrict deletion of census property with existing read confirmations'
      );
    });
  });

  describe('5. CHECK Constraints & Input Boundary Hardening', () => {
    it('should reject announcement title shorter than 5 characters or whitespace only', () => {
      const badTitles = ['', '   ', 'A', 'Abcd', '    x    '];
      for (const title of badTitles) {
        assert.throws(
          () => {
            db.prepare(`
              INSERT INTO announcements (title, slug, summary, content, category)
              VALUES (?, 'slug-' || hex(randomblob(4)), 'Resumen', 'Contenido', 'Mantenimiento')
            `).run(title);
          },
          (err) => {
            assert.match(err.message, /CHECK constraint failed/i);
            return true;
          },
          `Title "${title}" should violate CHECK constraint`
        );
      }
    });

    it('should reject invalid announcement categories', () => {
      const badCategories = ['Noticias Generales', 'Spam', 'Seguridad', ''];
      for (const cat of badCategories) {
        assert.throws(
          () => {
            db.prepare(`
              INSERT INTO announcements (title, slug, summary, content, category)
              VALUES ('Título Válido', 'slug-' || hex(randomblob(4)), 'Resumen', 'Contenido', ?)
            `).run(cat);
          },
          (err) => {
            assert.match(err.message, /CHECK constraint failed/i);
            return true;
          },
          `Category "${cat}" should violate CHECK constraint`
        );
      }
    });

    it('should reject invalid announcement audience enum', () => {
      const badAudiences = ['Todos', 'Visitantes', 'Comunidad', ''];
      for (const aud of badAudiences) {
        assert.throws(
          () => {
            db.prepare(`
              INSERT INTO announcements (title, slug, summary, content, category, audience)
              VALUES ('Título Válido', 'slug-' || hex(randomblob(4)), 'Resumen', 'Contenido', 'Mantenimiento', ?)
            `).run(aud);
          },
          (err) => {
            assert.match(err.message, /CHECK constraint failed/i);
            return true;
          }
        );
      }
    });

    it('should reject negative visit_count in announcements', () => {
      assert.throws(
        () => {
          db.prepare(`
            INSERT INTO announcements (title, slug, summary, content, category, visit_count)
            VALUES ('Título Válido', 'slug-' || hex(randomblob(4)), 'Resumen', 'Contenido', 'Mantenimiento', -1)
          `).run();
        },
        (err) => {
          assert.match(err.message, /CHECK constraint failed/i);
          return true;
        }
      );
    });

    it('should reject resident_name shorter than 3 characters or whitespace in read_confirmations', () => {
      const badNames = ['', '  ', 'Jo', '  a '];
      for (const name of badNames) {
        assert.throws(
          () => {
            db.prepare(`
              INSERT INTO read_confirmations (announcement_id, property_id, resident_name, role)
              VALUES (2, 52, ?, 'Propietario')
            `).run(name);
          },
          (err) => {
            assert.match(err.message, /CHECK constraint failed/i);
            return true;
          },
          `Resident name "${name}" should violate CHECK constraint`
        );
      }
    });

    it('should reject invalid role in read_confirmations', () => {
      const badRoles = ['Visitante', 'Administrador', 'Familiar', ''];
      for (const role of badRoles) {
        assert.throws(
          () => {
            db.prepare(`
              INSERT INTO read_confirmations (announcement_id, property_id, resident_name, role)
              VALUES (2, 52, 'Vecino Válido', ?)
            `).run(role);
          },
          (err) => {
            assert.match(err.message, /CHECK constraint failed/i);
            return true;
          },
          `Role "${role}" should violate CHECK constraint`
        );
      }
    });

    it('should reject invalid marketplace status and category', () => {
      assert.throws(
        () => {
          db.prepare(`
            INSERT INTO marketplace_listings (title, description, category, entrepreneur_name, property_address, phone, status)
            VALUES ('Negocio', 'Descripción válida', 'Categoría Inválida', 'Emprendedor', 'Mz A Lote 1', '987654321', 'approved')
          `).run();
        },
        (err) => {
          assert.match(err.message, /CHECK constraint failed/i);
          return true;
        }
      );

      assert.throws(
        () => {
          db.prepare(`
            INSERT INTO marketplace_listings (title, description, category, entrepreneur_name, property_address, phone, status)
            VALUES ('Negocio', 'Descripción válida', 'Otros', 'Emprendedor', 'Mz A Lote 1', '987654321', 'deleted')
          `).run();
        },
        (err) => {
          assert.match(err.message, /CHECK constraint failed/i);
          return true;
        }
      );
    });

    it('should reject invalid is_active values in census_properties', () => {
      assert.throws(
        () => {
          db.prepare(`
            INSERT INTO census_properties (manzana, lote, address, owner_name, is_active)
            VALUES ('Mz. X', 'Lote 99', 'Calle Test', 'Dueño', 5)
          `).run();
        },
        (err) => {
          assert.match(err.message, /CHECK constraint failed/i);
          return true;
        }
      );
    });
  });

  describe('6. Security & Parameterized Query Safety (SQL Injection Resistance)', () => {
    it('should safely store SQL injection payloads as literal text strings without execution', () => {
      const injectionPayloads = [
        "Robert'); DROP TABLE read_confirmations; --",
        "' OR '1'='1",
        "'; UPDATE announcements SET visit_count = 99999; --",
      ];

      for (const payload of injectionPayloads) {
        // Clean property 52 on announcement 2 first
        db.prepare('DELETE FROM read_confirmations WHERE announcement_id = 2 AND property_id = 52').run();

        const insertStmt = db.prepare(`
          INSERT INTO read_confirmations (announcement_id, property_id, resident_name, role)
          VALUES (2, 52, ?, 'Propietario')
        `);

        insertStmt.run(payload);

        const fetched = db.prepare(`
          SELECT resident_name FROM read_confirmations WHERE announcement_id = 2 AND property_id = 52
        `).get();

        assert.strictEqual(fetched.resident_name, payload, 'Payload must be stored literally');

        // Confirm tables still exist and uncompromised
        const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all().map((r) => r.name);
        assert.ok(tables.includes('read_confirmations'), 'read_confirmations table must survive');
        assert.ok(tables.includes('announcements'), 'announcements table must survive');

        // Clean up
        db.prepare('DELETE FROM read_confirmations WHERE announcement_id = 2 AND property_id = 52').run();
      }
    });
  });

  describe('7. Concurrency & High-Volume Atomic Operations', () => {
    it('should accurately increment visit_count across 100 sequential operations', () => {
      const ann = db.prepare('SELECT visit_count FROM announcements WHERE id = 1').get();
      const initial = ann.visit_count;

      const incrementStmt = db.prepare('UPDATE announcements SET visit_count = visit_count + 1 WHERE id = 1');

      for (let i = 0; i < 100; i++) {
        incrementStmt.run();
      }

      const updated = db.prepare('SELECT visit_count FROM announcements WHERE id = 1').get();
      assert.strictEqual(updated.visit_count, initial + 100, `visit_count should increment by exactly 100`);

      // Restore
      db.prepare('UPDATE announcements SET visit_count = ? WHERE id = 1').run(initial);
    });
  });
});

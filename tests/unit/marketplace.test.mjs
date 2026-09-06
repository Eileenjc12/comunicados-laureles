import test, { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import fs from 'node:fs';
import { DatabaseSync } from 'node:sqlite';
import {
  sanitizePhone,
  generateWhatsAppLink,
  generateWhatsAppReminderMessage,
  formatDisplayPhone,
} from '../../src/lib/whatsapp.ts';
import { initSchema, seedDatabase } from '../../src/lib/db.ts';

describe('Urbanización Los Laureles — Milestone 4: Mercado Laureles & WhatsApp Suite', () => {
  let testDb;
  const testDbDir = path.resolve(process.cwd(), 'data');
  const testDbPath = path.resolve(testDbDir, 'test-marketplace.db');

  before(() => {
    if (!fs.existsSync(testDbDir)) {
      fs.mkdirSync(testDbDir, { recursive: true });
    }
    if (fs.existsSync(testDbPath)) {
      try {
        fs.unlinkSync(testDbPath);
      } catch {
        // file might be locked, proceed
      }
    }

    testDb = new DatabaseSync(testDbPath);
    testDb.exec('PRAGMA foreign_keys = ON;');
    initSchema(testDb);
    seedDatabase(testDb);
  });

  after(() => {
    if (testDb) {
      testDb.close();
    }
    try {
      if (fs.existsSync(testDbPath)) {
        fs.unlinkSync(testDbPath);
      }
    } catch {
      // ignore
    }
  });

  // ==========================================
  // 1. Phone Sanitization (Peruvian & International)
  // ==========================================
  describe('1. Phone Sanitization (sanitizePhone)', () => {
    it('should convert standard 9-digit Peruvian mobile without country code to 51XXXXXXXXX', () => {
      assert.strictEqual(sanitizePhone('987654321'), '51987654321');
    });

    it('should handle spaces in Peruvian mobile numbers', () => {
      assert.strictEqual(sanitizePhone('987 654 321'), '51987654321');
    });

    it('should handle hyphens and dashes in numbers', () => {
      assert.strictEqual(sanitizePhone('987-654-321'), '51987654321');
      assert.strictEqual(sanitizePhone('987.654.321'), '51987654321');
    });

    it('should handle +51 prefix with spaces and parentheses', () => {
      assert.strictEqual(sanitizePhone('+51 987 654 321'), '51987654321');
      assert.strictEqual(sanitizePhone('+51 (987) 654-321'), '51987654321');
    });

    it('should preserve numbers that already have 51 without duplicating', () => {
      assert.strictEqual(sanitizePhone('51987654321'), '51987654321');
      assert.notStrictEqual(sanitizePhone('51987654321'), '5151987654321');
    });

    it('should preserve international numbers with non-Peru country codes', () => {
      // US number +1 (202) 555-0199 (11 digits starting with 1)
      assert.strictEqual(sanitizePhone('+1 (202) 555-0199'), '12025550199');
    });

    it('should throw descriptive error on empty or whitespace phone', () => {
      assert.throws(() => sanitizePhone(''), /El teléfono es obligatorio/);
      assert.throws(() => sanitizePhone('   '), /no contiene dígitos válidos/);
    });

    it('should throw descriptive error on non-numeric characters only', () => {
      assert.throws(() => sanitizePhone('abc-xyz'), /no contiene dígitos válidos/);
      assert.throws(() => sanitizePhone('---'), /no contiene dígitos válidos/);
    });

    it('should format numbers for clean display', () => {
      assert.strictEqual(formatDisplayPhone('51987654321'), '+51 987 654 321');
      assert.strictEqual(formatDisplayPhone('987654321'), '+51 987 654 321');
    });
  });

  // ==========================================
  // 2. Direct WhatsApp Link Generation
  // ==========================================
  describe('2. Direct WhatsApp Link Generation (generateWhatsAppLink)', () => {
    it('should produce valid https://wa.me/ URL starting with sanitized phone number', () => {
      const link = generateWhatsAppLink('987112233', 'Pastelería Doña Rosa', 'Rosa');
      assert.ok(link.startsWith('https://wa.me/51987112233?text='));
    });

    it('should include business title and entrepreneur name in default template', () => {
      const link = generateWhatsAppLink('987112233', 'Pastelería Doña Rosa', 'Rosa Paredes');
      const url = new URL(link);
      const text = url.searchParams.get('text');
      assert.ok(text.includes('Rosa Paredes'), 'Text must include entrepreneur name');
      assert.ok(text.includes('Pastelería Doña Rosa'), 'Text must include business name');
      assert.ok(text.includes('Mercado Laureles'), 'Text must include community market name');
    });

    it('should support custom template with placeholder replacement', () => {
      const custom = 'Hola {name}, deseo consultar el precio de {title} para mañana.';
      const link = generateWhatsAppLink('987112233', 'Torta de Chocolate', 'Rosa', custom);
      const url = new URL(link);
      const text = url.searchParams.get('text');
      assert.strictEqual(text, 'Hola Rosa, deseo consultar el precio de Torta de Chocolate para mañana.');
    });

    it('should properly percent-encode special characters, accents, and spaces', () => {
      const link = generateWhatsAppLink('987112233', 'Pastel de Choclo & Café Tradición', 'María Elena');
      assert.ok(!link.includes(' '), 'Link must not contain raw unencoded spaces');
      assert.ok(link.includes('%20') || link.includes('+'));
      assert.ok(link.includes('%C3%A9') || link.includes('%C3%A1')); // encoded accents
    });

    it('should handle link generation when phone already has +51 and spaces', () => {
      const link = generateWhatsAppLink('+51 987 654 321', 'Gasfitería Express', 'Don Lucho');
      assert.ok(link.startsWith('https://wa.me/51987654321?text='));
    });
  });

  // ==========================================
  // 3. WhatsApp Reminder Message Generator
  // ==========================================
  describe('3. WhatsApp Reminder Message Generator (generateWhatsAppReminderMessage)', () => {
    it('should format community reminder grouped by Manzana from missingByManzana object', () => {
      const missingByManzana = {
        'Mz. A': ['Lote 02', 'Lote 05'],
        'Mz. B': ['Lote 01'],
        'Mz. C': ['Lote 08', 'Lote 09', 'Lote 10'],
      };

      const message = generateWhatsAppReminderMessage(
        'Asamblea General Extraordinaria 2026',
        'https://loslaureles.pe/comunicados/asamblea-extraordinaria',
        missingByManzana
      );

      assert.ok(message.includes('URBANIZACIÓN LOS LAURELES'));
      assert.ok(message.includes('Asunto: Asamblea General Extraordinaria 2026'));
      assert.ok(message.includes('https://loslaureles.pe/comunicados/asamblea-extraordinaria'));
      assert.ok(message.includes('• *Mz. A:* Lote 02, Lote 05'));
      assert.ok(message.includes('• *Mz. B:* Lote 01'));
      assert.ok(message.includes('• *Mz. C:* Lote 08, Lote 09, Lote 10'));
      assert.ok(message.includes('Inmuebles pendientes por confirmar (6):'));
    });

    it('should handle 100% quorum state when no missing houses remain', () => {
      const missingByManzana = {
        'Mz. A': [],
        'Mz. B': [],
      };

      const message = generateWhatsAppReminderMessage(
        'Mantenimiento General',
        'https://loslaureles.pe/comunicados/mantenimiento',
        missingByManzana
      );

      assert.ok(message.includes('100% de cobertura'));
      assert.ok(message.includes('¡Todas las casas han confirmado la lectura!'));
    });

    it('should support 4-argument signature returning detailed metadata object', () => {
      const details = generateWhatsAppReminderMessage(
        'Aviso Comunal',
        'https://loslaureles.pe/comunicados/aviso',
        52,
        []
      );

      assert.strictEqual(details.missingCount, 0);
      assert.strictEqual(details.confirmedCount, 52);
      assert.strictEqual(details.coveragePercent, 100);
      assert.ok(details.messageText.includes('100% de cobertura'));
      assert.ok(details.whatsappUrl.startsWith('https://wa.me/?text='));
    });
  });

  // ==========================================
  // 4. Marketplace SQLite Queries & Category Filtering
  // ==========================================
  describe('4. Marketplace Database Queries & Category Filtering', () => {
    it('should retrieve seeded approved listings in database', () => {
      const listings = testDb
        .prepare("SELECT * FROM marketplace_listings WHERE status = 'approved' ORDER BY id ASC")
        .all();

      assert.ok(listings.length >= 5, `Expected at least 5 seeded listings, got ${listings.length}`);
      for (const item of listings) {
        assert.strictEqual(item.status, 'approved', 'Must only return approved items');
        assert.ok(item.title, 'Listing must have a title');
        assert.ok(item.category, 'Listing must have a category');
        assert.ok(item.entrepreneur_name, 'Listing must have entrepreneur name');
        assert.ok(item.property_address, 'Listing must have property address');
        assert.ok(item.phone, 'Listing must have phone');
      }
    });

    it('should filter listings strictly by category', () => {
      const targetCategory = 'Gastronomía / Comida';
      const foodListings = testDb
        .prepare("SELECT * FROM marketplace_listings WHERE status = 'approved' AND category = ?")
        .all(targetCategory);

      assert.ok(foodListings.length >= 1, 'Should find gastronomy listings');
      for (const item of foodListings) {
        assert.strictEqual(item.category, targetCategory);
      }

      const techListings = testDb
        .prepare("SELECT * FROM marketplace_listings WHERE status = 'approved' AND category = ?")
        .all('Servicios Técnicos');

      assert.ok(techListings.length >= 1, 'Should find technical services listings');
      for (const item of techListings) {
        assert.strictEqual(item.category, 'Servicios Técnicos');
      }
    });

    it('should validate taxonomy covers all 6 required categories', () => {
      const expectedCategories = [
        'Gastronomía / Comida',
        'Vestimenta / Ropa',
        'Servicios Técnicos',
        'Gasfitería / Electricidad',
        'Belleza / Cuidado Personal',
        'Otros',
      ];

      for (const cat of expectedCategories) {
        // Attempt insert with valid category
        const stmt = testDb.prepare(`
          INSERT INTO marketplace_listings (
            title, description, category, entrepreneur_name, property_address, phone, schedule_hours, status
          ) VALUES (?, ?, ?, ?, ?, ?, ?, 'pending')
        `);
        const res = stmt.run(
          `Test ${cat}`,
          'Descripción válida de más de quince caracteres.',
          cat,
          'Emprendedor Prueba',
          'Mz A Lt 1',
          '987111222',
          'Lun - Vie 9am - 6pm'
        );
        assert.ok(Number(res.lastInsertRowid) > 0);
      }
    });

    it('should reject invalid category not matching CHECK constraint in SQLite', () => {
      assert.throws(() => {
        testDb.prepare(`
          INSERT INTO marketplace_listings (
            title, description, category, entrepreneur_name, property_address, phone, schedule_hours, status
          ) VALUES (?, ?, ?, ?, ?, ?, ?, 'pending')
        `).run(
          'Negocio No Permitido',
          'Descripción válida de más de quince caracteres.',
          'Categoría Inexistente Falsa',
          'Vecino',
          'Mz A Lt 1',
          '987111222',
          'Lun - Vie 9am - 6pm'
        );
      }, /CHECK constraint failed/);
    });
  });

  // ==========================================
  // 5. Public Submission & Moderation Queue Isolation
  // ==========================================
  describe('5. Public Submission & Moderation Queue Isolation', () => {
    it('should create new listing with status = pending on submission', () => {
      const stmt = testDb.prepare(`
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

      const res = stmt.run(
        'Lavandería San Juan Laureles',
        'Servicio de lavado al peso y planchado para todos los residentes.',
        'Servicios Técnicos',
        'Gladys Huamán',
        'Mz A Lt 6',
        '987654321',
        '¡Hola Gladys! Quisiera consultar sobre el servicio de lavandería.',
        '/images/marketplace/default-business.svg',
        'Lun a Sáb 8:00 AM - 6:00 PM'
      );

      const newId = Number(res.lastInsertRowid);
      assert.ok(newId > 0, 'New listing ID must be greater than 0');

      const created = testDb
        .prepare('SELECT * FROM marketplace_listings WHERE id = ?')
        .get(newId);

      assert.ok(created, 'Inserted listing must exist in database');
      assert.strictEqual(created.status, 'pending', 'Status MUST strictly be pending');
      assert.strictEqual(created.title, 'Lavandería San Juan Laureles');
      assert.strictEqual(created.entrepreneur_name, 'Gladys Huamán');
    });

    it('should strictly exclude pending listings from public directory query', () => {
      // 1. Insert a pending listing
      const res = testDb.prepare(`
        INSERT INTO marketplace_listings (
          title, description, category, entrepreneur_name, property_address, phone, schedule_hours, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, 'pending')
      `).run(
        'Gimnasio Calistenia Secreto',
        'Clases particulares de calistenia para jóvenes de la urbanización.',
        'Belleza / Cuidado Personal',
        'Esteban Guzmán',
        'Mz E Lt 7',
        '987222333',
        '6:00 AM - 8:00 AM'
      );
      const pendingId = Number(res.lastInsertRowid);

      // 2. Query public approved listings
      const publicListings = testDb
        .prepare("SELECT id, title FROM marketplace_listings WHERE status = 'approved'")
        .all();

      const publicIds = publicListings.map((l) => l.id);
      assert.ok(
        !publicIds.includes(pendingId),
        `Pending listing ID ${pendingId} MUST NOT appear in public catalog`
      );
    });

    it('should strictly exclude rejected listings from public directory query', () => {
      // 1. Insert a rejected listing
      const res = testDb.prepare(`
        INSERT INTO marketplace_listings (
          title, description, category, entrepreneur_name, property_address, phone, schedule_hours, status, admin_notes
        ) VALUES (?, ?, ?, ?, ?, ?, ?, 'rejected', ?)
      `).run(
        'Taller Ruidoso No Autorizado',
        'Taller mecánico con motores ruidosos en la vía pública comunal.',
        'Servicios Técnicos',
        'Extraño',
        'Mz B Lt 5',
        '987000111',
        '24 Horas',
        'Actividad no permitida por estatutos vecinales.'
      );
      const rejectedId = Number(res.lastInsertRowid);

      // 2. Query public approved listings
      const publicListings = testDb
        .prepare("SELECT id, title FROM marketplace_listings WHERE status = 'approved'")
        .all();

      const publicIds = publicListings.map((l) => l.id);
      assert.ok(
        !publicIds.includes(rejectedId),
        `Rejected listing ID ${rejectedId} MUST NOT appear in public catalog`
      );
    });

    it('should allow admin promotion from pending to approved making it live in public directory', () => {
      // 1. Create pending listing
      const insertRes = testDb.prepare(`
        INSERT INTO marketplace_listings (
          title, description, category, entrepreneur_name, property_address, phone, schedule_hours, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, 'pending')
      `).run(
        'Pastelería Artesanal Los Laureles',
        'Tortas de matrimonio, tres leches y bocaditos personalizados.',
        'Gastronomía / Comida',
        'Alicia Consuelo Cabrera',
        'Mz E Lt 4',
        '987444555',
        'Mar a Dom 10am - 7pm'
      );
      const listingId = Number(insertRes.lastInsertRowid);

      // Confirm not in public catalog yet
      let publicListings = testDb
        .prepare("SELECT id FROM marketplace_listings WHERE status = 'approved'")
        .all();
      assert.ok(!publicListings.map((l) => l.id).includes(listingId));

      // 2. Admin approves listing
      testDb
        .prepare("UPDATE marketplace_listings SET status = 'approved', updated_at = datetime('now') WHERE id = ?")
        .run(listingId);

      // 3. Confirm now visible in public catalog
      publicListings = testDb
        .prepare("SELECT id, title FROM marketplace_listings WHERE status = 'approved'")
        .all();
      assert.ok(
        publicListings.map((l) => l.id).includes(listingId),
        'Promoted listing must now appear in public directory'
      );
    });
  });
});

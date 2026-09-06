import test, { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { getDb, initSchema, seedDatabase, closeDb } from '../../src/lib/db.ts';
import { calculateQuorumProgress, EMERGENCY_CONTACTS } from '../helpers/domain-logic.mjs';

describe('Milestone 2 & 3: Institutional Portal, Announcements & Quorum Reads Unit Suite', () => {
  let db;
  const dbPath = path.resolve(process.cwd(), 'data', 'laureles.db');

  let getCensusProperties;
  let getAnnouncements;
  let getAnnouncementBySlug;
  let incrementView;
  let confirmRead;

  before(async () => {
    db = getDb(dbPath);
    initSchema(db);
    seedDatabase(db);

    // Dynamically load API routes using pathToFileURL for cross-platform robustness with bracketed paths
    const censusModule = await import(
      pathToFileURL(path.resolve(process.cwd(), 'src/pages/api/census/properties.ts')).href
    );
    getCensusProperties = censusModule.GET;

    const annIndexModule = await import(
      pathToFileURL(path.resolve(process.cwd(), 'src/pages/api/announcements/index.ts')).href
    );
    getAnnouncements = annIndexModule.GET;

    const annSlugModule = await import(
      pathToFileURL(path.resolve(process.cwd(), 'src/pages/api/announcements/[slug].ts')).href
    );
    getAnnouncementBySlug = annSlugModule.GET;

    const viewModule = await import(
      pathToFileURL(path.resolve(process.cwd(), 'src/pages/api/announcements/[id]/view.ts')).href
    );
    incrementView = viewModule.POST;

    const confirmModule = await import(
      pathToFileURL(path.resolve(process.cwd(), 'src/pages/api/announcements/[id]/confirm.ts')).href
    );
    confirmRead = confirmModule.POST;
  });

  after(() => {
    closeDb();
  });

  // =========================================================================
  // 1. Census Properties API Endpoint
  // =========================================================================
  describe('1. Census Properties API (/api/census/properties)', () => {
    it('should return 200 with exactly 52 active census properties and dual field mapping', async () => {
      const response = await getCensusProperties({});
      assert.strictEqual(response.status, 200);

      const json = await response.json();
      assert.strictEqual(json.success, true);
      assert.strictEqual(json.total, 52);
      assert.ok(Array.isArray(json.properties));
      assert.strictEqual(json.properties.length, 52);

      // Verify first property field contract
      const first = json.properties[0];
      assert.strictEqual(first.id, 1);
      assert.strictEqual(first.manzana, 'Mz. A');
      assert.strictEqual(first.block, 'Mz. A');
      assert.strictEqual(first.lote, 'Lote 01');
      assert.strictEqual(first.lot, 'Lote 01');
      assert.strictEqual(first.code, 'MZ-A-01');
      assert.strictEqual(first.address, 'Calle Los Rosales 101');
      assert.strictEqual(first.street, 'Calle Los Rosales 101');
      assert.strictEqual(first.owner_name, 'Carlos Alberto Mendoza Silva');
      assert.strictEqual(first.owner, 'Carlos Alberto Mendoza Silva');
      assert.strictEqual(first.is_active, 1);
    });

    it('should accurately distribute 52 properties across Manzanas A through E', async () => {
      const response = await getCensusProperties({});
      const { properties } = await response.json();

      const counts = { 'Mz. A': 0, 'Mz. B': 0, 'Mz. C': 0, 'Mz. D': 0, 'Mz. E': 0 };
      for (const p of properties) {
        counts[p.manzana]++;
      }

      assert.strictEqual(counts['Mz. A'], 10);
      assert.strictEqual(counts['Mz. B'], 12);
      assert.strictEqual(counts['Mz. C'], 10);
      assert.strictEqual(counts['Mz. D'], 10);
      assert.strictEqual(counts['Mz. E'], 10);
    });
  });

  // =========================================================================
  // 2. Announcements Feed API Endpoint (/api/announcements)
  // =========================================================================
  describe('2. Announcements Feed API (/api/announcements)', () => {
    it('should return all active announcements sorted by pinned DESC, created_at DESC', async () => {
      const url = new URL('http://localhost:4321/api/announcements');
      const response = await getAnnouncements({ url });
      assert.strictEqual(response.status, 200);

      const json = await response.json();
      assert.strictEqual(json.success, true);
      assert.ok(json.announcements.length >= 5);

      // Verify sorting: all pinned items precede unpinned items
      let sawUnpinned = false;
      for (const item of json.announcements) {
        if (item.pinned === 0) {
          sawUnpinned = true;
        }
        if (sawUnpinned && item.pinned === 1) {
          assert.fail('Found pinned announcement after unpinned announcement in sorted feed.');
        }
      }
    });

    it('should filter announcements by category', async () => {
      const targetCategory = 'Mantenimiento';
      const url = new URL(`http://localhost:4321/api/announcements?category=${encodeURIComponent(targetCategory)}`);
      const response = await getAnnouncements({ url });
      assert.strictEqual(response.status, 200);

      const json = await response.json();
      assert.ok(json.announcements.length >= 1);
      for (const ann of json.announcements) {
        assert.strictEqual(ann.category, targetCategory);
      }
    });

    it('should filter announcements by audience', async () => {
      const targetAudience = 'Solo Propietarios';
      const url = new URL(`http://localhost:4321/api/announcements?audience=${encodeURIComponent(targetAudience)}`);
      const response = await getAnnouncements({ url });
      assert.strictEqual(response.status, 200);

      const json = await response.json();
      assert.ok(json.announcements.length >= 1);
      for (const ann of json.announcements) {
        assert.strictEqual(ann.audience, targetAudience);
      }
    });

    it('should filter announcements by search keyword', async () => {
      const url = new URL('http://localhost:4321/api/announcements?search=cisterna');
      const response = await getAnnouncements({ url });
      assert.strictEqual(response.status, 200);

      const json = await response.json();
      assert.ok(json.announcements.length >= 1);
      const match = json.announcements[0];
      const foundInContent = `${match.title} ${match.summary} ${match.content}`.toLowerCase().includes('cisterna');
      assert.ok(foundInContent, 'Expected search term cisterna in title, summary, or content');
    });

    it('should filter announcements by date prefix', async () => {
      const url = new URL('http://localhost:4321/api/announcements?date=2026');
      const response = await getAnnouncements({ url });
      assert.strictEqual(response.status, 200);

      const json = await response.json();
      assert.ok(json.announcements.length >= 1);
    });
  });

  // =========================================================================
  // 3. Announcement Detail & Quorum API (/api/announcements/[slug])
  // =========================================================================
  describe('3. Announcement Detail & Quorum API (/api/announcements/[slug])', () => {
    it('should return announcement detail with accurate quorum stats and tier for valid slug', async () => {
      const response = await getAnnouncementBySlug({
        params: { slug: 'asamblea-general-ordinaria-2026' },
      });

      assert.strictEqual(response.status, 200);
      const json = await response.json();
      assert.strictEqual(json.success, true);
      assert.ok(json.announcement);
      assert.strictEqual(json.announcement.slug, 'asamblea-general-ordinaria-2026');
      assert.strictEqual(json.totalCensus, 52);
      assert.ok(json.confirmedPropertiesCount >= 21, 'Expected at least 21 initial seed confirmations');
      assert.ok(json.readPercentage >= 40.0);
      assert.strictEqual(json.quorumTier, 'moderate');
      assert.strictEqual(json.quorumLabel, 'En proceso de notificación');
    });

    it('should return 404 for a non-existent announcement slug', async () => {
      const response = await getAnnouncementBySlug({
        params: { slug: 'comunicado-fantasma-inexistente-123' },
      });

      assert.strictEqual(response.status, 404);
      const json = await response.json();
      assert.strictEqual(json.success, false);
      assert.strictEqual(json.error, 'Comunicado no encontrado');
    });
  });

  // =========================================================================
  // 4. Atomic Visit Counter API (/api/announcements/[id]/view)
  // =========================================================================
  describe('4. Atomic Visit Counter API (/api/announcements/[id]/view)', () => {
    it('should atomically increment the visit counter by 1 on POST', async () => {
      const initialRow = db.prepare('SELECT visit_count FROM announcements WHERE id = 2').get();
      const initialViews = initialRow.visit_count;

      const response = await incrementView({
        params: { id: '2' },
      });

      assert.strictEqual(response.status, 200);
      const json = await response.json();
      assert.strictEqual(json.success, true);
      assert.strictEqual(json.visitCount, initialViews + 1);

      const checkRow = db.prepare('SELECT visit_count FROM announcements WHERE id = 2').get();
      assert.strictEqual(checkRow.visit_count, initialViews + 1);

      // Restore counter
      db.prepare('UPDATE announcements SET visit_count = ? WHERE id = 2').run(initialViews);
    });

    it('should return 404 when attempting to increment view on non-existent announcement', async () => {
      const response = await incrementView({
        params: { id: '999999' },
      });

      assert.strictEqual(response.status, 404);
      const json = await response.json();
      assert.strictEqual(json.success, false);
      assert.strictEqual(json.error, 'Comunicado no encontrado');
    });
  });

  // =========================================================================
  // 5. Read Confirmation API & Anti-Duplicate (/api/announcements/[id]/confirm)
  // =========================================================================
  describe('5. Read Confirmation API & Anti-Duplicate (/api/announcements/[id]/confirm)', () => {
    const testAnnId = 2; // Announcement 2 (Mantenimiento)
    const testPropId = 10; // Mz. A Lote 10

    before(() => {
      db.prepare('DELETE FROM read_confirmations WHERE announcement_id = ? AND property_id = ?').run(
        testAnnId,
        testPropId
      );
    });

    after(() => {
      db.prepare('DELETE FROM read_confirmations WHERE announcement_id = ? AND property_id = ?').run(
        testAnnId,
        testPropId
      );
    });

    it('should successfully register a valid read confirmation and return 201 Created with updated stats', async () => {
      const mockRequest = new Request('http://localhost:4321', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          propertyId: testPropId,
          residentName: 'Silvia Mónica Cornejo Peña',
          role: 'Propietario',
        }),
      });

      const response = await confirmRead({
        params: { id: String(testAnnId) },
        request: mockRequest,
      });

      assert.strictEqual(response.status, 201);
      const json = await response.json();
      assert.strictEqual(json.success, true);
      assert.strictEqual(json.confirmation.propertyId, testPropId);
      assert.strictEqual(json.confirmation.residentName, 'Silvia Mónica Cornejo Peña');
      assert.strictEqual(json.confirmation.role, 'Propietario');
      assert.ok(json.confirmation.confirmedAt);
      assert.ok(json.stats.confirmedCount >= 1);
      assert.strictEqual(json.stats.totalProperties, 52);
    });

    it('should reject a duplicate confirmation for the same property with HTTP 409 Conflict and code ALREADY_CONFIRMED', async () => {
      const mockRequest = new Request('http://localhost:4321', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          propertyId: testPropId,
          residentName: 'Otro Residente Del Mismo Predio',
          role: 'Inquilino',
        }),
      });

      const response = await confirmRead({
        params: { id: String(testAnnId) },
        request: mockRequest,
      });

      assert.strictEqual(response.status, 409, 'Expected HTTP 409 Conflict on duplicate property confirmation');
      const json = await response.json();
      assert.strictEqual(json.success, false);
      assert.strictEqual(json.code, 'ALREADY_CONFIRMED');
      assert.strictEqual(json.error, 'ALREADY_CONFIRMED');
      assert.ok(
        json.message.includes('ya registró su confirmación') || json.message.includes('ya confirmó'),
        `Unexpected error message: ${json.message}`
      );
    });

    it('should reject invalid resident name (< 3 chars) with HTTP 400 VALIDATION_ERROR', async () => {
      const mockRequest = new Request('http://localhost:4321', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          propertyId: 22,
          residentName: 'Ab',
          role: 'Propietario',
        }),
      });

      const response = await confirmRead({
        params: { id: String(testAnnId) },
        request: mockRequest,
      });

      assert.strictEqual(response.status, 400);
      const json = await response.json();
      assert.strictEqual(json.success, false);
      assert.strictEqual(json.code, 'VALIDATION_ERROR');
      assert.ok(json.errors.some((e) => e.includes('3 caracteres')));
    });

    it('should reject invalid resident role with HTTP 400 VALIDATION_ERROR', async () => {
      const mockRequest = new Request('http://localhost:4321', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          propertyId: 22,
          residentName: 'Juan Pérez',
          role: 'Visitante',
        }),
      });

      const response = await confirmRead({
        params: { id: String(testAnnId) },
        request: mockRequest,
      });

      assert.strictEqual(response.status, 400);
      const json = await response.json();
      assert.strictEqual(json.success, false);
      assert.strictEqual(json.code, 'VALIDATION_ERROR');
      assert.ok(json.errors.some((e) => e.includes('rol')));
    });

    it('should reject non-existent property ID with HTTP 400 VALIDATION_ERROR', async () => {
      const mockRequest = new Request('http://localhost:4321', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          propertyId: 9999,
          residentName: 'Juan Pérez',
          role: 'Propietario',
        }),
      });

      const response = await confirmRead({
        params: { id: String(testAnnId) },
        request: mockRequest,
      });

      assert.strictEqual(response.status, 400);
      const json = await response.json();
      assert.strictEqual(json.success, false);
      assert.strictEqual(json.code, 'VALIDATION_ERROR');
      assert.ok(json.errors.some((e) => e.includes('no existe')));
    });

    it('should reject whitespace-only resident name with HTTP 400 VALIDATION_ERROR', async () => {
      const mockRequest = new Request('http://localhost:4321', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          propertyId: 22,
          residentName: '      ',
          role: 'Propietario',
        }),
      });

      const response = await confirmRead({
        params: { id: String(testAnnId) },
        request: mockRequest,
      });

      assert.strictEqual(response.status, 400);
      const json = await response.json();
      assert.strictEqual(json.success, false);
      assert.strictEqual(json.code, 'VALIDATION_ERROR');
    });

    it('should reject tenant confirmation after owner has already confirmed for the same property (physical unit constraint)', async () => {
      // testPropId (10) was confirmed by owner Silvia earlier on testAnnId (2)
      const mockRequest = new Request('http://localhost:4321', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          propertyId: testPropId,
          residentName: 'Inquilino Juan Pérez',
          role: 'Inquilino',
        }),
      });

      const response = await confirmRead({
        params: { id: String(testAnnId) },
        request: mockRequest,
      });

      assert.strictEqual(response.status, 409);
      const json = await response.json();
      assert.strictEqual(json.code, 'ALREADY_CONFIRMED');
    });

    it('should allow the same property to confirm on a distinct announcement', async () => {
      // Clean property 10 on Announcement 3
      db.prepare('DELETE FROM read_confirmations WHERE announcement_id = 3 AND property_id = 10').run();

      const mockRequest = new Request('http://localhost:4321', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          propertyId: 10,
          residentName: 'Silvia Mónica Cornejo Peña',
          role: 'Propietario',
        }),
      });

      const response = await confirmRead({
        params: { id: '3' },
        request: mockRequest,
      });

      assert.strictEqual(response.status, 201);
      const json = await response.json();
      assert.strictEqual(json.success, true);
      assert.strictEqual(json.confirmation.announcementId, 3);
      assert.strictEqual(json.confirmation.propertyId, 10);

      // Clean up
      db.prepare('DELETE FROM read_confirmations WHERE announcement_id = 3 AND property_id = 10').run();
    });
  });

  // =========================================================================
  // 6. Quorum Progress Engine Tests
  // =========================================================================
  describe('6. Quorum Progress Calculation & Tiers', () => {
    it('should calculate 0% when 0 properties have confirmed', () => {
      const q = calculateQuorumProgress(0, 52);
      assert.strictEqual(q.confirmedCount, 0);
      assert.strictEqual(q.totalProperties, 52);
      assert.strictEqual(q.percentage, 0.0);
      assert.strictEqual(q.tier, 'low');
    });

    it('should calculate low tier (<35%) correctly', () => {
      const q = calculateQuorumProgress(15, 52);
      assert.strictEqual(q.confirmedCount, 15);
      assert.strictEqual(q.percentage, 28.8);
      assert.strictEqual(q.tier, 'low');
      assert.strictEqual(q.tierLabel, 'Bajo quórum');
    });

    it('should calculate moderate tier (35-69.9%) correctly', () => {
      const q = calculateQuorumProgress(26, 52);
      assert.strictEqual(q.confirmedCount, 26);
      assert.strictEqual(q.percentage, 50.0);
      assert.strictEqual(q.tier, 'moderate');
      assert.strictEqual(q.tierLabel, 'En proceso de notificación');
    });

    it('should calculate high tier (>=70%) correctly', () => {
      const q = calculateQuorumProgress(42, 52);
      assert.strictEqual(q.confirmedCount, 42);
      assert.strictEqual(q.percentage, 80.8);
      assert.strictEqual(q.tier, 'high');
      assert.strictEqual(q.tierLabel, 'Quórum reglamentario alcanzado');
    });

    it('should clamp values at 100% maximum', () => {
      const q = calculateQuorumProgress(60, 52);
      assert.strictEqual(q.confirmedCount, 52);
      assert.strictEqual(q.percentage, 100.0);
      assert.strictEqual(q.tier, 'high');
    });
  });

  // =========================================================================
  // 7. Emergency Directory Verification
  // =========================================================================
  describe('7. Emergency Directory Data Structure', () => {
    it('should contain all required community and national emergency services', () => {
      assert.strictEqual(EMERGENCY_CONTACTS.length, 6);

      const porteria = EMERGENCY_CONTACTS.find((c) => c.id === 'porteria');
      assert.ok(porteria);
      assert.strictEqual(porteria.phone, '+51 987 654 321');

      const vigilancia = EMERGENCY_CONTACTS.find((c) => c.id === 'vigilancia');
      assert.ok(vigilancia);
      assert.strictEqual(vigilancia.phone, '(01) 456-7890');

      const admin = EMERGENCY_CONTACTS.find((c) => c.id === 'administracion');
      assert.ok(admin);
      assert.strictEqual(admin.phone, '+51 999 888 777');

      const policia = EMERGENCY_CONTACTS.find((c) => c.id === 'policia');
      assert.ok(policia);
      assert.strictEqual(policia.phone, '105');

      const bomberos = EMERGENCY_CONTACTS.find((c) => c.id === 'bomberos');
      assert.ok(bomberos);
      assert.strictEqual(bomberos.phone, '116');

      const samu = EMERGENCY_CONTACTS.find((c) => c.id === 'samu');
      assert.ok(samu);
      assert.strictEqual(samu.phone, '106');
    });
  });
});

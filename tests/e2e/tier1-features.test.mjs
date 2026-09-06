/**
 * TIER 1: FEATURE COVERAGE TEST SUITE
 * Comprehensive verification of all 12 core feature areas (>=5 tests per area).
 * Urbanización Los Laureles — Requirements R1, R2, R3, R4, R5
 */

import { describe, it, beforeEach, assert } from '../helpers/test-framework.mjs';
import { LaurelesTestClient } from '../helpers/test-client.mjs';
import {
  EMERGENCY_CONTACTS,
  RESIDENTIAL_CENSUS,
  TOTAL_CENSUS_PROPERTIES,
  ANNOUNCEMENT_CATEGORIES,
  ANNOUNCEMENT_AUDIENCES,
  MARKETPLACE_CATEGORIES,
  generateWhatsAppLink,
  calculateQuorumProgress,
  generateWhatsAppReminderMessage,
  generateAttendanceCsv
} from '../helpers/domain-logic.mjs';

const client = new LaurelesTestClient();

describe('Tier 1: Feature Coverage', () => {
  beforeEach(async () => {
    client.reset();
    await client.init();
  });

  // ==========================================
  // Feature Area 1: Institutional Announcements (R1)
  // ==========================================
  describe('1. Institutional Announcements (R1)', () => {
    it('test_announcements_list_returns_seeded_notices', async () => {
      const res = await client.getAnnouncements();
      assert.equal(res.status, 200);
      assert.ok(res.ok);
      const list = res.data.announcements;
      assert.ok(Array.isArray(list));
      assert.ok(list.length >= 5, `Expected at least 5 seed announcements, got ${list.length}`);
      
      const first = list[0];
      assert.ok(first.id, 'Announcement must have id');
      assert.ok(first.title, 'Announcement must have title');
      assert.ok(first.slug, 'Announcement must have slug');
      assert.ok(first.category, 'Announcement must have category');
      assert.ok(first.audience, 'Announcement must have audience');
    });

    it('test_announcements_category_filtering', async () => {
      const targetCategory = 'Convocatorias de Asamblea';
      const res = await client.getAnnouncements({ category: targetCategory });
      assert.equal(res.status, 200);
      const list = res.data.announcements;
      assert.ok(list.length >= 1, 'Expected at least one assembly notice');
      for (const item of list) {
        assert.equal(item.category, targetCategory, `Item ${item.id} has incorrect category`);
      }
    });

    it('test_announcements_audience_filtering', async () => {
      const targetAudience = 'Solo Propietarios';
      const res = await client.getAnnouncements({ audience: targetAudience });
      assert.equal(res.status, 200);
      const list = res.data.announcements;
      assert.ok(list.length >= 1, 'Expected at least one notice for Solo Propietarios');
      for (const item of list) {
        assert.equal(item.audience, targetAudience);
      }
    });

    it('test_announcements_keyword_search', async () => {
      const res = await client.getAnnouncements({ search: 'cisterna' });
      assert.equal(res.status, 200);
      const list = res.data.announcements;
      assert.ok(list.length >= 1, 'Search for cisterna should find matching maintenance notice');
      assert.ok(
        list[0].title.toLowerCase().includes('cisterna') ||
        list[0].summary.toLowerCase().includes('cisterna')
      );
    });

    it('test_announcements_pinned_priority_sorting', async () => {
      const res = await client.getAnnouncements();
      const list = res.data.announcements;
      assert.ok(list.length >= 2);
      
      let foundUnpinned = false;
      for (const item of list) {
        if (!item.pinned) {
          foundUnpinned = true;
        }
        if (foundUnpinned && item.pinned) {
          assert.fail('Pinned announcement found after an unpinned announcement in feed sorting.');
        }
      }
    });

    it('test_announcements_visit_counter_increments', async () => {
      const slugRes = await client.getAnnouncementBySlug('asamblea-general-ordinaria-2026');
      assert.equal(slugRes.status, 200);
      const initialViews = slugRes.data.announcement.visit_count;

      const incRes = await client.incrementView(slugRes.data.announcement.id);
      assert.equal(incRes.status, 200);
      assert.equal(incRes.data.visitCount, initialViews + 1, 'Visit count must increment atomically by 1');
    });
  });

  // ==========================================
  // Feature Area 2: Emergency Contacts Directory (R1)
  // ==========================================
  describe('2. Emergency Contacts Directory (R1)', () => {
    it('test_emergency_porteria_call_and_whatsapp', () => {
      const porteria = EMERGENCY_CONTACTS.find(c => c.id === 'porteria');
      assert.ok(porteria, 'Portería Principal must be defined');
      assert.equal(porteria.phone, '+51 987 654 321');
      assert.ok(porteria.protocol.startsWith('tel:'));
    });

    it('test_emergency_vigilancia_247', () => {
      const vigilancia = EMERGENCY_CONTACTS.find(c => c.id === 'vigilancia');
      assert.ok(vigilancia, 'Vigilancia 24/7 must be defined');
      assert.equal(vigilancia.phone, '(01) 456-7890');
      assert.equal(vigilancia.protocol, 'tel:014567890');
    });

    it('test_emergency_administracion_whatsapp', () => {
      const adminContact = EMERGENCY_CONTACTS.find(c => c.id === 'administracion');
      assert.ok(adminContact, 'Administración contact must be defined');
      assert.ok(adminContact.protocol.includes('wa.me/51999888777'));
    });

    it('test_emergency_policia_nacional', () => {
      const policia = EMERGENCY_CONTACTS.find(c => c.id === 'policia');
      assert.ok(policia, 'Policía Nacional contact must be defined');
      assert.equal(policia.phone, '105');
      assert.equal(policia.protocol, 'tel:105');
    });

    it('test_emergency_bomberos', () => {
      const bomberos = EMERGENCY_CONTACTS.find(c => c.id === 'bomberos');
      assert.ok(bomberos, 'Bomberos contact must be defined');
      assert.equal(bomberos.phone, '116');
      assert.equal(bomberos.protocol, 'tel:116');
    });

    it('test_emergency_samu_medical', () => {
      const samu = EMERGENCY_CONTACTS.find(c => c.id === 'samu');
      assert.ok(samu, 'SAMU contact must be defined');
      assert.equal(samu.phone, '106');
      assert.equal(samu.protocol, 'tel:106');
    });
  });

  // ==========================================
  // Feature Area 3: Read Confirmation by Property (R2)
  // ==========================================
  describe('3. Read Confirmation by Property (R2)', () => {
    it('test_read_confirmation_successful_submission', async () => {
      // Property 10 (Mz A Lote 10 - Silvia Mónica Cornejo) on Announcement 1 (not yet confirmed)
      const res = await client.confirmRead(1, {
        propertyId: 10,
        residentName: 'Silvia Mónica Cornejo Peña',
        role: 'Propietario'
      });
      assert.equal(res.status, 201, 'Read confirmation should return 201 Created');
      assert.ok(res.data.success);
      assert.equal(res.data.confirmation.propertyId, 10);
      assert.equal(res.data.confirmation.residentName, 'Silvia Mónica Cornejo Peña');
      assert.equal(res.data.confirmation.role, 'Propietario');
      assert.ok(res.data.confirmation.confirmedAt);
    });

    it('test_read_confirmation_persists_in_state', async () => {
      // Property 4 (Mz A Lote 04)
      await client.confirmRead(1, {
        propertyId: 4,
        residentName: 'Rosa Lucía Benites Morales',
        role: 'Propietario'
      });

      // Query detail by slug to verify quorum updated
      const detail = await client.getAnnouncementBySlug('asamblea-general-ordinaria-2026');
      assert.equal(detail.status, 200);
      assert.ok(detail.data.confirmedPropertiesCount >= 22);
    });

    it('test_read_confirmation_owner_role', async () => {
      const res = await client.confirmRead(3, {
        propertyId: 6,
        residentName: 'Gladys Patricia Huamán Ortiz',
        role: 'Propietario'
      });
      assert.equal(res.status, 201);
      assert.equal(res.data.confirmation.role, 'Propietario');
    });

    it('test_read_confirmation_tenant_role', async () => {
      const res = await client.confirmRead(3, {
        propertyId: 8,
        residentName: 'Alonso Martínez Inquilino',
        role: 'Inquilino'
      });
      assert.equal(res.status, 201);
      assert.equal(res.data.confirmation.role, 'Inquilino');
    });

    it('test_read_confirmation_census_property_matching', async () => {
      const censusRes = await client.getCensusProperties();
      assert.equal(censusRes.status, 200);
      const prop = censusRes.data.properties.find(p => p.id === 9);
      assert.ok(prop, 'Property ID 9 must exist in census');
      assert.equal(prop.block, 'Mz. A');
      assert.equal(prop.lot, 'Lote 09');

      const res = await client.confirmRead(3, {
        propertyId: prop.id,
        residentName: prop.owner,
        role: 'Propietario'
      });
      assert.equal(res.status, 201);
    });

    it('test_read_confirmation_updates_stats', async () => {
      // Confirm property 13 on announcement 1 (initial confirmed: 21)
      const res = await client.confirmRead(1, {
        propertyId: 13,
        residentName: 'Manuel Alejandro Cárdenas Gil',
        role: 'Propietario'
      });
      assert.equal(res.status, 201);
      assert.equal(res.data.stats.confirmedCount, 22);
      assert.equal(res.data.stats.totalProperties, 52);
      assert.equal(res.data.stats.percentage, 42.3);
    });
  });

  // ==========================================
  // Feature Area 4: Duplicate Prevention (R2)
  // ==========================================
  describe('4. Duplicate Prevention (R2)', () => {
    it('test_duplicate_confirmation_same_property_rejected_409', async () => {
      // Property 1 (Mz A Lote 01) is already seeded as confirmed on Announcement 1
      const res = await client.confirmRead(1, {
        propertyId: 1,
        residentName: 'Carlos Alberto Mendoza Silva',
        role: 'Propietario'
      });
      assert.equal(res.status, 409, 'Duplicate read confirmation must be rejected with 409 Conflict');
      assert.equal(res.data.code, 'ALREADY_CONFIRMED');
    });

    it('test_duplicate_confirmation_error_code_and_message', async () => {
      const res = await client.confirmRead(1, {
        propertyId: 2,
        residentName: 'María Elena Paredes Ramos',
        role: 'Propietario'
      });
      assert.equal(res.status, 409);
      assert.ok(res.data.message.includes('ya registró su confirmación'));
    });

    it('test_duplicate_confirmation_does_not_increment_counter', async () => {
      const beforeDetail = await client.getAnnouncementBySlug('asamblea-general-ordinaria-2026');
      const countBefore = beforeDetail.data.confirmedPropertiesCount;

      await client.confirmRead(1, {
        propertyId: 1,
        residentName: 'Carlos Alberto Mendoza Silva',
        role: 'Propietario'
      });

      const afterDetail = await client.getAnnouncementBySlug('asamblea-general-ordinaria-2026');
      assert.equal(afterDetail.data.confirmedPropertiesCount, countBefore, 'Count must remain identical after duplicate attempt');
    });

    it('test_duplicate_confirmation_tenant_after_owner_rejected', async () => {
      // Property 18 confirmed on announcement 3 by owner
      await client.confirmRead(3, {
        propertyId: 18,
        residentName: 'Norma Beatriz Hidalgo Vera',
        role: 'Propietario'
      });

      // Tenant of same property attempts to confirm
      const dup = await client.confirmRead(3, {
        propertyId: 18,
        residentName: 'Inquilino Juan Pérez',
        role: 'Inquilino'
      });
      assert.equal(dup.status, 409, 'Physical property uniqueness must reject tenant after owner');
    });

    it('test_duplicate_confirmation_owner_after_tenant_rejected', async () => {
      // Property 20 confirmed on announcement 3 by tenant
      await client.confirmRead(3, {
        propertyId: 20,
        residentName: 'Inquilina Andrea Gómez',
        role: 'Inquilino'
      });

      // Owner attempts second confirmation
      const dup = await client.confirmRead(3, {
        propertyId: 20,
        residentName: 'Lucía Mercedes Jáuregui Cano',
        role: 'Propietario'
      });
      assert.equal(dup.status, 409, 'Physical property uniqueness must reject owner after tenant');
    });

    it('test_duplicate_prevention_across_different_announcements', async () => {
      // Property 1 confirmed on Announcement 1
      // Confirming Property 1 on Announcement 3 MUST succeed
      const res = await client.confirmRead(3, {
        propertyId: 1,
        residentName: 'Carlos Alberto Mendoza Silva',
        role: 'Propietario'
      });
      assert.equal(res.status, 201, 'Same property should freely confirm on distinct announcements');
    });
  });

  // ==========================================
  // Feature Area 5: Progress Bar Calculation & Quorum (R2)
  // ==========================================
  describe('5. Progress Bar Calculation & Quorum (R2)', () => {
    it('test_quorum_progress_standard_calculation', () => {
      const q = calculateQuorumProgress(21, 52);
      assert.equal(q.confirmedCount, 21);
      assert.equal(q.totalProperties, 52);
      assert.equal(q.percentage, 40.4);
      assert.equal(q.tier, 'moderate');
    });

    it('test_quorum_progress_tier_low', () => {
      const q = calculateQuorumProgress(10, 52);
      assert.equal(q.percentage, 19.2);
      assert.equal(q.tier, 'low');
      assert.equal(q.tierLabel, 'Bajo quórum');
    });

    it('test_quorum_progress_tier_moderate', () => {
      const q = calculateQuorumProgress(26, 52);
      assert.equal(q.percentage, 50.0);
      assert.equal(q.tier, 'moderate');
      assert.equal(q.tierLabel, 'En proceso de notificación');
    });

    it('test_quorum_progress_tier_high', () => {
      const q = calculateQuorumProgress(42, 52);
      assert.equal(q.percentage, 80.8);
      assert.equal(q.tier, 'high');
      assert.equal(q.tierLabel, 'Quórum reglamentario alcanzado');
    });

    it('test_quorum_progress_clamp_zero', () => {
      const q = calculateQuorumProgress(0, 52);
      assert.equal(q.percentage, 0.0);
      assert.equal(q.confirmedCount, 0);
    });

    it('test_quorum_progress_clamp_hundred', () => {
      const q = calculateQuorumProgress(52, 52);
      assert.equal(q.percentage, 100.0);
      assert.equal(q.confirmedCount, 52);
      assert.equal(q.tier, 'high');
    });
  });

  // ==========================================
  // Feature Area 6: Marketplace Catalog (R3)
  // ==========================================
  describe('6. Marketplace Catalog (R3)', () => {
    it('test_marketplace_catalog_returns_approved_only', async () => {
      const res = await client.getMarketplaceListings();
      assert.equal(res.status, 200);
      const listings = res.data.listings;
      assert.ok(listings.length >= 5, 'Must return seeded approved businesses');
      for (const item of listings) {
        assert.equal(item.status, 'approved', 'Only approved listings should be visible publicly');
      }
    });

    it('test_marketplace_catalog_category_filtering', async () => {
      const res = await client.getMarketplaceListings({ category: 'Gastronomía / Comida' });
      assert.equal(res.status, 200);
      for (const item of res.data.listings) {
        assert.equal(item.category, 'Gastronomía / Comida');
      }
    });

    it('test_marketplace_catalog_featured_sorting', async () => {
      const res = await client.getMarketplaceListings();
      const listings = res.data.listings;
      assert.ok(listings.length >= 2);
      let foundUnfeatured = false;
      for (const item of listings) {
        if (!item.isFeatured) {
          foundUnfeatured = true;
        }
        if (foundUnfeatured && item.isFeatured) {
          assert.fail('Featured listing found after unfeatured listing in catalog sorting.');
        }
      }
    });

    it('test_marketplace_card_data_integrity', async () => {
      const res = await client.getMarketplaceListings();
      const item = res.data.listings[0];
      assert.ok(item.title);
      assert.ok(item.description);
      assert.ok(item.category);
      assert.ok(item.entrepreneurName);
      assert.ok(item.propertyAddress);
      assert.ok(item.phone);
      assert.ok(item.scheduleHours);
    });

    it('test_marketplace_category_taxonomy_validation', () => {
      assert.equal(MARKETPLACE_CATEGORIES.length, 6);
      assert.ok(MARKETPLACE_CATEGORIES.includes('Gastronomía / Comida'));
      assert.ok(MARKETPLACE_CATEGORIES.includes('Gasfitería / Electricidad'));
    });

    it('test_marketplace_pending_listings_excluded_from_public', async () => {
      const res = await client.getMarketplaceListings();
      const titles = res.data.listings.map(l => l.title);
      // Seed item 6 is pending: 'Piqueos & Empanadas Caseras San Martín'
      assert.ok(!titles.includes('Piqueos & Empanadas Caseras San Martín'));
    });
  });

  // ==========================================
  // Feature Area 7: Direct WhatsApp Links (R3)
  // ==========================================
  describe('7. Direct WhatsApp Links (R3)', () => {
    it('test_whatsapp_link_standard_9digit_peruvian', () => {
      const link = generateWhatsAppLink('987112233', 'Pastelería Doña Rosa', 'Rosa');
      assert.ok(link.startsWith('https://wa.me/51987112233?text='));
    });

    it('test_whatsapp_link_with_spaces_and_formatting', () => {
      const link = generateWhatsAppLink('+51 (987) 112-233', 'Gasfitería', 'Lucho');
      assert.ok(link.startsWith('https://wa.me/51987112233?text='));
    });

    it('test_whatsapp_link_already_with_51', () => {
      const link = generateWhatsAppLink('51987112233', 'Gasfitería', 'Lucho');
      assert.ok(link.startsWith('https://wa.me/51987112233?text='));
      assert.ok(!link.includes('5151987112233'));
    });

    it('test_whatsapp_link_default_template_interpolation', () => {
      const link = generateWhatsAppLink('987112233', 'Pastelería Doña Rosa', 'Rosa Paredes');
      const url = new URL(link);
      const text = url.searchParams.get('text');
      assert.ok(text.includes('Rosa Paredes'));
      assert.ok(text.includes('Pastelería Doña Rosa'));
      assert.ok(text.includes('Mercado Laureles'));
    });

    it('test_whatsapp_link_custom_template_interpolation', () => {
      const custom = 'Hola {name}, quiero pedir {title} para hoy.';
      const link = generateWhatsAppLink('987112233', 'Torta Helada', 'Rosa', custom);
      const url = new URL(link);
      const text = url.searchParams.get('text');
      assert.equal(text, 'Hola Rosa, quiero pedir Torta Helada para hoy.');
    });

    it('test_whatsapp_link_url_encoding', () => {
      const link = generateWhatsAppLink('987112233', 'Pastel de Choclo & Café', 'María');
      assert.ok(!link.includes(' ')); // No raw spaces
      assert.ok(link.includes('%20') || link.includes('+'));
    });
  });

  // ==========================================
  // Feature Area 8: Public Business Submission (R3)
  // ==========================================
  describe('8. Public Business Submission (R3)', () => {
    it('test_public_submission_valid_creates_pending', async () => {
      const payload = {
        title: 'Lavandería Express Laureles',
        category: 'Servicios Técnicos',
        description: 'Lavado al peso, secado rápido y planchado para familias de la comunidad.',
        entrepreneurName: 'Julio César Naranjo',
        propertyAddress: 'Mz D Lt 8',
        phone: '987554433',
        scheduleHours: 'Lun a Sáb 8:00 AM - 7:00 PM'
      };

      const res = await client.submitMarketplaceListing(payload);
      assert.equal(res.status, 201);
      assert.equal(res.data.status, 'pending');
      assert.ok(res.data.id);
    });

    it('test_public_submission_requires_valid_title', async () => {
      const res = await client.submitMarketplaceListing({
        title: 'AB', // < 3 chars
        category: 'Servicios Técnicos',
        description: 'Descripción válida de más de quince caracteres.',
        entrepreneurName: 'Julio Naranjo',
        propertyAddress: 'Mz D Lt 8',
        phone: '987554433',
        scheduleHours: 'Lun a Sáb 8am-7pm'
      });
      assert.equal(res.status, 400);
      assert.equal(res.data.code, 'VALIDATION_ERROR');
    });

    it('test_public_submission_requires_valid_category', async () => {
      const res = await client.submitMarketplaceListing({
        title: 'Venta de Autos',
        category: 'Categoría Inexistente',
        description: 'Descripción válida de más de quince caracteres.',
        entrepreneurName: 'Julio Naranjo',
        propertyAddress: 'Mz D Lt 8',
        phone: '987554433',
        scheduleHours: 'Lun a Sáb 8am-7pm'
      });
      assert.equal(res.status, 400);
    });

    it('test_public_submission_requires_valid_description', async () => {
      const res = await client.submitMarketplaceListing({
        title: 'Zapatería Laureles',
        category: 'Otros',
        description: 'Muy corta', // < 15 chars
        entrepreneurName: 'Julio Naranjo',
        propertyAddress: 'Mz D Lt 8',
        phone: '987554433',
        scheduleHours: 'Lun a Sáb 8am-7pm'
      });
      assert.equal(res.status, 400);
    });

    it('test_public_submission_requires_9digit_phone', async () => {
      const res = await client.submitMarketplaceListing({
        title: 'Zapatería Laureles',
        category: 'Otros',
        description: 'Reparación de calzado fino para toda la urbanización.',
        entrepreneurName: 'Julio Naranjo',
        propertyAddress: 'Mz D Lt 8',
        phone: '12345', // < 9 digits
        scheduleHours: 'Lun a Sáb 8am-7pm'
      });
      assert.equal(res.status, 400);
    });

    it('test_public_submission_immediate_hidden_from_public', async () => {
      const payload = {
        title: 'Veterinaria & Mascotas San Francisco',
        category: 'Belleza / Cuidado Personal',
        description: 'Baño medicado, corte de pelo y vacunas a domicilio para perritos y gatitos.',
        entrepreneurName: 'Adriana Jimena Acosta',
        propertyAddress: 'Mz D Lt 2',
        phone: '987665544',
        scheduleHours: 'Lun a Dom 9:00 AM - 6:00 PM'
      };

      await client.submitMarketplaceListing(payload);
      const publicList = await client.getMarketplaceListings();
      const titles = publicList.data.listings.map(l => l.title);
      assert.ok(!titles.includes('Veterinaria & Mascotas San Francisco'));
    });
  });

  // ==========================================
  // Feature Area 9: Admin Login PIN (R4)
  // ==========================================
  describe('9. Admin Login PIN (R4)', () => {
    it('test_admin_login_valid_pin_success', async () => {
      const res = await client.adminLogin('123456');
      assert.equal(res.status, 200);
      assert.ok(res.data.success);
      assert.ok(client.sessionCookie);
    });

    it('test_admin_login_invalid_pin_401', async () => {
      const res = await client.adminLogin('999999');
      assert.equal(res.status, 401);
      assert.equal(res.data.code, 'INVALID_PIN');
      assert.ok(!client.sessionCookie);
    });

    it('test_admin_login_empty_pin_rejected', async () => {
      const res = await client.adminLogin('');
      assert.equal(res.status, 401);
    });

    it('test_admin_logout_clears_session', async () => {
      await client.adminLogin('123456');
      assert.ok(client.sessionCookie);

      const res = await client.adminLogout();
      assert.equal(res.status, 200);
      assert.ok(!client.sessionCookie);

      // Subsequent admin call must fail
      const metrics = await client.getAdminMetrics();
      assert.equal(metrics.status, 401);
    });

    it('test_admin_unauthorized_access_blocked', async () => {
      const metrics = await client.getAdminMetrics();
      assert.equal(metrics.status, 401);
    });

    it('test_admin_session_token_cryptographic_format', async () => {
      const res = await client.adminLogin('123456');
      assert.equal(res.status, 200);
      const token = client._extractToken();
      assert.ok(token);
      assert.equal(token.length, 64, 'Token must be 64-char hex string (256-bit)');
      assert.match(token, /^[0-9a-f]{64}$/i);
    });
  });

  // ==========================================
  // Feature Area 10: Admin Metrics & Read Control (R4)
  // ==========================================
  describe('10. Admin Metrics & Read Control (R4)', () => {
    beforeEach(async () => {
      await client.adminLogin('123456');
    });

    it('test_admin_metrics_global_kpis', async () => {
      const res = await client.getAdminMetrics();
      assert.equal(res.status, 200);
      const m = res.data.metrics;
      assert.ok(m.totalAnnouncements >= 5);
      assert.equal(m.totalCensus, 52);
      assert.ok(typeof m.averageCoveragePercentage === 'number');
      assert.ok(typeof m.pendingListings === 'number');
    });

    it('test_admin_announcement_reads_confirmed_list', async () => {
      const res = await client.getAdminAnnouncementReads(1);
      assert.equal(res.status, 200);
      const confirmed = res.data.confirmed;
      assert.ok(Array.isArray(confirmed));
      assert.ok(confirmed.length >= 21);

      const first = confirmed[0];
      assert.ok(first.propertyId);
      assert.ok(first.residentName);
      assert.ok(first.role);
      assert.ok(first.confirmedAt);
    });

    it('test_admin_announcement_reads_pending_list', async () => {
      const res = await client.getAdminAnnouncementReads(1);
      assert.equal(res.status, 200);
      const pending = res.data.pending;
      assert.ok(Array.isArray(pending));
      assert.equal(pending.length + res.data.confirmed.length, 52);
    });

    it('test_admin_announcement_reads_coverage_percentage', async () => {
      const res = await client.getAdminAnnouncementReads(1);
      assert.equal(res.status, 200);
      assert.equal(res.data.coveragePercentage, 40.4);
    });

    it('test_admin_announcement_reads_grouped_by_manzana', async () => {
      const res = await client.getAdminAnnouncementReads(1);
      assert.equal(res.status, 200);
      const blocks = new Set(res.data.pending.map(p => p.block));
      assert.ok(blocks.has('Mz. A') || blocks.has('Mz. B') || blocks.has('Mz. C'));
    });

    it('test_admin_announcement_reads_404_nonexistent', async () => {
      const res = await client.getAdminAnnouncementReads(9999);
      assert.equal(res.status, 404);
    });
  });

  // ==========================================
  // Feature Area 11: Missing Houses WhatsApp Reminder Generator (R4)
  // ==========================================
  describe('11. Missing Houses WhatsApp Reminder Generator (R4)', () => {
    beforeEach(async () => {
      await client.adminLogin('123456');
    });

    it('test_whatsapp_reminder_message_structure', async () => {
      const res = await client.getAdminWhatsAppReminder(1);
      assert.equal(res.status, 200);
      const text = res.data.messageText;
      assert.ok(text.includes('URBANIZACIÓN LOS LAURELES'));
      assert.ok(text.includes('Asunto:'));
      assert.ok(text.includes('Leer y confirmar aquí:'));
      assert.ok(text.includes('Avance de confirmación:'));
      assert.ok(text.includes('Inmuebles pendientes por confirmar'));
    });

    it('test_whatsapp_reminder_groups_by_manzana', async () => {
      const res = await client.getAdminWhatsAppReminder(1);
      assert.equal(res.status, 200);
      const text = res.data.messageText;
      assert.ok(text.includes('• *Mz.'));
    });

    it('test_whatsapp_reminder_includes_announcement_url', async () => {
      const res = await client.getAdminWhatsAppReminder(1);
      assert.equal(res.status, 200);
      assert.ok(res.data.messageText.includes('/comunicados/asamblea-general-ordinaria-2026'));
    });

    it('test_whatsapp_reminder_exact_percentages', async () => {
      const res = await client.getAdminWhatsAppReminder(1);
      assert.equal(res.status, 200);
      assert.equal(res.data.confirmedCount, 21);
      assert.equal(res.data.missingCount, 31);
      assert.equal(res.data.coveragePercent, 40);
    });

    it('test_whatsapp_reminder_all_confirmed_state', () => {
      const res = generateWhatsAppReminderMessage(
        'Aviso Comunal',
        'https://loslaureles.pe/comunicados/aviso',
        52,
        []
      );
      assert.equal(res.missingCount, 0);
      assert.equal(res.coveragePercent, 100);
      assert.ok(res.messageText.includes('100% de cobertura'));
    });

    it('test_whatsapp_reminder_wa_me_url_generation', async () => {
      const res = await client.getAdminWhatsAppReminder(1);
      assert.equal(res.status, 200);
      assert.ok(res.data.whatsappUrl.startsWith('https://wa.me/?text='));
    });
  });

  // ==========================================
  // Feature Area 12: CSV Export with UTF-8 BOM (R4)
  // ==========================================
  describe('12. CSV Export with UTF-8 BOM (R4)', () => {
    beforeEach(async () => {
      await client.adminLogin('123456');
    });

    it('test_csv_export_starts_with_utf8_bom', async () => {
      const res = await client.exportAttendanceCsv(1);
      assert.equal(res.status, 200);
      const content = res.content;
      assert.ok(content.startsWith('\uFEFF'), 'CSV stream must begin with UTF-8 BOM (\\uFEFF)');
    });

    it('test_csv_export_headers_schema', async () => {
      const res = await client.exportAttendanceCsv(1);
      assert.equal(res.status, 200);
      const firstLine = res.content.replace(/^\uFEFF/, '').split('\r\n')[0];
      const headers = firstLine.split(';');
      assert.equal(headers[0], 'Manzana');
      assert.equal(headers[1], 'Lote');
      assert.equal(headers[2], 'Codigo_Inmueble');
      assert.equal(headers[3], 'Direccion');
      assert.equal(headers[4], 'Residente');
      assert.equal(headers[5], 'Rol');
      assert.equal(headers[6], 'Fecha_Hora');
      assert.equal(headers[7], 'Estado');
    });

    it('test_csv_export_content_type_header', async () => {
      const res = await client.exportAttendanceCsv(1);
      assert.equal(res.status, 200);
      assert.ok(res.headers.contentType.includes('text/csv'));
      assert.ok(res.headers.contentType.includes('charset=utf-8'));
    });

    it('test_csv_export_content_disposition_header', async () => {
      const res = await client.exportAttendanceCsv(1);
      assert.equal(res.status, 200);
      assert.ok(res.headers.contentDisposition.includes('attachment; filename='));
    });

    it('test_csv_export_full_census_mode', async () => {
      const res = await client.exportAttendanceCsv(1, 'full_census');
      assert.equal(res.status, 200);
      const lines = res.content.replace(/^\uFEFF/, '').trim().split('\r\n');
      // 1 header + 52 census rows = 53 lines
      assert.equal(lines.length, 53, 'Full census mode must export all 52 properties plus header');
    });

    it('test_csv_export_confirmed_only_mode', async () => {
      const res = await client.exportAttendanceCsv(1, 'confirmed_only');
      assert.equal(res.status, 200);
      const lines = res.content.replace(/^\uFEFF/, '').trim().split('\r\n');
      // 1 header + 21 confirmed = 22 lines
      assert.equal(lines.length, 22, 'Confirmed-only mode must export only confirmed rows plus header');
    });
  });
});

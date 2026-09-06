/**
 * TIER 2: BOUNDARY & CORNER CASES TEST SUITE
 * Exhaustive edge-case verification: empty inputs, extreme lengths, SQL injection vectors,
 * duplicate handling, phone formatting permutations, and boundary numerical limits.
 * Urbanización Los Laureles
 */

import { describe, it, beforeEach, assert } from '../helpers/test-framework.mjs';
import { LaurelesTestClient } from '../helpers/test-client.mjs';
import {
  generateWhatsAppLink,
  calculateQuorumProgress,
  validateReadConfirmationPayload,
  validateMarketplaceSubmissionPayload
} from '../helpers/domain-logic.mjs';

const client = new LaurelesTestClient();

describe('Tier 2: Boundary & Corner Cases', () => {
  beforeEach(async () => {
    client.reset();
    await client.init();
  });

  // ==========================================
  // 1. Empty Strings & Whitespace Invalidation
  // ==========================================
  describe('1. Empty Strings & Whitespace Invalidation', () => {
    it('test_boundary_read_confirmation_empty_resident_name', async () => {
      const res = await client.confirmRead(3, {
        propertyId: 10,
        residentName: '',
        role: 'Propietario'
      });
      assert.equal(res.status, 400);
      assert.equal(res.data.code, 'VALIDATION_ERROR');
    });

    it('test_boundary_read_confirmation_whitespace_only_name', async () => {
      const res = await client.confirmRead(3, {
        propertyId: 10,
        residentName: '     ',
        role: 'Propietario'
      });
      assert.equal(res.status, 400);
      assert.equal(res.data.code, 'VALIDATION_ERROR');
    });

    it('test_boundary_read_confirmation_empty_role', async () => {
      const res = await client.confirmRead(3, {
        propertyId: 10,
        residentName: 'Silvia Cornejo',
        role: ''
      });
      assert.equal(res.status, 400);
    });

    it('test_boundary_marketplace_empty_fields', async () => {
      const res = await client.submitMarketplaceListing({
        title: '',
        category: '',
        description: '',
        entrepreneurName: '',
        propertyAddress: '',
        phone: '',
        scheduleHours: ''
      });
      assert.equal(res.status, 400);
      assert.ok(res.data.errors.length >= 5, 'Should flag multiple missing required fields');
    });

    it('test_boundary_admin_login_empty_and_whitespace_pin', async () => {
      const emptyRes = await client.adminLogin('');
      assert.equal(emptyRes.status, 401);

      const spaceRes = await client.adminLogin('    ');
      assert.equal(spaceRes.status, 401);
    });
  });

  // ==========================================
  // 2. Security Vectors & Adversarial Input
  // ==========================================
  describe('2. Security Vectors & Adversarial Input', () => {
    it('test_boundary_admin_login_sql_injection_attempt', async () => {
      const maliciousPins = [
        "' OR '1'='1",
        "123456' OR '1'='1' --",
        "admin'--",
        "'; DROP TABLE announcements; --"
      ];

      for (const pin of maliciousPins) {
        const res = await client.adminLogin(pin);
        assert.equal(res.status, 401, `SQL injection vector "${pin}" must be rejected with 401`);
        assert.ok(!client.sessionCookie);
      }
    });

    it('test_boundary_read_confirmation_xss_in_name_sanitized', async () => {
      const xssName = '<script>alert("hacked")</script>';
      const res = await client.confirmRead(3, {
        propertyId: 10,
        residentName: xssName,
        role: 'Propietario'
      });
      // Accepts string as data without executing or corrupting
      assert.equal(res.status, 201);
      assert.equal(res.data.confirmation.residentName, xssName);
    });

    it('test_boundary_marketplace_submission_sql_injection_payload', async () => {
      const res = await client.submitMarketplaceListing({
        title: "Bodega'); DROP TABLE census_properties;--",
        category: 'Gastronomía / Comida',
        description: 'Venta de abarrotes, bebidas y lácteos frescos para toda la urbanización.',
        entrepreneurName: "Admin'--",
        propertyAddress: 'Mz A Lt 1',
        phone: '987111222',
        scheduleHours: 'Lun a Dom 8am - 10pm'
      });
      // Stored safely as text without executing SQL
      assert.equal(res.status, 201);
      assert.equal(res.data.status, 'pending');

      // Verify census properties are intact
      const census = await client.getCensusProperties();
      assert.equal(census.data.total, 52);
    });
  });

  // ==========================================
  // 3. String Length Boundaries (Min / Max)
  // ==========================================
  describe('3. String Length Boundaries (Min / Max)', () => {
    it('test_boundary_resident_name_length_thresholds', () => {
      // 2 characters: rejected
      const shortRes = validateReadConfirmationPayload({
        propertyId: 10,
        residentName: 'Al',
        role: 'Propietario'
      });
      assert.equal(shortRes.isValid, false);

      // Exactly 3 characters: accepted
      const exactThree = validateReadConfirmationPayload({
        propertyId: 10,
        residentName: 'Ana',
        role: 'Propietario'
      });
      assert.equal(exactThree.isValid, true);

      // 150 characters: accepted
      const maxAllowed = validateReadConfirmationPayload({
        propertyId: 10,
        residentName: 'A'.repeat(150),
        role: 'Propietario'
      });
      assert.equal(maxAllowed.isValid, true);

      // 151 characters: rejected
      const exceedMax = validateReadConfirmationPayload({
        propertyId: 10,
        residentName: 'A'.repeat(151),
        role: 'Propietario'
      });
      assert.equal(exceedMax.isValid, false);
    });

    it('test_boundary_marketplace_description_length_thresholds', () => {
      // 14 chars: rejected (< 15)
      const shortDesc = validateMarketplaceSubmissionPayload({
        title: 'Pastelería Sol',
        category: 'Gastronomía / Comida',
        description: '12345678901234',
        entrepreneurName: 'Rosa',
        propertyAddress: 'Mz A Lt 1',
        phone: '987111222',
        scheduleHours: 'Lun-Vie 9-5'
      });
      assert.equal(shortDesc.isValid, false);

      // 15 chars: accepted
      const exactMin = validateMarketplaceSubmissionPayload({
        title: 'Pastelería Sol',
        category: 'Gastronomía / Comida',
        description: '123456789012345',
        entrepreneurName: 'Rosa',
        propertyAddress: 'Mz A Lt 1',
        phone: '987111222',
        scheduleHours: 'Lun-Vie 9-5'
      });
      assert.equal(exactMin.isValid, true);

      // 500 chars: accepted
      const exactMax = validateMarketplaceSubmissionPayload({
        title: 'Pastelería Sol',
        category: 'Gastronomía / Comida',
        description: 'D'.repeat(500),
        entrepreneurName: 'Rosa',
        propertyAddress: 'Mz A Lt 1',
        phone: '987111222',
        scheduleHours: 'Lun-Vie 9-5'
      });
      assert.equal(exactMax.isValid, true);

      // 501 chars: rejected
      const exceedMax = validateMarketplaceSubmissionPayload({
        title: 'Pastelería Sol',
        category: 'Gastronomía / Comida',
        description: 'D'.repeat(501),
        entrepreneurName: 'Rosa',
        propertyAddress: 'Mz A Lt 1',
        phone: '987111222',
        scheduleHours: 'Lun-Vie 9-5'
      });
      assert.equal(exceedMax.isValid, false);
    });

    it('test_boundary_marketplace_title_length_limits', () => {
      const minTitle = validateMarketplaceSubmissionPayload({
        title: 'AB',
        category: 'Gastronomía / Comida',
        description: 'Descripción de prueba válida con más de 15 caracteres.',
        entrepreneurName: 'Rosa',
        propertyAddress: 'Mz A Lt 1',
        phone: '987111222',
        scheduleHours: 'Lun-Vie 9-5'
      });
      assert.equal(minTitle.isValid, false);

      const maxTitle = validateMarketplaceSubmissionPayload({
        title: 'T'.repeat(81),
        category: 'Gastronomía / Comida',
        description: 'Descripción de prueba válida con más de 15 caracteres.',
        entrepreneurName: 'Rosa',
        propertyAddress: 'Mz A Lt 1',
        phone: '987111222',
        scheduleHours: 'Lun-Vie 9-5'
      });
      assert.equal(maxTitle.isValid, false);
    });
  });

  // ==========================================
  // 4. Phone Formatting Corner Cases
  // ==========================================
  describe('4. Phone Formatting Corner Cases', () => {
    it('test_boundary_phone_9digit_mobile_no_country_code', () => {
      const link = generateWhatsAppLink('912345678', 'Negocio', 'Pedro');
      assert.ok(link.includes('https://wa.me/51912345678'));
    });

    it('test_boundary_phone_with_dots_and_hyphens', () => {
      const link = generateWhatsAppLink('912.345-678', 'Negocio', 'Pedro');
      assert.ok(link.includes('https://wa.me/51912345678'));
    });

    it('test_boundary_phone_with_international_prefix_plus', () => {
      const link = generateWhatsAppLink('+51 912 345 678', 'Negocio', 'Pedro');
      assert.ok(link.includes('https://wa.me/51912345678'));
    });

    it('test_boundary_phone_international_foreign_number', () => {
      // US number +1 202 555 0199 (11 digits)
      const link = generateWhatsAppLink('+1 (202) 555-0199', 'Negocio', 'John');
      assert.ok(link.includes('https://wa.me/12025550199'));
    });

    it('test_boundary_phone_empty_or_non_numeric_throws', () => {
      assert.throws(() => generateWhatsAppLink(''), /El teléfono es obligatorio/);
      assert.throws(() => generateWhatsAppLink('   '), /no contiene dígitos válidos/);
      assert.throws(() => generateWhatsAppLink('abc-xyz'), /no contiene dígitos válidos/);
    });
  });

  // ==========================================
  // 5. Numerical Limits & Quorum Progress Boundaries
  // ==========================================
  describe('5. Numerical Limits & Quorum Progress Boundaries', () => {
    it('test_boundary_quorum_progress_zero_confirmed', () => {
      const q = calculateQuorumProgress(0, 52);
      assert.equal(q.confirmedCount, 0);
      assert.equal(q.totalProperties, 52);
      assert.equal(q.percentage, 0.0);
      assert.equal(q.tier, 'low');
    });

    it('test_boundary_quorum_progress_all_confirmed_100_percent', () => {
      const q = calculateQuorumProgress(52, 52);
      assert.equal(q.confirmedCount, 52);
      assert.equal(q.totalProperties, 52);
      assert.equal(q.percentage, 100.0);
      assert.equal(q.tier, 'high');
    });

    it('test_boundary_quorum_progress_negative_confirmed_clamped_to_zero', () => {
      const q = calculateQuorumProgress(-5, 52);
      assert.equal(q.confirmedCount, 0);
      assert.equal(q.percentage, 0.0);
    });

    it('test_boundary_quorum_progress_exceeding_total_clamped_to_total', () => {
      const q = calculateQuorumProgress(60, 52);
      assert.equal(q.confirmedCount, 52);
      assert.equal(q.percentage, 100.0);
    });

    it('test_boundary_quorum_progress_zero_total_census_safe_no_nan', () => {
      const q = calculateQuorumProgress(0, 0);
      assert.equal(q.percentage, 0.0);
      assert.ok(!isNaN(q.percentage));
    });

    it('test_boundary_quorum_progress_nan_input_handled_gracefully', () => {
      const q = calculateQuorumProgress(NaN, 52);
      assert.equal(q.confirmedCount, 0);
      assert.equal(q.percentage, 0.0);
    });
  });

  // ==========================================
  // 6. Non-Existent IDs & Invalid Resources
  // ==========================================
  describe('6. Non-Existent IDs & Invalid Resources', () => {
    it('test_boundary_read_confirmation_invalid_property_id', async () => {
      const res = await client.confirmRead(1, {
        propertyId: 9999, // Non-existent in 52 census
        residentName: 'Desconocido',
        role: 'Propietario'
      });
      assert.equal(res.status, 400);
      assert.ok(res.data.errors.some(e => e.includes('no existe en el padrón')));
    });

    it('test_boundary_read_confirmation_nonexistent_announcement_id', async () => {
      const res = await client.confirmRead(9999, {
        propertyId: 1,
        residentName: 'Carlos Mendoza',
        role: 'Propietario'
      });
      assert.equal(res.status, 404);
    });

    it('test_boundary_announcement_slug_nonexistent_returns_404', async () => {
      const res = await client.getAnnouncementBySlug('comunicado-que-no-existe-en-laureles');
      assert.equal(res.status, 404);
    });

    it('test_boundary_marketplace_admin_update_nonexistent_listing_returns_404', async () => {
      await client.adminLogin('123456');
      const res = await client.updateMarketplaceStatus(9999, 'approved');
      assert.equal(res.status, 404);
    });
  });

  // ==========================================
  // 7. Isolation of Unapproved Marketplace Items
  // ==========================================
  describe('7. Isolation of Unapproved Marketplace Items', () => {
    it('test_boundary_rejected_items_strictly_hidden_from_public', async () => {
      await client.adminLogin('123456');
      // Submit a business
      const sub = await client.submitMarketplaceListing({
        title: 'Taller Mecánico Ruidoso',
        category: 'Servicios Técnicos',
        description: 'Reparación de motores y tubos de escape ruidosos dentro de la urbanización.',
        entrepreneurName: 'Técnico Extraño',
        propertyAddress: 'Mz B Lt 5',
        phone: '987000111',
        scheduleHours: '24 horas'
      });
      assert.equal(sub.status, 201);

      // Admin rejects it
      const rej = await client.updateMarketplaceStatus(sub.data.id, 'rejected');
      assert.equal(rej.status, 200);

      // Check public catalog
      const pub = await client.getMarketplaceListings();
      const ids = pub.data.listings.map(l => l.id);
      assert.ok(!ids.includes(sub.data.id), 'Rejected business MUST NOT appear in public catalog');
    });

    it('test_boundary_pending_items_strictly_hidden_from_public', async () => {
      const sub = await client.submitMarketplaceListing({
        title: 'Gimnasio Comunitario',
        category: 'Belleza / Cuidado Personal',
        description: 'Entrenamiento funcional y calistenia al aire libre en el parque.',
        entrepreneurName: 'Esteban Guzmán',
        propertyAddress: 'Mz E Lt 7',
        phone: '987222333',
        scheduleHours: '6am - 9am'
      });
      assert.equal(sub.status, 201);

      const pub = await client.getMarketplaceListings();
      const ids = pub.data.listings.map(l => l.id);
      assert.ok(!ids.includes(sub.data.id), 'Pending business MUST NOT appear in public catalog');
    });
  });
});

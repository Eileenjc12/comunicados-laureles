/**
 * TIER 5: ADVERSARIAL COVERAGE HARDENING TEST SUITE
 * Milestone 6 — Urbanización Los Laureles Platform
 *
 * Adversarial stress testing across 6 critical operational vectors:
 * 1. Quorum Anti-Inflation & Physical Unit Unique Constraints
 * 2. WhatsApp Direct Link Generation & Peruvian Phone Normalization (E.164)
 * 3. Missing Houses Reminder Grouping & Text Boundary Limits
 * 4. Excel Attendance CSV Export Integrity & UTF-8 BOM Byte Prefix
 * 5. Admin Authentication, PIN Defense, 256-bit Entropy & Route Guards
 * 6. SQL Injection Resilience & Parameterized Query Immunity
 */

import { describe, it, beforeEach, assert } from '../helpers/test-framework.mjs';
import { LaurelesTestClient } from '../helpers/test-client.mjs';
import {
  sanitizePhone,
  generateWhatsAppLink,
  generateWhatsAppReminderMessage,
  generateAttendanceCsv,
  calculateQuorumProgress,
  validateReadConfirmationPayload,
  validateMarketplaceSubmissionPayload,
  RESIDENTIAL_CENSUS
} from '../helpers/domain-logic.mjs';

const client = new LaurelesTestClient();

describe('Tier 5: Adversarial Coverage Hardening (Milestone 6)', () => {
  beforeEach(async () => {
    client.reset();
    await client.init();
  });

  // =========================================================================
  // 1. Quorum Anti-Inflation & Unique Constraint Verification
  // =========================================================================
  describe('1. Quorum Anti-Inflation & Physical Unit Unique Constraints', () => {
    it('test_anti_inflation_cannot_bypass_unique_constraint_with_different_roles', async () => {
      // Step 1: Owner confirms reading for property 10 on Announcement 3
      const firstRes = await client.confirmRead(3, {
        propertyId: 10,
        residentName: 'Silvia Mónica Cornejo Peña',
        role: 'Propietario'
      });
      assert.equal(firstRes.status, 201, 'First confirmation must succeed');

      // Step 2: Tenant subsequently tries to confirm for SAME property on SAME announcement
      const secondRes = await client.confirmRead(3, {
        propertyId: 10,
        residentName: 'Inquilino Juan Pérez',
        role: 'Inquilino'
      });
      assert.equal(secondRes.status, 409, 'Must reject duplicate confirmation with 409 Conflict');
      assert.equal(secondRes.data.code, 'ALREADY_CONFIRMED');
    });

    it('test_anti_inflation_cannot_bypass_unique_constraint_with_different_casing_or_whitespace', async () => {
      // Property 1 is already seeded as confirmed on Announcement 1
      const res = await client.confirmRead(1, {
        propertyId: 1,
        residentName: '   Carlos Mendoza   ',
        role: 'Propietario'
      });
      assert.equal(res.status, 409);
      assert.equal(res.data.code, 'ALREADY_CONFIRMED');
    });

    it('test_anti_inflation_cannot_bypass_via_alternate_property_payload_keys', async () => {
      // Try passing property_id (snake_case) instead of propertyId
      const res = await client.confirmRead(1, {
        property_id: 1,
        resident_name: 'Carlos Mendoza',
        role: 'Propietario'
      });
      assert.equal(res.status, 409);
      assert.equal(res.data.code, 'ALREADY_CONFIRMED');
    });

    it('test_anti_inflation_duplicate_attempts_do_not_increment_visit_or_quorum_counters', async () => {
      const annBefore = await client.getAnnouncementBySlug('asamblea-general-ordinaria-2026');
      const countBefore = annBefore.data.confirmedPropertiesCount;

      // Retrying property 1 duplicate
      await client.confirmRead(1, {
        propertyId: 1,
        residentName: 'Carlos Mendoza',
        role: 'Propietario'
      });

      const annAfter = await client.getAnnouncementBySlug('asamblea-general-ordinaria-2026');
      const countAfter = annAfter.data.confirmedPropertiesCount;

      assert.equal(countAfter, countBefore, 'Confirmed count must remain strictly unchanged on duplicate attempt');
    });

    it('test_anti_inflation_quorum_percentage_strictly_bounded_between_0_and_100', () => {
      // 0 confirmed
      const zero = calculateQuorumProgress(0, 52);
      assert.equal(zero.percentage, 0.0);
      assert.equal(zero.tier, 'low');

      // 52 confirmed
      const full = calculateQuorumProgress(52, 52);
      assert.equal(full.percentage, 100.0);
      assert.equal(full.tier, 'high');

      // Attempt to overflow (e.g. 100 confirmations in 52 property census)
      const overflow = calculateQuorumProgress(100, 52);
      assert.equal(overflow.confirmedCount, 52);
      assert.equal(overflow.percentage, 100.0);

      // Attempt underflow (-10 confirmations)
      const underflow = calculateQuorumProgress(-10, 52);
      assert.equal(underflow.confirmedCount, 0);
      assert.equal(underflow.percentage, 0.0);
    });
  });

  // =========================================================================
  // 2. WhatsApp Direct Link Generation & Peruvian Phone Normalization
  // =========================================================================
  describe('2. WhatsApp Direct Link Generation & Peruvian Phone Normalization', () => {
    it('test_whatsapp_exotic_peruvian_phone_number_formats_normalized_to_e164', () => {
      const testCases = [
        { input: '987654321', expected: '51987654321' },
        { input: '987 654 321', expected: '51987654321' },
        { input: '987-654-321', expected: '51987654321' },
        { input: '987.654.321', expected: '51987654321' },
        { input: '+51 987 654 321', expected: '51987654321' },
        { input: '+51 (987) 654-321', expected: '51987654321' },
        { input: '+51-987-654-321', expected: '51987654321' },
        { input: '51987654321', expected: '51987654321' },
        { input: '  +51 987 654 321  ', expected: '51987654321' }
      ];

      for (const tc of testCases) {
        const link = generateWhatsAppLink(tc.input, 'Pastelería', 'Doña Rosa');
        assert.ok(
          link.startsWith(`https://wa.me/${tc.expected}`),
          `Failed for input "${tc.input}": expected prefix https://wa.me/${tc.expected}, got ${link}`
        );
      }
    });

    it('test_whatsapp_malformed_and_empty_phone_numbers_throw_validation_error', () => {
      const invalidPhones = ['', '   ', 'abcdef', '---', '()', '+++'];
      for (const phone of invalidPhones) {
        assert.throws(
          () => generateWhatsAppLink(phone, 'Negocio', 'Emprendedor'),
          /El teléfono es obligatorio|no contiene dígitos válidos/i,
          `Phone "${phone}" should throw validation error`
        );
      }
    });

    it('test_whatsapp_special_characters_and_spanish_diacritics_cleanly_percent_encoded', () => {
      const businessName = 'Panadería & Pastelería "El Cañonazo"';
      const entrepreneur = 'María José Peña & Cía.';
      const customTemplate = '¡Hola {name}! ¿Tienen disponibilidad de "{title}" para hoy? ¡Muchas gracias!';

      const link = generateWhatsAppLink('987123456', businessName, entrepreneur, customTemplate);
      const url = new URL(link);
      const text = url.searchParams.get('text');

      assert.ok(!link.includes(' '), 'Generated URL must not contain raw unencoded spaces');
      assert.ok(text.includes('María José Peña & Cía.'));
      assert.ok(text.includes('Panadería & Pastelería "El Cañonazo"'));
      assert.ok(text.startsWith('¡Hola'));
      assert.ok(text.endsWith('¡Muchas gracias!'));
    });
  });

  // =========================================================================
  // 3. Missing Houses Reminder Grouping & Text Boundary Limits
  // =========================================================================
  describe('3. Missing Houses Reminder Grouping & Text Boundary Limits', () => {
    it('test_whatsapp_reminder_groups_neatly_by_manzana_in_lexicographical_order', () => {
      const missingMap = {
        'Mz. C': ['Lote 01', 'Lote 05'],
        'Mz. A': ['Lote 02', 'Lote 09'],
        'Mz. B': ['Lote 03', 'Lote 11']
      };

      const message = generateWhatsAppReminderMessage(
        'Mantenimiento General',
        'https://loslaureles.pe/comunicados/mantenimiento',
        missingMap
      );

      // Verify header, public URL, and block formatting
      assert.ok(message.includes('URBANIZACIÓN LOS LAURELES'));
      assert.ok(message.includes('https://loslaureles.pe/comunicados/mantenimiento'));

      // Check ordering: Mz. A must appear before Mz. B, and Mz. B before Mz. C
      const posA = message.indexOf('• *Mz. A:*');
      const posB = message.indexOf('• *Mz. B:*');
      const posC = message.indexOf('• *Mz. C:*');

      assert.ok(posA !== -1, 'Mz. A must exist');
      assert.ok(posB !== -1, 'Mz. B must exist');
      assert.ok(posC !== -1, 'Mz. C must exist');
      assert.ok(posA < posB, 'Mz. A must appear before Mz. B');
      assert.ok(posB < posC, 'Mz. B must appear before Mz. C');
    });

    it('test_whatsapp_reminder_worst_case_full_census_pending_stays_under_safe_text_limits', () => {
      // Worst case scenario: 0 houses confirmed, all 52 properties missing
      const fullMissingMap = {
        'Mz. A': ['Lt 01', 'Lt 02', 'Lt 03', 'Lt 04', 'Lt 05', 'Lt 06', 'Lt 07', 'Lt 08', 'Lt 09', 'Lt 10'],
        'Mz. B': ['Lt 01', 'Lt 02', 'Lt 03', 'Lt 04', 'Lt 05', 'Lt 06', 'Lt 07', 'Lt 08', 'Lt 09', 'Lt 10', 'Lt 11', 'Lt 12'],
        'Mz. C': ['Lt 01', 'Lt 02', 'Lt 03', 'Lt 04', 'Lt 05', 'Lt 06', 'Lt 07', 'Lt 08', 'Lt 09', 'Lt 10'],
        'Mz. D': ['Lt 01', 'Lt 02', 'Lt 03', 'Lt 04', 'Lt 05', 'Lt 06', 'Lt 07', 'Lt 08', 'Lt 09', 'Lt 10'],
        'Mz. E': ['Lt 01', 'Lt 02', 'Lt 03', 'Lt 04', 'Lt 05', 'Lt 06', 'Lt 07', 'Lt 08', 'Lt 09', 'Lt 10']
      };

      const message = generateWhatsAppReminderMessage(
        'Convocatoria Oficial: Asamblea General 2026',
        'https://loslaureles.pe/comunicados/asamblea-general-ordinaria-2026',
        fullMissingMap
      );

      assert.ok(message.includes('Inmuebles pendientes por confirmar (52):'));
      // WhatsApp message limit is 65,536 chars, standard URL link limit is ~2048 chars
      assert.ok(message.length < 1500, `Message length (${message.length}) should remain well under 1500 chars for full census`);
    });

    it('test_whatsapp_reminder_100_percent_quorum_state_displays_completion_notice', () => {
      const emptyMap = {
        'Mz. A': [],
        'Mz. B': [],
        'Mz. C': [],
        'Mz. D': [],
        'Mz. E': []
      };

      const message = generateWhatsAppReminderMessage(
        'Mantenimiento Terminado',
        'https://loslaureles.pe/comunicados/mantenimiento',
        emptyMap
      );

      assert.ok(message.includes('100% de cobertura'));
      assert.ok(message.includes('¡Todas las casas han confirmado la lectura!'));
    });
  });

  // =========================================================================
  // 4. Excel Attendance CSV Export Compatibility
  // =========================================================================
  describe('4. Excel Attendance CSV Export Compatibility', () => {
    it('test_csv_export_starts_strictly_with_utf8_bom_for_excel_compatibility', () => {
      const csv = generateAttendanceCsv('Asamblea', []);
      assert.ok(csv.startsWith('\uFEFF'), 'CSV must strictly start with \\uFEFF (UTF-8 BOM)');
    });

    it('test_csv_export_contains_exact_required_spanish_column_headers', () => {
      const csv = generateAttendanceCsv('Asamblea', []);
      const cleanCsv = csv.replace(/^\uFEFF/, '');
      const firstLine = cleanCsv.split('\r\n')[0];

      const expectedHeaders = [
        'Manzana',
        'Lote',
        'Codigo_Inmueble',
        'Direccion',
        'Residente',
        'Rol',
        'Fecha_Hora',
        'Estado'
      ].join(';');

      assert.equal(firstLine, expectedHeaders);
    });

    it('test_csv_export_escapes_semicolons_quotes_and_accents_safely', () => {
      const testRows = [
        {
          manzana: 'Mz. A',
          lote: 'Lote 01',
          code: 'MZ-A-01',
          address: 'Calle Los Rosales 101, Int. "B"; Sector 1',
          residentName: 'Silva, Carlos & "Herederos"',
          role: 'Propietario',
          confirmedAt: '2026-09-04T12:00:00Z',
          confirmed: true,
          status: 'CONFIRMADO'
        }
      ];

      const csv = generateAttendanceCsv('Asamblea', testRows);
      assert.ok(csv.includes('"Calle Los Rosales 101, Int. ""B""; Sector 1"'));
      assert.ok(csv.includes('"Silva, Carlos & ""Herederos"""'));
    });

    it('test_csv_export_full_census_includes_all_52_properties_with_status', () => {
      const allRows = RESIDENTIAL_CENSUS.map(p => ({
        manzana: p.manzana,
        lote: p.lote,
        code: p.code,
        address: p.address,
        residentName: p.owner_name,
        role: 'Propietario',
        confirmed: false,
        status: 'PENDIENTE'
      }));

      const csv = generateAttendanceCsv('Asamblea', allRows, { mode: 'full_census' });
      const lines = csv.replace(/^\uFEFF/, '').trim().split('\r\n');
      assert.equal(lines.length, 53, '1 header line + 52 census property rows = 53 lines');
    });
  });

  // =========================================================================
  // 5. Admin Authentication, Entropy, Expiration & Route Guard Protection
  // =========================================================================
  describe('5. Admin Authentication, Entropy, Expiration & Route Guards', () => {
    it('test_admin_auth_valid_pin_generates_256bit_session_token', async () => {
      const res = await client.adminLogin('123456');
      assert.equal(res.status, 200);
      assert.ok(client.sessionCookie);

      const tokenMatch = client.sessionCookie.match(/laureles_admin_session=([0-9a-fA-F]+)/);
      assert.ok(tokenMatch, 'Session cookie must contain token');
      const token = tokenMatch[1];

      // 256 bits = 32 bytes = 64 hexadecimal characters
      assert.equal(token.length, 64, 'Token must be exactly 64 hexadecimal characters (256-bit entropy)');
      assert.match(token, /^[0-9a-fA-F]{64}$/, 'Token must match hex pattern');
    });

    it('test_admin_auth_unauthorized_endpoints_rejected_with_401_without_cookie', async () => {
      // Clear session cookie
      client.sessionCookie = null;

      const metricsRes = await client.getAdminMetrics();
      assert.equal(metricsRes.status, 401, 'Metrics must return 401 without cookie');

      const readsRes = await client.getAdminAnnouncementReads(1);
      assert.equal(readsRes.status, 401, 'Reads audit must return 401 without cookie');

      const csvRes = await client.exportAttendanceCsv(1);
      assert.equal(csvRes.status, 401, 'CSV export must return 401 without cookie');

      const reminderRes = await client.getWhatsAppReminder(1);
      assert.equal(reminderRes.status, 401, 'WhatsApp reminder API must return 401 without cookie');
    });

    it('test_admin_auth_logout_revokes_session_and_subsequent_calls_fail', async () => {
      await client.adminLogin('123456');
      assert.ok(client.sessionCookie);

      const beforeLogout = await client.getAdminMetrics();
      assert.equal(beforeLogout.status, 200);

      const logoutRes = await client.adminLogout();
      assert.equal(logoutRes.status, 200);
      assert.equal(client.sessionCookie, null);

      const afterLogout = await client.getAdminMetrics();
      assert.equal(afterLogout.status, 401, 'Must be rejected after logout');
    });
  });

  // =========================================================================
  // 6. SQL Injection Resilience & Parameterized Query Immunity
  // =========================================================================
  describe('6. SQL Injection Resilience & Parameterized Query Immunity', () => {
    it('test_sqli_resilience_admin_login_payloads_do_not_bypass_authentication', async () => {
      const sqliPayloads = [
        "' OR '1'='1",
        "123456' OR '1'='1' --",
        "admin'--",
        "'; DROP TABLE admin_sessions; --",
        "' UNION SELECT '1', '2' --"
      ];

      for (const payload of sqliPayloads) {
        const res = await client.adminLogin(payload);
        assert.equal(res.status, 401, `Payload "${payload}" must be rejected with 401`);
        assert.equal(client.sessionCookie, null);
      }
    });

    it('test_sqli_resilience_read_confirmation_payload_stored_safely_as_text', async () => {
      const maliciousName = "Vecino'; DROP TABLE read_confirmations; --";
      const res = await client.confirmRead(3, {
        propertyId: 15,
        residentName: maliciousName,
        role: 'Propietario'
      });

      assert.equal(res.status, 201);
      assert.equal(res.data.confirmation.residentName, maliciousName);

      // Verify read confirmations still work and database is intact
      const annRes = await client.getAnnouncementBySlug('normas-convivencia-ruidos-y-mascotas');
      assert.equal(annRes.status, 200);
      assert.ok(annRes.data.confirmedPropertiesCount > 0);
    });

    it('test_sqli_resilience_marketplace_submission_payload_stored_safely_as_text', async () => {
      const res = await client.submitMarketplaceListing({
        title: "Bodega Segura'); DELETE FROM announcements; --",
        category: 'Gastronomía / Comida',
        description: 'Venta de víveres frescos y abarrotes con atención vecinal garantizada.',
        entrepreneurName: "Admin' OR 1=1; --",
        propertyAddress: 'Mz C Lt 05',
        phone: '987654321',
        scheduleHours: 'Lun a Dom 8am - 8pm'
      });

      assert.equal(res.status, 201);
      assert.equal(res.data.status, 'pending');

      // Verify announcements table is intact
      const annList = await client.getAnnouncements();
      assert.ok(annList.data.announcements.length >= 5, 'Announcements table must not be deleted');
    });
  });
});

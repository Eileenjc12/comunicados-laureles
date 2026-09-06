/**
 * TIER 4: REAL-WORLD WORKLOADS & END-TO-END SCENARIOS
 * Full persona-driven journey simulation across all platform interfaces:
 * Neighbor emergency lookup -> Assembly notice reading -> Property confirmation ->
 * Quorum progression -> Business application -> Admin PIN login -> Metrics audit ->
 * WhatsApp reminder compilation -> Listing approval -> Excel CSV attendance download.
 * Urbanización Los Laureles
 */

import { describe, it, beforeEach, assert } from '../helpers/test-framework.mjs';
import { LaurelesTestClient } from '../helpers/test-client.mjs';
import { EMERGENCY_CONTACTS, generateWhatsAppLink } from '../helpers/domain-logic.mjs';

const client = new LaurelesTestClient();

describe('Tier 4: Real-World Workloads & E2E Journeys', () => {
  beforeEach(async () => {
    client.reset();
    await client.init();
  });

  it('Scenario 1: Complete Resident & Administrator Day-in-the-Life Journey', async () => {
    // -------------------------------------------------------------------
    // Step 1: Resident visits homepage and verifies emergency contacts
    // -------------------------------------------------------------------
    const porteria = EMERGENCY_CONTACTS.find(c => c.id === 'porteria');
    assert.ok(porteria, 'Emergency directory must be accessible to resident');
    assert.equal(porteria.phone, '+51 987 654 321');

    const samu = EMERGENCY_CONTACTS.find(c => c.id === 'samu');
    assert.equal(samu.phone, '106');

    // -------------------------------------------------------------------
    // Step 2: Resident browses official notices and opens Assembly notice
    // -------------------------------------------------------------------
    const feed = await client.getAnnouncements();
    assert.equal(feed.status, 200);
    const assemblyNotice = feed.data.announcements.find(a => a.slug === 'asamblea-general-ordinaria-2026');
    assert.ok(assemblyNotice, 'Assembly notice must be visible on the board');
    assert.equal(assemblyNotice.pinned, 1, 'Notice should be pinned');

    // -------------------------------------------------------------------
    // Step 3: Resident opens notice details; atomic visit counter increments
    // -------------------------------------------------------------------
    const initialViews = assemblyNotice.visit_count;
    const viewIncRes = await client.incrementView(assemblyNotice.id);
    assert.equal(viewIncRes.status, 200);
    assert.equal(viewIncRes.data.visitCount, initialViews + 1);

    // -------------------------------------------------------------------
    // Step 4: Resident reviews initial quorum progress bar
    // -------------------------------------------------------------------
    const detailBefore = await client.getAnnouncementBySlug('asamblea-general-ordinaria-2026');
    assert.equal(detailBefore.status, 200);
    assert.equal(detailBefore.data.confirmedPropertiesCount, 21);
    assert.equal(detailBefore.data.readPercentage, 40.4);
    assert.equal(detailBefore.data.quorumTier, 'moderate');

    // -------------------------------------------------------------------
    // Step 5: Resident (Sara Maritza Ramírez, Mz C Lote 04, Property ID: 26) confirms read
    // -------------------------------------------------------------------
    const confirmRes = await client.confirmRead(assemblyNotice.id, {
      propertyId: 26,
      residentName: 'Sara Maritza Ramírez Leyva',
      role: 'Propietario'
    });
    assert.equal(confirmRes.status, 201, 'Read confirmation should be accepted');
    assert.equal(confirmRes.data.confirmation.propertyId, 26);
    assert.equal(confirmRes.data.confirmation.role, 'Propietario');

    // -------------------------------------------------------------------
    // Step 6: Verify progress bar has increased
    // -------------------------------------------------------------------
    const detailAfter = await client.getAnnouncementBySlug('asamblea-general-ordinaria-2026');
    assert.equal(detailAfter.data.confirmedPropertiesCount, 22);
    assert.equal(detailAfter.data.readPercentage, 42.3);

    // -------------------------------------------------------------------
    // Step 7: Resident retries submission; duplicate rejected with 409
    // -------------------------------------------------------------------
    const dupRes = await client.confirmRead(assemblyNotice.id, {
      propertyId: 26,
      residentName: 'Sara Maritza Ramírez Leyva',
      role: 'Propietario'
    });
    assert.equal(dupRes.status, 409);
    assert.equal(dupRes.data.code, 'ALREADY_CONFIRMED');

    // -------------------------------------------------------------------
    // Step 8: Resident submits new bakery business application
    // -------------------------------------------------------------------
    const bakerySubmission = {
      title: 'Pastelería Fina Los Laureles',
      category: 'Gastronomía / Comida',
      description: 'Tortas artesanales de chocolate, tres leches y bocaditos finos para eventos vecinales.',
      entrepreneurName: 'Sara Maritza Ramírez Leyva',
      propertyAddress: 'Mz C Lt 4',
      phone: '987556677',
      scheduleHours: 'Mar a Dom 9:00 AM - 7:00 PM',
      whatsappMessageTemplate: '¡Hola Sara! Vi tu pastelería en Mercado Laureles y quisiera hacer un pedido.'
    };

    const submitRes = await client.submitMarketplaceListing(bakerySubmission);
    assert.equal(submitRes.status, 201);
    const bakeryId = submitRes.data.id;
    assert.equal(submitRes.data.status, 'pending');

    // -------------------------------------------------------------------
    // Step 9: Bakery is NOT visible in public catalog yet
    // -------------------------------------------------------------------
    const publicCatalogBefore = await client.getMarketplaceListings();
    assert.ok(!publicCatalogBefore.data.listings.some(l => l.id === bakeryId));

    // -------------------------------------------------------------------
    // Step 10: Admin logs in with PIN
    // -------------------------------------------------------------------
    const loginRes = await client.adminLogin('123456');
    assert.equal(loginRes.status, 200);
    assert.ok(loginRes.data.success);

    // -------------------------------------------------------------------
    // Step 11: Admin inspects Reading Control dashboard
    // -------------------------------------------------------------------
    const adminReads = await client.getAdminAnnouncementReads(assemblyNotice.id);
    assert.equal(adminReads.status, 200);
    assert.equal(adminReads.data.confirmedCount, 22);
    assert.equal(adminReads.data.coveragePercentage, 42.3);

    // Mz C Lote 04 must be in confirmed list and absent from pending list
    const confirmedRecord = adminReads.data.confirmed.find(c => c.propertyId === 26);
    assert.ok(confirmedRecord, 'Property 26 must appear in confirmed audit table');
    assert.equal(confirmedRecord.residentName, 'Sara Maritza Ramírez Leyva');

    const pendingRecord = adminReads.data.pending.find(p => p.id === 26);
    assert.ok(!pendingRecord, 'Property 26 must be removed from missing houses');

    // -------------------------------------------------------------------
    // Step 12: Admin generates 1-Click WhatsApp Reminder
    // -------------------------------------------------------------------
    const reminderRes = await client.getAdminWhatsAppReminder(assemblyNotice.id);
    assert.equal(reminderRes.status, 200);
    assert.equal(reminderRes.data.confirmedCount, 22);
    assert.equal(reminderRes.data.missingCount, 30);
    assert.equal(reminderRes.data.coveragePercent, 42);

    const reminderMsg = reminderRes.data.messageText;
    assert.ok(reminderMsg.includes('22/52 inmuebles (42%)'));
    assert.ok(reminderRes.data.whatsappUrl.startsWith('https://wa.me/?text='));

    // Check that Mz. C line does NOT contain Lote 04
    const mzCLines = reminderMsg.split('\n').filter(l => l.includes('• *Mz. C:*'));
    if (mzCLines.length > 0) {
      assert.ok(!mzCLines[0].includes('Lote 04'), 'Confirmed Lote 04 must not be in missing reminder');
    }

    // -------------------------------------------------------------------
    // Step 13: Admin reviews moderation queue & approves bakery business
    // -------------------------------------------------------------------
    const pendingListings = await client.getAdminMarketplaceListings('pending');
    assert.equal(pendingListings.status, 200);
    const pendingBakery = pendingListings.data.listings.find(l => l.id === bakeryId);
    assert.ok(pendingBakery, 'Bakery must be present in admin pending queue');

    const approveRes = await client.updateMarketplaceStatus(bakeryId, 'approved');
    assert.equal(approveRes.status, 200);
    assert.equal(approveRes.data.listing.status, 'approved');

    // -------------------------------------------------------------------
    // Step 14: Public marketplace now displays bakery with working WhatsApp link
    // -------------------------------------------------------------------
    const publicCatalogAfter = await client.getMarketplaceListings();
    const liveBakery = publicCatalogAfter.data.listings.find(l => l.id === bakeryId);
    assert.ok(liveBakery, 'Bakery must now be live in public directory');
    assert.equal(liveBakery.title, 'Pastelería Fina Los Laureles');

    const directLink = generateWhatsAppLink(
      liveBakery.phone,
      liveBakery.title,
      liveBakery.entrepreneurName,
      liveBakery.whatsappMessageTemplate
    );
    assert.ok(directLink.includes('https://wa.me/51987556677'));
    assert.ok(directLink.includes('Pasteler%C3%ADa') || directLink.includes('pedido'));

    // -------------------------------------------------------------------
    // Step 15: Admin downloads official assembly attendance CSV (with UTF-8 BOM)
    // -------------------------------------------------------------------
    const csvRes = await client.exportAttendanceCsv(assemblyNotice.id, 'full_census');
    assert.equal(csvRes.status, 200);
    assert.ok(csvRes.content.startsWith('\uFEFF'), 'CSV must start with UTF-8 BOM');

    const csvRows = csvRes.content.replace(/^\uFEFF/, '').trim().split('\r\n');
    const saraRow = csvRows.find(r => r.includes('MZ-C-04') || r.includes('Sara Maritza Ramírez Leyva'));
    assert.ok(saraRow, 'Attendance record for Mz C Lote 04 must be present');
    assert.ok(saraRow.includes('CONFIRMADO'));
    assert.ok(saraRow.includes('Propietario'));
  });

  it('Scenario 2: High-Urgency Notice, Tenant Participation & Audit Log', async () => {
    // Step 1: Admin publishes high-urgency maintenance notice
    await client.adminLogin('123456');
    const createNotice = await client.createAnnouncement({
      title: 'Corte Programado por Limpieza de Cisterna de Emergencia',
      category: 'Urgente / Alertas',
      audience: 'General',
      summary: 'Suspensión del suministro por 4 horas este sábado.',
      content: 'Estimados vecinos...',
      is_urgent: 1,
      pinned: 1
    });
    assert.equal(createNotice.status, 201);
    const noticeId = createNotice.data.announcement.id;

    // Step 2: Tenant (David Fuentes, Mz D Lote 05, Property ID: 37) confirms read
    const tenantConfirm = await client.confirmRead(noticeId, {
      propertyId: 37,
      residentName: 'David Esteban Fuentes Fuentes',
      role: 'Inquilino'
    });
    assert.equal(tenantConfirm.status, 201);
    assert.equal(tenantConfirm.data.confirmation.role, 'Inquilino');

    // Step 3: Owner of same property attempts to confirm; rejected to protect property uniqueness
    const ownerAttempt = await client.confirmRead(noticeId, {
      propertyId: 37,
      residentName: 'Propietario Legal Mz D 05',
      role: 'Propietario'
    });
    assert.equal(ownerAttempt.status, 409);

    // Step 4: Admin verifies tenant confirmation in audit records
    const auditReads = await client.getAdminAnnouncementReads(noticeId);
    assert.equal(auditReads.status, 200);
    assert.equal(auditReads.data.confirmedCount, 1);
    const record = auditReads.data.confirmed[0];
    assert.equal(record.role, 'Inquilino');
    assert.equal(record.residentName, 'David Esteban Fuentes Fuentes');
  });
});

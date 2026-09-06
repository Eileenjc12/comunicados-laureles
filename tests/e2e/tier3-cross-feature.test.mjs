/**
 * TIER 3: CROSS-FEATURE COMBINATIONS TEST SUITE
 * Multi-module end-to-end state transitions and interconnected feature flows:
 * Read confirmations -> Admin metrics -> WhatsApp reminders -> CSV export
 * Public submissions -> Admin moderation queue -> Public catalog
 * Urbanización Los Laureles
 */

import { describe, it, beforeEach, assert } from '../helpers/test-framework.mjs';
import { LaurelesTestClient } from '../helpers/test-client.mjs';
import { generateWhatsAppLink } from '../helpers/domain-logic.mjs';

const client = new LaurelesTestClient();

describe('Tier 3: Cross-Feature Combinations', () => {
  beforeEach(async () => {
    client.reset();
    await client.init();
  });

  it('test_cross_read_confirmation_updates_admin_metrics_and_pending_list', async () => {
    await client.adminLogin('123456');

    // Step 1: Check initial reads on Announcement 1
    const initialReads = await client.getAdminAnnouncementReads(1);
    const initialConfirmedCount = initialReads.data.confirmedCount;
    const initialPendingCount = initialReads.data.pending.length;

    // Verify Property 4 (Mz A Lote 04) is in the initial pending list
    const prop4InitialPending = initialReads.data.pending.find(p => p.id === 4);
    assert.ok(prop4InitialPending, 'Property 4 must be pending initially');

    // Step 2: Neighbor confirms read for Property 4
    const confirmRes = await client.confirmRead(1, {
      propertyId: 4,
      residentName: 'Rosa Lucía Benites Morales',
      role: 'Propietario'
    });
    assert.equal(confirmRes.status, 201);

    // Step 3: Admin re-queries reads for Announcement 1
    const updatedReads = await client.getAdminAnnouncementReads(1);
    assert.equal(updatedReads.data.confirmedCount, initialConfirmedCount + 1);
    assert.equal(updatedReads.data.pending.length, initialPendingCount - 1);

    // Property 4 must now be in confirmed list and REMOVED from pending list
    const prop4Confirmed = updatedReads.data.confirmed.find(c => c.propertyId === 4);
    assert.ok(prop4Confirmed, 'Property 4 must appear in confirmed list');
    assert.equal(prop4Confirmed.residentName, 'Rosa Lucía Benites Morales');

    const prop4StillPending = updatedReads.data.pending.find(p => p.id === 4);
    assert.ok(!prop4StillPending, 'Property 4 must be removed from pending list');
  });

  it('test_cross_read_confirmation_removes_lot_from_whatsapp_reminder', async () => {
    await client.adminLogin('123456');

    // Initial reminder text contains Mz. A Lote 04
    const initialReminder = await client.getAdminWhatsAppReminder(1);
    assert.ok(initialReminder.data.messageText.includes('Lote 04'));

    // Confirm reading for Property 4 (Mz A Lote 04)
    await client.confirmRead(1, {
      propertyId: 4,
      residentName: 'Rosa Lucía Benites Morales',
      role: 'Propietario'
    });

    // Updated reminder must NO LONGER include Lote 04 under Mz. A
    const updatedReminder = await client.getAdminWhatsAppReminder(1);
    assert.equal(updatedReminder.data.confirmedCount, initialReminder.data.confirmedCount + 1);
    assert.equal(updatedReminder.data.missingCount, initialReminder.data.missingCount - 1);

    // Check specific line for Mz. A
    const lines = updatedReminder.data.messageText.split('\n');
    const mzAline = lines.find(l => l.includes('• *Mz. A:*'));
    assert.ok(mzAline, 'Manzana A line must exist in reminder');
    assert.ok(!mzAline.includes('Lote 04'), 'Lote 04 must be removed from Manzana A missing list');
  });

  it('test_cross_read_confirmation_reflects_in_csv_export', async () => {
    await client.adminLogin('123456');

    // Confirm reading for Property 8 (Mz A Lote 08 - Carmen Teresa Salazar Bravo)
    await client.confirmRead(1, {
      propertyId: 8,
      residentName: 'Carmen Teresa Salazar Bravo',
      role: 'Propietario'
    });

    // Export CSV
    const csvRes = await client.exportAttendanceCsv(1, 'full_census');
    assert.equal(csvRes.status, 200);

    const rows = csvRes.content.replace(/^\uFEFF/, '').trim().split('\r\n');
    const prop8Row = rows.find(r => r.includes('MZ-A-08') || r.includes('Carmen Teresa Salazar Bravo'));
    assert.ok(prop8Row, 'Row for Mz A Lote 08 must be in CSV');
    assert.ok(prop8Row.includes('CONFIRMADO'), 'Status must be CONFIRMADO');
    assert.ok(prop8Row.includes('Propietario'), 'Role must be Propietario');
  });

  it('test_cross_public_submission_creates_pending_in_admin_queue_isolated_from_public', async () => {
    // Initial public count
    const initialPublic = await client.getMarketplaceListings();
    const initialPublicCount = initialPublic.data.total;

    // Resident submits new listing
    const payload = {
      title: 'Bicicletería & Taller Los Laureles',
      category: 'Servicios Técnicos',
      description: 'Mantenimiento de frenos, cambios y parchado de llantas para bicicletas y scooters.',
      entrepreneurName: 'Walter Oswaldo Zamora',
      propertyAddress: 'Mz E Lt 3',
      phone: '987332211',
      scheduleHours: 'Lun a Sáb 9:00 AM - 6:00 PM'
    };

    const submitRes = await client.submitMarketplaceListing(payload);
    assert.equal(submitRes.status, 201);
    const newId = submitRes.data.id;

    // Public marketplace count remains unchanged
    const publicAfter = await client.getMarketplaceListings();
    assert.equal(publicAfter.data.total, initialPublicCount);
    const publicIds = publicAfter.data.listings.map(l => l.id);
    assert.ok(!publicIds.includes(newId));

    // Admin logs in and inspects pending queue
    await client.adminLogin('123456');
    const pendingListings = await client.getAdminMarketplaceListings('pending');
    assert.equal(pendingListings.status, 200);
    const pendingFound = pendingListings.data.listings.find(l => l.id === newId);
    assert.ok(pendingFound, 'Newly submitted business must appear in admin pending queue');
    assert.equal(pendingFound.status, 'pending');
    assert.equal(pendingFound.title, 'Bicicletería & Taller Los Laureles');
  });

  it('test_cross_admin_approval_promotes_listing_to_public_marketplace_with_whatsapp', async () => {
    // Step 1: Submit new listing
    const submitRes = await client.submitMarketplaceListing({
      title: 'Pastelería Creativa Laureles',
      category: 'Gastronomía / Comida',
      description: 'Cupcakes personalizados y tortas temáticas para todas las celebraciones.',
      entrepreneurName: 'Beatriz Yáñez',
      propertyAddress: 'Mz C Lt 10',
      phone: '998112233',
      scheduleHours: 'Mar a Dom 10am - 8pm'
    });
    const listingId = submitRes.data.id;

    // Step 2: Admin approves listing
    await client.adminLogin('123456');
    const approveRes = await client.updateMarketplaceStatus(listingId, 'approved');
    assert.equal(approveRes.status, 200);
    assert.equal(approveRes.data.listing.status, 'approved');

    // Step 3: Public marketplace now includes the listing
    const publicCatalog = await client.getMarketplaceListings();
    const approvedListing = publicCatalog.data.listings.find(l => l.id === listingId);
    assert.ok(approvedListing, 'Approved listing must now be visible in public catalog');
    assert.equal(approvedListing.title, 'Pastelería Creativa Laureles');

    // Step 4: Verify direct WhatsApp link generation
    const waLink = generateWhatsAppLink(
      approvedListing.phone,
      approvedListing.title,
      approvedListing.entrepreneurName
    );
    assert.ok(waLink.includes('https://wa.me/51998112233'));
    assert.ok(waLink.includes('Pasteler%C3%ADa%20Creativa%20Laureles') || waLink.includes('Pasteler%C3%ADa+Creativa+Laureles'));
  });

  it('test_cross_admin_reject_listing_removes_from_pending_and_keeps_hidden', async () => {
    const submitRes = await client.submitMarketplaceListing({
      title: 'Casino No Autorizado',
      category: 'Otros',
      description: 'Juegos de mesa nocturnos sin autorización vecinal.',
      entrepreneurName: 'Desconocido',
      propertyAddress: 'Mz A Lt 99',
      phone: '999000111',
      scheduleHours: 'Noche'
    });
    const listingId = submitRes.data.id;

    await client.adminLogin('123456');
    const rejectRes = await client.updateMarketplaceStatus(listingId, 'rejected');
    assert.equal(rejectRes.status, 200);
    assert.equal(rejectRes.data.listing.status, 'rejected');

    // Must not be in public
    const pub = await client.getMarketplaceListings();
    assert.ok(!pub.data.listings.some(l => l.id === listingId));

    // Must not be in pending queue
    const pending = await client.getAdminMarketplaceListings('pending');
    assert.ok(!pending.data.listings.some(l => l.id === listingId));

    // Must be in rejected list
    const rejected = await client.getAdminMarketplaceListings('rejected');
    assert.ok(rejected.data.listings.some(l => l.id === listingId));
  });

  it('test_cross_admin_creates_announcement_and_verifies_in_public_feed', async () => {
    await client.adminLogin('123456');

    const newNotice = {
      title: 'Fumigación General de Áreas Verdes y Parques Comunales',
      category: 'Mantenimiento',
      audience: 'General',
      summary: 'Jornada de fumigación preventiva contra plagas y zancudos este sábado.',
      content: '# Fumigación Comunal\n\nSe recomienda mantener puertas y ventanas cerradas...',
      is_urgent: 1,
      pinned: 0
    };

    const createRes = await client.createAnnouncement(newNotice);
    assert.equal(createRes.status, 201);
    const createdId = createRes.data.announcement.id;

    // Check public feed
    const publicAnnouncements = await client.getAnnouncements();
    const found = publicAnnouncements.data.announcements.find(a => a.id === createdId);
    assert.ok(found, 'Created announcement must be immediately visible in public feed');
    assert.equal(found.title, newNotice.title);
    assert.equal(found.is_urgent, 1);

    // Verify it is ready for read confirmation
    const confirmRes = await client.confirmRead(createdId, {
      propertyId: 1,
      residentName: 'Carlos Alberto Mendoza Silva',
      role: 'Propietario'
    });
    assert.equal(confirmRes.status, 201);
    assert.equal(confirmRes.data.stats.confirmedCount, 1);
  });

  it('test_cross_admin_pinning_toggles_sorting_position_in_public_feed', async () => {
    await client.adminLogin('123456');

    // Announcement 3 (Normas de Convivencia) is initially unpinned (pinned = 0)
    const pinRes = await client.togglePinAnnouncement(3);
    assert.equal(pinRes.status, 200);
    assert.equal(pinRes.data.pinned, 1);

    // Verify public feed: Announcement 3 is now among the pinned notices at the top
    const feed = await client.getAnnouncements();
    const topNotices = feed.data.announcements.filter(a => a.pinned);
    assert.ok(topNotices.some(a => a.id === 3), 'Announcement 3 must now be among pinned announcements');

    // Unpin it
    const unpinRes = await client.togglePinAnnouncement(3);
    assert.equal(unpinRes.status, 200);
    assert.equal(unpinRes.data.pinned, 0);
  });

  it('test_cross_admin_archiving_hides_announcement_from_public_feed', async () => {
    await client.adminLogin('123456');

    // Archive Announcement 4 (Cierre Financiero)
    const archRes = await client.toggleArchiveAnnouncement(4);
    assert.equal(archRes.status, 200);
    assert.equal(archRes.data.archived, 1);

    // Active public feed must NOT include Announcement 4
    const publicFeed = await client.getAnnouncements();
    assert.ok(!publicFeed.data.announcements.some(a => a.id === 4), 'Archived notice must be excluded from active feed');

    // But requesting with include_archived returns it
    const withArchived = await client.getAnnouncements({ include_archived: true });
    assert.ok(withArchived.data.announcements.some(a => a.id === 4));
  });

  it('test_cross_multi_criteria_announcements_filtering_intersection', async () => {
    // Filter by category: 'Convocatorias de Asamblea' AND audience: 'Solo Propietarios' AND query: 'Asamblea'
    const res = await client.getAnnouncements({
      category: 'Convocatorias de Asamblea',
      audience: 'Solo Propietarios',
      search: 'Asamblea'
    });
    assert.equal(res.status, 200);
    assert.ok(res.data.announcements.length >= 1);
    for (const item of res.data.announcements) {
      assert.equal(item.category, 'Convocatorias de Asamblea');
      assert.equal(item.audience, 'Solo Propietarios');
      assert.ok(item.title.includes('Asamblea') || item.content.includes('Asamblea'));
    }
  });
});

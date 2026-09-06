/**
 * In-Memory Domain Engine & State Manager for Urbanización Los Laureles
 * Provides high-fidelity emulation of Astro SSR API routes & SQLite storage
 * strictly adhering to PROJECT.md § Interface Contracts.
 */

import crypto from 'node:crypto';
import {
  RESIDENTIAL_CENSUS,
  TOTAL_CENSUS_PROPERTIES,
  calculateQuorumProgress,
  generateWhatsAppReminderMessage,
  generateAttendanceCsv,
  validateReadConfirmationPayload,
  validateMarketplaceSubmissionPayload
} from './domain-logic.mjs';

export class LaurelesEngine {
  constructor() {
    this.reset();
  }

  reset() {
    // 1. Residential Census
    this.properties = JSON.parse(JSON.stringify(RESIDENTIAL_CENSUS));

    // 2. Official Seed Announcements (survey_core_domain.md § 4.2.2)
    this.announcements = [
      {
        id: 1,
        title: 'Convocatoria Oficial: Asamblea General Ordinaria de Residentes 2026',
        slug: 'asamblea-general-ordinaria-2026',
        summary: 'La Junta Directiva convoca formalmente a todos los propietarios a la Asamblea General para tratar el balance anual y elección del nuevo comité.',
        content: '# Convocatoria a Asamblea General Ordinaria 2026\n\nEstimados vecinos y propietarios...',
        category: 'Convocatorias de Asamblea',
        audience: 'Solo Propietarios',
        is_urgent: 0,
        deadline_date: '2026-09-20',
        pinned: 1,
        archived: 0,
        visit_count: 148,
        created_at: '2026-09-01T10:00:00Z',
        updated_at: '2026-09-01T10:00:00Z'
      },
      {
        id: 2,
        title: 'Mantenimiento Preventivo Semestral de Cisterna y Bombas de Agua',
        slug: 'mantenimiento-cisterna-bombas-agua-septiembre',
        summary: 'Corte programado del servicio de agua potable este jueves de 08:00 a 16:00 hrs por limpieza, desinfección y mantenimiento técnico de electrobombas.',
        content: '# Mantenimiento Preventivo de Cisterna y Electrobombas...',
        category: 'Mantenimiento',
        audience: 'General',
        is_urgent: 1,
        deadline_date: '2026-09-10',
        pinned: 1,
        archived: 0,
        visit_count: 215,
        created_at: '2026-09-02T08:30:00Z',
        updated_at: '2026-09-02T08:30:00Z'
      },
      {
        id: 3,
        title: 'Normas de Convivencia: Control de Ruidos Molestos y Manejo de Mascotas en Áreas Comunes',
        slug: 'normas-convivencia-ruidos-y-mascotas',
        summary: 'Recordatorio estricto sobre horarios de silencio vecinal y uso obligatorio de correa y recojo de excretas de mascotas en parques y pasajes.',
        content: '# Disposiciones Obligatorias de Convivencia Vecinal...',
        category: 'Normas de Convivencia',
        audience: 'General',
        is_urgent: 0,
        deadline_date: null,
        pinned: 0,
        archived: 0,
        visit_count: 92,
        created_at: '2026-09-03T14:15:00Z',
        updated_at: '2026-09-03T14:15:00Z'
      },
      {
        id: 4,
        title: 'Cierre Financiero Agosto 2026 y Publicación de Estado de Cuotas de Mantenimiento',
        slug: 'cierre-financiero-agosto-2026-estado-cuotas',
        summary: 'Balance contable disponible con ingresos, egresos por seguridad y áreas verdes, y lista de inmuebles al día.',
        content: '# Rendición de Cuentas: Balance Mensual Agosto 2026...',
        category: 'Finanzas / Cuotas',
        audience: 'Solo Propietarios',
        is_urgent: 0,
        deadline_date: '2026-09-15',
        pinned: 0,
        archived: 0,
        visit_count: 64,
        created_at: '2026-09-03T18:00:00Z',
        updated_at: '2026-09-03T18:00:00Z'
      },
      {
        id: 5,
        title: 'Alerta Urgente: Reparación Inmediata de Alumbrado en Pasaje Los Cipreses y Portón 2',
        slug: 'alerta-reparacion-alumbrado-pasaje-cipreses',
        summary: 'Falla en el circuito secundario del Pasaje Los Cipreses será subsanada por cuadrilla técnica eléctrica hoy a partir de las 18:30 hrs.',
        content: '# Alerta de Mantenimiento Urgente...',
        category: 'Urgente / Alertas',
        audience: 'General',
        is_urgent: 1,
        deadline_date: null,
        pinned: 0,
        archived: 0,
        visit_count: 110,
        created_at: '2026-09-04T16:30:00Z',
        updated_at: '2026-09-04T16:30:00Z'
      }
    ];

    // 3. Read Confirmations (composite key: announcement_id + property_id)
    // Preload Announcement 1 with 21 initial reads (40.4% moderate quorum)
    this.readConfirmations = [
      { id: 1, announcementId: 1, propertyId: 1, residentName: 'Carlos Alberto Mendoza Silva', role: 'Propietario', confirmedAt: '2026-09-01T11:20:00Z' },
      { id: 2, announcementId: 1, propertyId: 2, residentName: 'María Elena Paredes Ramos', role: 'Propietario', confirmedAt: '2026-09-01T11:45:00Z' },
      { id: 3, announcementId: 1, propertyId: 3, residentName: 'Jorge Luis Villanueva Castro', role: 'Propietario', confirmedAt: '2026-09-01T12:10:00Z' },
      { id: 4, announcementId: 1, propertyId: 5, residentName: 'Héctor Manuel Quintana Torres', role: 'Propietario', confirmedAt: '2026-09-01T13:05:00Z' },
      { id: 5, announcementId: 1, propertyId: 7, residentName: 'Víctor Raúl Espinoza Vega', role: 'Propietario', confirmedAt: '2026-09-01T14:22:00Z' },
      { id: 6, announcementId: 1, propertyId: 11, residentName: 'Fernando José Alarcón Flores', role: 'Propietario', confirmedAt: '2026-09-01T15:30:00Z' },
      { id: 7, announcementId: 1, propertyId: 12, residentName: 'Ana Cecilia Barrientos Luna', role: 'Propietario', confirmedAt: '2026-09-01T16:15:00Z' },
      { id: 8, announcementId: 1, propertyId: 14, residentName: 'Juana Isabel Domínguez Ríos', role: 'Propietario', confirmedAt: '2026-09-01T17:00:00Z' },
      { id: 9, announcementId: 1, propertyId: 15, residentName: 'Roberto Carlos Estrada Pinto', role: 'Propietario', confirmedAt: '2026-09-01T18:40:00Z' },
      { id: 10, announcementId: 1, propertyId: 17, residentName: 'Gustavo Adolfo Gálvez León', role: 'Propietario', confirmedAt: '2026-09-01T19:12:00Z' },
      { id: 11, announcementId: 1, propertyId: 23, residentName: 'Javier Ignacio Navarro Campos', role: 'Propietario', confirmedAt: '2026-09-02T09:10:00Z' },
      { id: 12, announcementId: 1, propertyId: 25, residentName: 'Pedro Pablo Quiroz Valdivia', role: 'Propietario', confirmedAt: '2026-09-02T10:35:00Z' },
      { id: 13, announcementId: 1, propertyId: 27, residentName: 'Raúl Enrique Salinas Miranda', role: 'Propietario', confirmedAt: '2026-09-02T11:50:00Z' },
      { id: 14, announcementId: 1, propertyId: 29, residentName: 'Alfredo Martín Ugarte Ponce', role: 'Propietario', confirmedAt: '2026-09-02T14:05:00Z' },
      { id: 15, announcementId: 1, propertyId: 33, residentName: 'Gonzalo Andrés Zapata Robles', role: 'Propietario', confirmedAt: '2026-09-02T15:20:00Z' },
      { id: 16, announcementId: 1, propertyId: 35, residentName: 'Emilio Tomás Bravo Calderón', role: 'Propietario', confirmedAt: '2026-09-02T16:45:00Z' },
      { id: 17, announcementId: 1, propertyId: 37, residentName: 'David Esteban Fuentes Fuentes', role: 'Propietario', confirmedAt: '2026-09-03T08:30:00Z' },
      { id: 18, announcementId: 1, propertyId: 43, residentName: 'Marcos Antonio Tejada Urbina', role: 'Propietario', confirmedAt: '2026-09-03T10:15:00Z' },
      { id: 19, announcementId: 1, propertyId: 45, residentName: 'Walter Oswaldo Zamora Arce', role: 'Propietario', confirmedAt: '2026-09-03T11:40:00Z' },
      { id: 20, announcementId: 1, propertyId: 47, residentName: 'Bernardo José Córdova Erazo', role: 'Propietario', confirmedAt: '2026-09-03T13:00:00Z' },
      { id: 21, announcementId: 1, propertyId: 51, residentName: 'Gerardo Alfonso Jurado Luque', role: 'Propietario', confirmedAt: '2026-09-04T09:20:00Z' }
    ];

    // 4. Marketplace Seed Listings (survey_marketplace_admin.md § 6.1)
    this.marketplaceListings = [
      {
        id: 1,
        title: 'Repostería & Tortas Doña Rosa',
        description: 'Tortas personalizadas para cumpleaños, pies de limón, kekes caseros y bocaditos dulces para reuniones. Entregas a domicilio en toda la urbanización.',
        category: 'Gastronomía / Comida',
        scheduleHours: 'Mar - Dom: 10:00 AM - 8:00 PM',
        entrepreneurName: 'Rosa Paredes',
        propertyAddress: 'Mz B Lt 14',
        phone: '987112233',
        whatsappMessageTemplate: '¡Hola Doña Rosa! Vi sus deliciosas tortas en Mercado Laureles. Quisiera cotizar una torta para este fin de semana.',
        status: 'approved',
        isFeatured: 1,
        imageUrl: '/images/marketplace/default-business.svg',
        createdAt: '2026-09-01T09:00:00Z'
      },
      {
        id: 2,
        title: 'Servicio Técnico & Redes Laureles',
        description: 'Mantenimiento de computadoras, laptops, instalación de repetidores Wi-Fi, cámaras de seguridad y soporte remoto para vecinos.',
        category: 'Servicios Técnicos',
        scheduleHours: 'Lun - Sáb: 9:00 AM - 7:00 PM',
        entrepreneurName: 'Ing. Carlos Mendoza',
        propertyAddress: 'Mz D Lt 5',
        phone: '991223344',
        whatsappMessageTemplate: '¡Hola Carlos! Vi tu servicio técnico en Mercado Laureles. Tengo un problema con mi computadora/red y requiero asistencia.',
        status: 'approved',
        isFeatured: 0,
        imageUrl: '/images/marketplace/default-business.svg',
        createdAt: '2026-09-01T10:00:00Z'
      },
      {
        id: 3,
        title: 'Gasfitería & Electricidad Don Lucho',
        description: 'Especialista en fugas de agua, bombas de presión, termas, cambio de tableros eléctricos, cableado e iluminación LED. Atención de emergencias vecinales.',
        category: 'Gasfitería / Electricidad',
        scheduleHours: 'Lun - Dom: 7:00 AM - 9:00 PM (Emergencias 24/7)',
        entrepreneurName: 'Luis Huamán',
        propertyAddress: 'Mz A Lt 8',
        phone: '976334455',
        whatsappMessageTemplate: '¡Hola Don Lucho! Lo contacto desde Urbanización Los Laureles para una urgencia de gasfitería/electricidad en mi casa.',
        status: 'approved',
        isFeatured: 1,
        imageUrl: '/images/marketplace/default-business.svg',
        createdAt: '2026-09-02T11:00:00Z'
      },
      {
        id: 4,
        title: 'Confecciones & Arreglos Carmen',
        description: 'Bastas de pantalones, cambio de cierres, entalle de prendas, confección de cortinas y uniformes escolares.',
        category: 'Vestimenta / Ropa',
        scheduleHours: 'Lun - Vie: 9:00 AM - 6:00 PM',
        entrepreneurName: 'Carmen Valdivia',
        propertyAddress: 'Mz C Lt 20',
        phone: '982445566',
        whatsappMessageTemplate: '¡Hola Sra. Carmen! Vi su taller de confecciones en Mercado Laureles. Quisiera consultar sobre el arreglo de unas prendas.',
        status: 'approved',
        isFeatured: 0,
        imageUrl: '/images/marketplace/default-business.svg',
        createdAt: '2026-09-02T14:00:00Z'
      },
      {
        id: 5,
        title: 'Studio de Belleza & Manicure Yanet',
        description: 'Manicure rusa, pedicure spa, lifting de pestañas, depilación y peinados para eventos. Atención previa cita en la comodidad de la urbanización.',
        category: 'Belleza / Cuidado Personal',
        scheduleHours: 'Mar - Sáb: 10:00 AM - 7:00 PM',
        entrepreneurName: 'Yanet Castillo',
        propertyAddress: 'Mz E Lt 2',
        phone: '998556677',
        whatsappMessageTemplate: '¡Hola Yanet! Vi tu studio de belleza en Mercado Laureles. Quisiera agendar una cita para esta semana.',
        status: 'approved',
        isFeatured: 0,
        imageUrl: '/images/marketplace/default-business.svg',
        createdAt: '2026-09-03T16:00:00Z'
      },
      {
        id: 6,
        title: 'Piqueos & Empanadas Caseras San Martín',
        description: 'Empanadas horneadas de carne y pollo, tablas de quesos y piqueos listos para el lonche familiar.',
        category: 'Gastronomía / Comida',
        scheduleHours: 'Jue - Dom: 4:00 PM - 9:00 PM',
        entrepreneurName: 'Jorge San Martín',
        propertyAddress: 'Mz F Lt 11',
        phone: '984667788',
        whatsappMessageTemplate: '¡Hola Jorge! Quisiera hacer un pedido de empanadas para hoy en la tarde.',
        status: 'pending',
        isFeatured: 0,
        imageUrl: '/images/marketplace/default-business.svg',
        createdAt: '2026-09-04T12:00:00Z'
      }
    ];

    // 5. Active Admin Sessions (token -> metadata)
    this.adminSessions = new Set();
    this.validPin = process.env.ADMIN_PIN || '123456';
  }

  // ==========================================
  // Public Announcements Endpoints
  // ==========================================
  getAnnouncements(query = {}) {
    let list = this.announcements.filter(a => !a.archived || query.include_archived);

    if (query.category) {
      list = list.filter(a => a.category.toLowerCase() === query.category.toLowerCase());
    }
    if (query.audience) {
      list = list.filter(a => a.audience.toLowerCase() === query.audience.toLowerCase());
    }
    if (query.search || query.q) {
      const q = (query.search || query.q).toLowerCase().trim();
      list = list.filter(a =>
        a.title.toLowerCase().includes(q) ||
        a.summary.toLowerCase().includes(q) ||
        a.content.toLowerCase().includes(q)
      );
    }
    if (query.date) {
      list = list.filter(a => a.created_at.startsWith(query.date));
    }

    // Pinned announcements first, then newest first
    list.sort((a, b) => {
      if (b.pinned !== a.pinned) return b.pinned - a.pinned;
      return new Date(b.created_at) - new Date(a.created_at);
    });

    return {
      success: true,
      announcements: list,
      total: list.length
    };
  }

  getAnnouncementBySlug(slug) {
    const announcement = this.announcements.find(a => a.slug === slug);
    if (!announcement) {
      return { status: 404, data: { success: false, error: 'Comunicado no encontrado' } };
    }

    const confirmedReads = this.readConfirmations.filter(r => r.announcementId === announcement.id);
    const quorum = calculateQuorumProgress(confirmedReads.length, this.properties.length);

    return {
      status: 200,
      data: {
        success: true,
        announcement,
        confirmedPropertiesCount: quorum.confirmedCount,
        totalCensus: quorum.totalProperties,
        readPercentage: quorum.percentage,
        quorumTier: quorum.tier,
        quorumLabel: quorum.tierLabel
      }
    };
  }

  incrementAnnouncementView(id) {
    const announcement = this.announcements.find(a => a.id === Number(id));
    if (!announcement) {
      return { status: 404, data: { success: false, error: 'Comunicado no encontrado' } };
    }
    announcement.visit_count = (announcement.visit_count || 0) + 1;
    return { status: 200, data: { success: true, visitCount: announcement.visit_count } };
  }

  confirmAnnouncementRead(id, payload) {
    const announcementId = Number(id);
    const announcement = this.announcements.find(a => a.id === announcementId);
    if (!announcement) {
      return { status: 404, data: { success: false, error: 'Comunicado no encontrado' } };
    }

    const existingForAnnouncement = this.readConfirmations.filter(r => r.announcementId === announcementId);
    const validation = validateReadConfirmationPayload(payload, existingForAnnouncement, this.properties);

    if (validation.isDuplicate) {
      return {
        status: 409,
        data: {
          success: false,
          code: 'ALREADY_CONFIRMED',
          message: 'Este inmueble ya registró su confirmación de lectura previamente.'
        }
      };
    }

    if (!validation.isValid) {
      return {
        status: 400,
        data: {
          success: false,
          code: 'VALIDATION_ERROR',
          errors: validation.errors
        }
      };
    }

    const propertyId = Number(payload.propertyId ?? payload.property_id);
    const residentName = String(payload.residentName ?? payload.resident_name).trim();
    const role = String(payload.role ?? payload.resident_role).trim();
    const confirmedAt = new Date().toISOString();

    const newConfirmation = {
      id: this.readConfirmations.length + 1,
      announcementId,
      propertyId,
      residentName,
      role,
      confirmedAt
    };

    this.readConfirmations.push(newConfirmation);

    const updatedReads = this.readConfirmations.filter(r => r.announcementId === announcementId);
    const quorum = calculateQuorumProgress(updatedReads.length, this.properties.length);

    return {
      status: 201,
      data: {
        success: true,
        message: 'Lectura confirmada exitosamente.',
        confirmation: newConfirmation,
        stats: {
          confirmedCount: quorum.confirmedCount,
          totalProperties: quorum.totalProperties,
          percentage: quorum.percentage
        }
      }
    };
  }

  getCensusProperties() {
    return {
      success: true,
      properties: this.properties,
      total: this.properties.length
    };
  }

  // ==========================================
  // Public Marketplace Endpoints
  // ==========================================
  getMarketplaceListings(query = {}) {
    let list = this.marketplaceListings.filter(l => l.status === 'approved');

    if (query.category && query.category !== 'Todos') {
      list = list.filter(l => l.category.toLowerCase() === query.category.toLowerCase());
    }

    // Featured first, then newest
    list.sort((a, b) => {
      if (b.isFeatured !== a.isFeatured) return b.isFeatured - a.isFeatured;
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

    return {
      success: true,
      listings: list,
      total: list.length
    };
  }

  submitMarketplaceListing(payload) {
    const validation = validateMarketplaceSubmissionPayload(payload);
    if (!validation.isValid) {
      return {
        status: 400,
        data: {
          success: false,
          code: 'VALIDATION_ERROR',
          errors: validation.errors
        }
      };
    }

    const newListing = {
      id: this.marketplaceListings.length + 1,
      title: payload.title.trim(),
      description: payload.description.trim(),
      category: payload.category.trim(),
      entrepreneurName: (payload.entrepreneurName ?? payload.entrepreneur_name).trim(),
      propertyAddress: (payload.propertyAddress ?? payload.property).trim(),
      phone: payload.phone.trim(),
      scheduleHours: (payload.scheduleHours ?? payload.schedule).trim(),
      whatsappMessageTemplate: payload.whatsappMessageTemplate || null,
      imageUrl: payload.imageUrl || '/images/marketplace/default-business.svg',
      status: 'pending', // Strictly pending until admin review
      isFeatured: 0,
      createdAt: new Date().toISOString()
    };

    this.marketplaceListings.push(newListing);

    return {
      status: 201,
      data: {
        success: true,
        message: 'Postulación recibida con éxito. Pendiente de aprobación administrativa.',
        id: newListing.id,
        status: newListing.status
      }
    };
  }

  // ==========================================
  // Admin Authentication & Session Management
  // ==========================================
  adminLogin(pin) {
    if (!pin || String(pin).trim() !== this.validPin) {
      return {
        status: 401,
        data: {
          success: false,
          code: 'INVALID_PIN',
          message: 'PIN de acceso incorrecto.'
        }
      };
    }

    const sessionToken = crypto.randomBytes(32).toString('hex');
    this.adminSessions.add(sessionToken);

    return {
      status: 200,
      sessionToken,
      data: {
        success: true,
        message: 'Autenticación exitosa.'
      }
    };
  }

  adminLogout(sessionToken) {
    if (sessionToken) {
      this.adminSessions.delete(sessionToken);
    }
    return {
      status: 200,
      data: { success: true, message: 'Sesión finalizada correctamente.' }
    };
  }

  verifyAdminSession(sessionToken) {
    return sessionToken && this.adminSessions.has(sessionToken);
  }

  // ==========================================
  // Protected Admin Endpoints
  // ==========================================
  getAdminMetrics(sessionToken) {
    if (!this.verifyAdminSession(sessionToken)) {
      return { status: 401, data: { success: false, error: 'No autorizado' } };
    }

    const totalAnnouncements = this.announcements.length;
    const pendingListings = this.marketplaceListings.filter(l => l.status === 'pending').length;
    const totalCensus = this.properties.length;

    // Average reading coverage
    let sumPercentage = 0;
    for (const ann of this.announcements) {
      const reads = this.readConfirmations.filter(r => r.announcementId === ann.id).length;
      sumPercentage += (reads / totalCensus) * 100;
    }
    const avgCoverage = totalAnnouncements > 0 ? Math.round((sumPercentage / totalAnnouncements) * 10) / 10 : 0;

    return {
      status: 200,
      data: {
        success: true,
        metrics: {
          totalAnnouncements,
          pendingListings,
          totalCensus,
          averageCoveragePercentage: avgCoverage
        }
      }
    };
  }

  getAdminAnnouncementReads(id, sessionToken) {
    if (!this.verifyAdminSession(sessionToken)) {
      return { status: 401, data: { success: false, error: 'No autorizado' } };
    }

    const announcementId = Number(id);
    const announcement = this.announcements.find(a => a.id === announcementId);
    if (!announcement) {
      return { status: 404, data: { success: false, error: 'Comunicado no encontrado' } };
    }

    const confirmedReads = this.readConfirmations.filter(r => r.announcementId === announcementId);
    const confirmedPropertyIds = new Set(confirmedReads.map(r => r.propertyId));

    const confirmed = confirmedReads.map(r => {
      const prop = this.properties.find(p => p.id === r.propertyId) || {};
      return {
        id: r.id,
        propertyId: r.propertyId,
        block: prop.block,
        lot: prop.lot,
        code: prop.code,
        street: prop.street,
        residentName: r.residentName,
        role: r.role,
        confirmedAt: r.confirmedAt
      };
    });

    const pending = this.properties
      .filter(p => !confirmedPropertyIds.has(p.id))
      .map(p => ({
        id: p.id,
        block: p.block,
        lot: p.lot,
        code: p.code,
        street: p.street,
        primaryOwnerName: p.owner
      }));

    const quorum = calculateQuorumProgress(confirmed.length, this.properties.length);

    return {
      status: 200,
      data: {
        success: true,
        announcementId,
        coveragePercentage: quorum.percentage,
        confirmedCount: quorum.confirmedCount,
        totalCensus: quorum.totalProperties,
        confirmed,
        pending
      }
    };
  }

  getAdminWhatsAppReminder(id, baseUrl, sessionToken) {
    if (!this.verifyAdminSession(sessionToken)) {
      return { status: 401, data: { success: false, error: 'No autorizado' } };
    }

    const announcementId = Number(id);
    const announcement = this.announcements.find(a => a.id === announcementId);
    if (!announcement) {
      return { status: 404, data: { success: false, error: 'Comunicado no encontrado' } };
    }

    const readsResponse = this.getAdminAnnouncementReads(announcementId, sessionToken);
    const missing = readsResponse.data.pending;
    const fullUrl = `${baseUrl.replace(/\/$/, '')}/comunicados/${announcement.slug}`;

    const reminder = generateWhatsAppReminderMessage(
      announcement.title,
      fullUrl,
      this.properties.length,
      missing
    );

    return {
      status: 200,
      data: {
        success: true,
        announcementId,
        messageText: reminder.messageText,
        whatsappUrl: reminder.whatsappUrl,
        missingCount: reminder.missingCount,
        confirmedCount: reminder.confirmedCount,
        coveragePercent: reminder.coveragePercent
      }
    };
  }

  exportAttendanceCsv(id, mode = 'full_census', sessionToken) {
    if (!this.verifyAdminSession(sessionToken)) {
      return { status: 401, data: { success: false, error: 'No autorizado' } };
    }

    const announcementId = Number(id);
    const announcement = this.announcements.find(a => a.id === announcementId);
    if (!announcement) {
      return { status: 404, data: { success: false, error: 'Comunicado no encontrado' } };
    }

    const confirmedReads = this.readConfirmations.filter(r => r.announcementId === announcementId);
    const confirmedMap = new Map(confirmedReads.map(r => [r.propertyId, r]));

    const records = this.properties.map(prop => {
      const read = confirmedMap.get(prop.id);
      if (read) {
        return {
          block: prop.block,
          lot: prop.lot,
          code: prop.code,
          street: prop.street,
          resident_name: read.residentName,
          role: read.role,
          confirmed_at: read.confirmedAt,
          status: 'CONFIRMADO'
        };
      }
      return {
        block: prop.block,
        lot: prop.lot,
        code: prop.code,
        street: prop.street,
        resident_name: prop.owner,
        role: 'Propietario',
        confirmed_at: 'Pendiente',
        status: 'PENDIENTE'
      };
    });

    const csvContent = generateAttendanceCsv(records, { mode });

    return {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="asistencia_${announcement.slug}.csv"`
      },
      content: csvContent
    };
  }

  getAdminMarketplaceListings(statusFilter, sessionToken) {
    if (!this.verifyAdminSession(sessionToken)) {
      return { status: 401, data: { success: false, error: 'No autorizado' } };
    }

    let list = this.marketplaceListings;
    if (statusFilter && ['pending', 'approved', 'rejected'].includes(statusFilter)) {
      list = list.filter(l => l.status === statusFilter);
    }

    return {
      status: 200,
      data: {
        success: true,
        listings: list,
        total: list.length
      }
    };
  }

  updateMarketplaceListingStatus(id, newStatus, sessionToken) {
    if (!this.verifyAdminSession(sessionToken)) {
      return { status: 401, data: { success: false, error: 'No autorizado' } };
    }

    if (!['approved', 'rejected', 'pending'].includes(newStatus)) {
      return { status: 400, data: { success: false, error: 'Estado inválido' } };
    }

    const listing = this.marketplaceListings.find(l => l.id === Number(id));
    if (!listing) {
      return { status: 404, data: { success: false, error: 'Emprendimiento no encontrado' } };
    }

    listing.status = newStatus;
    listing.updatedAt = new Date().toISOString();

    return {
      status: 200,
      data: {
        success: true,
        listing,
        message: `Estado actualizado a '${newStatus}' correctamente.`
      }
    };
  }

  createAnnouncement(payload, sessionToken) {
    if (!this.verifyAdminSession(sessionToken)) {
      return { status: 401, data: { success: false, error: 'No autorizado' } };
    }

    if (!payload.title || payload.title.trim().length < 5) {
      return { status: 400, data: { success: false, error: 'El título debe tener al menos 5 caracteres' } };
    }

    const id = this.announcements.length + 1;
    const slug = payload.slug || payload.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + `-${id}`;

    const newAnnouncement = {
      id,
      title: payload.title.trim(),
      slug,
      summary: payload.summary || payload.title,
      content: payload.content || '',
      category: payload.category || 'Mantenimiento',
      audience: payload.audience || 'General',
      is_urgent: payload.is_urgent ? 1 : 0,
      deadline_date: payload.deadline_date || null,
      pinned: payload.pinned ? 1 : 0,
      archived: 0,
      visit_count: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    this.announcements.push(newAnnouncement);
    return { status: 201, data: { success: true, announcement: newAnnouncement } };
  }

  togglePinAnnouncement(id, sessionToken) {
    if (!this.verifyAdminSession(sessionToken)) {
      return { status: 401, data: { success: false, error: 'No autorizado' } };
    }

    const announcement = this.announcements.find(a => a.id === Number(id));
    if (!announcement) {
      return { status: 404, data: { success: false, error: 'Comunicado no encontrado' } };
    }

    announcement.pinned = announcement.pinned ? 0 : 1;
    announcement.updated_at = new Date().toISOString();

    return { status: 200, data: { success: true, pinned: announcement.pinned } };
  }

  toggleArchiveAnnouncement(id, sessionToken) {
    if (!this.verifyAdminSession(sessionToken)) {
      return { status: 401, data: { success: false, error: 'No autorizado' } };
    }

    const announcement = this.announcements.find(a => a.id === Number(id));
    if (!announcement) {
      return { status: 404, data: { success: false, error: 'Comunicado no encontrado' } };
    }

    announcement.archived = announcement.archived ? 0 : 1;
    announcement.updated_at = new Date().toISOString();

    return { status: 200, data: { success: true, archived: announcement.archived } };
  }
}

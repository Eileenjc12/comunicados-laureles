/**
 * Universal Test Client for Urbanización Los Laureles E2E Tests
 * Supports dual-mode execution:
 * 1. HTTP Mode: Sends live HTTP requests via native fetch to TEST_BASE_URL
 * 2. In-Process Domain Mode: Routes directly to LaurelesEngine adhering to API contracts
 */

import { LaurelesEngine } from './in-memory-engine.mjs';

export class LaurelesTestClient {
  constructor(options = {}) {
    this.baseUrl = (options.baseUrl || process.env.TEST_BASE_URL || 'http://localhost:4321').replace(/\/$/, '');
    this.sessionCookie = null;
    this.engine = new LaurelesEngine();
    this.mode = options.mode || process.env.TEST_MODE || 'auto'; // 'http', 'direct', or 'auto'
    this.isServerReachable = false;
  }

  async init() {
    if (this.mode === 'direct') {
      this.isServerReachable = false;
      return;
    }
    if (this.mode === 'http') {
      this.isServerReachable = true;
      return;
    }
    // Auto-detect if HTTP server is alive
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 800);
      const res = await fetch(`${this.baseUrl}/api/census/properties`, { signal: controller.signal });
      clearTimeout(timeout);
      this.isServerReachable = res.status < 500;
    } catch {
      this.isServerReachable = false;
    }
  }

  reset() {
    this.sessionCookie = null;
    this.engine.reset();
  }

  // ==========================================
  // Public Announcements & Reads API
  // ==========================================
  async getAnnouncements(query = {}) {
    if (this.isServerReachable) {
      const params = new URLSearchParams(query).toString();
      const url = `${this.baseUrl}/api/announcements${params ? '?' + params : ''}`;
      const res = await fetch(url);
      const data = await res.json();
      return { status: res.status, ok: res.ok, data };
    }

    const res = this.engine.getAnnouncements(query);
    return { status: 200, ok: true, data: res };
  }

  async getAnnouncementBySlug(slug) {
    if (this.isServerReachable) {
      const res = await fetch(`${this.baseUrl}/api/announcements/${slug}`);
      const data = await res.json();
      return { status: res.status, ok: res.ok, data };
    }

    const res = this.engine.getAnnouncementBySlug(slug);
    return { status: res.status, ok: res.status < 400, data: res.data };
  }

  async incrementView(id) {
    if (this.isServerReachable) {
      const res = await fetch(`${this.baseUrl}/api/announcements/${id}/view`, { method: 'POST' });
      const data = await res.json();
      return { status: res.status, ok: res.ok, data };
    }

    const res = this.engine.incrementAnnouncementView(id);
    return { status: res.status, ok: res.status < 400, data: res.data };
  }

  async confirmRead(id, payload) {
    if (this.isServerReachable) {
      const res = await fetch(`${this.baseUrl}/api/announcements/${id}/confirm`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      return { status: res.status, ok: res.ok, data };
    }

    const res = this.engine.confirmAnnouncementRead(id, payload);
    return { status: res.status, ok: res.status < 400, data: res.data };
  }

  async getCensusProperties() {
    if (this.isServerReachable) {
      const res = await fetch(`${this.baseUrl}/api/census/properties`);
      const data = await res.json();
      return { status: res.status, ok: res.ok, data };
    }

    const res = this.engine.getCensusProperties();
    return { status: 200, ok: true, data: res };
  }

  // ==========================================
  // Public Marketplace API
  // ==========================================
  async getMarketplaceListings(query = {}) {
    if (this.isServerReachable) {
      const params = new URLSearchParams(query).toString();
      const url = `${this.baseUrl}/api/marketplace${params ? '?' + params : ''}`;
      const res = await fetch(url);
      const data = await res.json();
      return { status: res.status, ok: res.ok, data };
    }

    const res = this.engine.getMarketplaceListings(query);
    return { status: 200, ok: true, data: res };
  }

  async submitMarketplaceListing(payload) {
    if (this.isServerReachable) {
      const res = await fetch(`${this.baseUrl}/api/marketplace/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      return { status: res.status, ok: res.ok, data };
    }

    const res = this.engine.submitMarketplaceListing(payload);
    return { status: res.status, ok: res.status < 400, data: res.data };
  }

  // ==========================================
  // Admin Authentication
  // ==========================================
  async adminLogin(pin) {
    if (this.isServerReachable) {
      const res = await fetch(`${this.baseUrl}/api/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin })
      });
      const data = await res.json();
      const setCookie = res.headers.get('set-cookie');
      if (setCookie) {
        this.sessionCookie = setCookie.split(';')[0];
      }
      return { status: res.status, ok: res.ok, data };
    }

    const res = this.engine.adminLogin(pin);
    if (res.status === 200) {
      this.sessionCookie = `laureles_admin_session=${res.sessionToken}`;
    } else {
      this.sessionCookie = null;
    }
    return { status: res.status, ok: res.status < 400, data: res.data };
  }

  async adminLogout() {
    if (this.isServerReachable) {
      const res = await fetch(`${this.baseUrl}/api/admin/logout`, {
        method: 'POST',
        headers: this._getAuthHeaders()
      });
      this.sessionCookie = null;
      const data = await res.json();
      return { status: res.status, ok: res.ok, data };
    }

    const token = this._extractToken();
    const res = this.engine.adminLogout(token);
    this.sessionCookie = null;
    return { status: 200, ok: true, data: res.data };
  }

  // ==========================================
  // Protected Admin Endpoints
  // ==========================================
  async getAdminMetrics() {
    if (this.isServerReachable) {
      const res = await fetch(`${this.baseUrl}/api/admin/metrics`, {
        headers: this._getAuthHeaders()
      });
      const data = await res.json();
      return { status: res.status, ok: res.ok, data };
    }

    const token = this._extractToken();
    const res = this.engine.getAdminMetrics(token);
    return { status: res.status, ok: res.status < 400, data: res.data };
  }

  async getAdminAnnouncementReads(id) {
    if (this.isServerReachable) {
      const res = await fetch(`${this.baseUrl}/api/admin/announcements/${id}/reads`, {
        headers: this._getAuthHeaders()
      });
      const data = await res.json();
      return { status: res.status, ok: res.ok, data };
    }

    const token = this._extractToken();
    const res = this.engine.getAdminAnnouncementReads(id, token);
    return { status: res.status, ok: res.status < 400, data: res.data };
  }

  async getAdminWhatsAppReminder(id) {
    if (this.isServerReachable) {
      const res = await fetch(`${this.baseUrl}/api/admin/announcements/${id}/whatsapp-reminder`, {
        headers: this._getAuthHeaders()
      });
      const data = await res.json();
      return { status: res.status, ok: res.ok, data };
    }

    const token = this._extractToken();
    const res = this.engine.getAdminWhatsAppReminder(id, this.baseUrl, token);
    return { status: res.status, ok: res.status < 400, data: res.data };
  }

  async exportAttendanceCsv(id, mode = 'full_census') {
    if (this.isServerReachable) {
      const res = await fetch(`${this.baseUrl}/api/admin/announcements/${id}/export-csv?mode=${mode}`, {
        headers: this._getAuthHeaders()
      });
      const text = await res.text();
      return {
        status: res.status,
        ok: res.ok,
        headers: {
          contentType: res.headers.get('content-type'),
          contentDisposition: res.headers.get('content-disposition')
        },
        content: text
      };
    }

    const token = this._extractToken();
    const res = this.engine.exportAttendanceCsv(id, mode, token);
    return {
      status: res.status,
      ok: res.status < 400,
      headers: {
        contentType: res.headers?.['Content-Type'] || res.headers?.contentType || '',
        contentDisposition: res.headers?.['Content-Disposition'] || res.headers?.contentDisposition || ''
      },
      content: res.content || ''
    };
  }

  async getWhatsAppReminder(id) {
    return this.getAdminWhatsAppReminder(id);
  }

  async getAdminMarketplaceListings(statusFilter = '') {
    if (this.isServerReachable) {
      const url = `${this.baseUrl}/api/admin/marketplace${statusFilter ? '?status=' + statusFilter : ''}`;
      const res = await fetch(url, {
        headers: this._getAuthHeaders()
      });
      const data = await res.json();
      return { status: res.status, ok: res.ok, data };
    }

    const token = this._extractToken();
    const res = this.engine.getAdminMarketplaceListings(statusFilter, token);
    return { status: res.status, ok: res.status < 400, data: res.data };
  }

  async updateMarketplaceStatus(id, newStatus) {
    if (this.isServerReachable) {
      const res = await fetch(`${this.baseUrl}/api/admin/marketplace/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...this._getAuthHeaders()
        },
        body: JSON.stringify({ status: newStatus })
      });
      const data = await res.json();
      return { status: res.status, ok: res.ok, data };
    }

    const token = this._extractToken();
    const res = this.engine.updateMarketplaceListingStatus(id, newStatus, token);
    return { status: res.status, ok: res.status < 400, data: res.data };
  }

  async createAnnouncement(payload) {
    if (this.isServerReachable) {
      const res = await fetch(`${this.baseUrl}/api/admin/announcements`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...this._getAuthHeaders()
        },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      return { status: res.status, ok: res.ok, data };
    }

    const token = this._extractToken();
    const res = this.engine.createAnnouncement(payload, token);
    return { status: res.status, ok: res.status < 400, data: res.data };
  }

  async togglePinAnnouncement(id) {
    if (this.isServerReachable) {
      const res = await fetch(`${this.baseUrl}/api/admin/announcements/${id}/pin`, {
        method: 'PATCH',
        headers: this._getAuthHeaders()
      });
      const data = await res.json();
      return { status: res.status, ok: res.ok, data };
    }

    const token = this._extractToken();
    const res = this.engine.togglePinAnnouncement(id, token);
    return { status: res.status, ok: res.status < 400, data: res.data };
  }

  async toggleArchiveAnnouncement(id) {
    if (this.isServerReachable) {
      const res = await fetch(`${this.baseUrl}/api/admin/announcements/${id}/archive`, {
        method: 'PATCH',
        headers: this._getAuthHeaders()
      });
      const data = await res.json();
      return { status: res.status, ok: res.status < 400, data: res.data };
    }

    const token = this._extractToken();
    const res = this.engine.toggleArchiveAnnouncement(id, token);
    return { status: res.status, ok: res.status < 400, data: res.data };
  }

  // ==========================================
  // Internal Helpers
  // ==========================================
  _getAuthHeaders() {
    return this.sessionCookie ? { Cookie: this.sessionCookie } : {};
  }

  _extractToken() {
    if (!this.sessionCookie) return null;
    const match = this.sessionCookie.match(/laureles_admin_session=([^;]+)/);
    return match ? match[1] : null;
  }
}

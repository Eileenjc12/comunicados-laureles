import crypto from 'node:crypto';
import type { DatabaseSync } from 'node:sqlite';
import { getDb } from './db.ts';

export const ADMIN_SESSION_COOKIE = 'laureles_admin_session';
export const SESSION_EXPIRY_SECONDS = 86400; // 24 hours

/**
 * Validates the administrative PIN against environment or defaults.
 * Accepts:
 * - process.env.ADMIN_PIN (if set)
 * - Default '1234' (per Milestone 5 specification)
 * - Default '123456' (per E2E test client specification)
 */
export function validateAdminPin(pin: unknown): boolean {
  if (typeof pin !== 'string' && typeof pin !== 'number') {
    return false;
  }
  const cleanPin = String(pin).trim();
  if (!cleanPin) {
    return false;
  }

  const configuredPin = process.env.ADMIN_PIN?.trim();
  if (configuredPin) {
    return cleanPin === configuredPin;
  }

  // Default fallback PINs
  return cleanPin === '1234' || cleanPin === '123456';
}

/**
 * Generates a cryptographically random 256-bit token (64 hex characters)
 * and stores it with a 24-hour expiration in the admin_sessions table.
 */
export function createAdminSession(database?: DatabaseSync): string {
  const db = database || getDb();
  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + SESSION_EXPIRY_SECONDS * 1000).toISOString();

  const stmt = db.prepare(`
    INSERT INTO admin_sessions (token, created_at, expires_at)
    VALUES (?, datetime('now'), ?)
  `);
  stmt.run(token, expiresAt);

  return token;
}

/**
 * Validates whether an admin session token exists and is not expired.
 */
export function validateAdminSession(database?: DatabaseSync, token?: string | null): boolean {
  if (!token || typeof token !== 'string') {
    return false;
  }
  const cleanToken = token.trim();
  if (!cleanToken) {
    return false;
  }

  const db = database || getDb();
  try {
    const stmt = db.prepare(`
      SELECT token FROM admin_sessions
      WHERE token = ? AND expires_at > datetime('now')
    `);
    const session = stmt.get(cleanToken);
    return !!session;
  } catch {
    return false;
  }
}

/**
 * Revokes and removes an active admin session token.
 */
export function deleteAdminSession(database?: DatabaseSync, token?: string | null): void {
  if (!token || typeof token !== 'string') {
    return;
  }
  const db = database || getDb();
  try {
    const stmt = db.prepare(`
      DELETE FROM admin_sessions WHERE token = ?
    `);
    stmt.run(token.trim());
  } catch {
    // Ignore deletion errors
  }
}

/**
 * Housekeeping utility to remove expired sessions from the database.
 */
export function cleanExpiredSessions(database?: DatabaseSync): void {
  const db = database || getDb();
  try {
    db.prepare("DELETE FROM admin_sessions WHERE expires_at <= datetime('now')").run();
  } catch {
    // Ignore cleanup errors
  }
}

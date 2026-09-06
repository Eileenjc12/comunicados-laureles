import crypto from 'node:crypto';
import { g as getDb } from './db_D9z2L-6S.mjs';

const ADMIN_SESSION_COOKIE = "laureles_admin_session";
const SESSION_EXPIRY_SECONDS = 86400;
function validateAdminPin(pin) {
  if (typeof pin !== "string" && typeof pin !== "number") {
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
  return cleanPin === "1234" || cleanPin === "123456";
}
function createAdminSession(database) {
  const db = database || getDb();
  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + SESSION_EXPIRY_SECONDS * 1e3).toISOString();
  const stmt = db.prepare(`
    INSERT INTO admin_sessions (token, created_at, expires_at)
    VALUES (?, datetime('now'), ?)
  `);
  stmt.run(token, expiresAt);
  return token;
}
function validateAdminSession(database, token) {
  if (!token || typeof token !== "string") {
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
function deleteAdminSession(database, token) {
  if (!token || typeof token !== "string") {
    return;
  }
  const db = database || getDb();
  try {
    const stmt = db.prepare(`
      DELETE FROM admin_sessions WHERE token = ?
    `);
    stmt.run(token.trim());
  } catch {
  }
}

export { ADMIN_SESSION_COOKIE as A, SESSION_EXPIRY_SECONDS as S, validateAdminPin as a, createAdminSession as c, deleteAdminSession as d, validateAdminSession as v };

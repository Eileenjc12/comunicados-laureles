import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';
import fs from 'node:fs';
import { seedDatabase as runSeed } from './seeds.ts';


export interface CensusProperty {
  id: number;
  manzana: string;
  lote: string;
  address: string;
  owner_name: string;
  is_active: number;
  created_at: string;
}

export interface Announcement {
  id: number;
  title: string;
  slug: string;
  summary: string;
  content: string;
  category:
    | 'Urgente / Alertas'
    | 'Mantenimiento'
    | 'Convocatorias de Asamblea'
    | 'Normas de Convivencia'
    | 'Finanzas / Cuotas';
  audience: 'General' | 'Solo Propietarios' | 'Solo Inquilinos';
  is_urgent: number;
  deadline_date: string | null;
  pinned: number;
  archived: number;
  visit_count: number;
  created_at: string;
  updated_at: string;
}

export interface ReadConfirmation {
  id: number;
  announcement_id: number;
  property_id: number;
  resident_name: string;
  role: 'Propietario' | 'Inquilino';
  confirmed_at: string;
}

export interface MarketplaceListing {
  id: number;
  title: string;
  description: string;
  category:
    | 'Gastronomía / Comida'
    | 'Vestimenta / Ropa'
    | 'Servicios Técnicos'
    | 'Gasfitería / Electricidad'
    | 'Belleza / Cuidado Personal'
    | 'Otros';
  entrepreneur_name: string;
  property_address: string;
  phone: string;
  whatsapp_message?: string | null;
  image_url?: string | null;
  schedule_hours?: string | null;
  status: 'pending' | 'approved' | 'rejected';
  admin_notes?: string | null;
  created_at: string;
  updated_at: string;
}

export interface AdminSession {
  token: string;
  created_at: string;
  expires_at: string;
}

let defaultDbInstance: DatabaseSync | null = null;

/**
 * Returns a configured DatabaseSync instance.
 * By default returns the singleton connection to data/laureles.db.
 */
export function getDb(customPath?: string): DatabaseSync {
  if (!customPath && defaultDbInstance) {
    return defaultDbInstance;
  }

  const dbPath =
    customPath ||
    process.env.DB_PATH ||
    path.resolve(process.cwd(), 'data', 'laureles.db');

  if (dbPath !== ':memory:') {
    const dir = path.dirname(dbPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  const db = new DatabaseSync(dbPath, {
    timeout: 5000,
    enableForeignKeyConstraints: true,
  });

  // Configure WAL mode and essential performance & integrity PRAGMAs
  db.exec(`
    PRAGMA journal_mode = WAL;
    PRAGMA busy_timeout = 5000;
    PRAGMA foreign_keys = ON;
    PRAGMA synchronous = NORMAL;
  `);

  initSchema(db);
  runSeed(db);


  if (!customPath) {
    defaultDbInstance = db;
  }

  return db;
}

/**
 * Initializes all database tables and indexes if they do not exist.
 */
export function initSchema(database?: DatabaseSync): void {
  const db = database || getDb();

  db.exec(`
    -- 1. Residential Census Master Table
    CREATE TABLE IF NOT EXISTS census_properties (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      manzana TEXT NOT NULL,
      lote TEXT NOT NULL,
      address TEXT NOT NULL,
      owner_name TEXT NOT NULL,
      is_active INTEGER NOT NULL DEFAULT 1 CHECK (is_active IN (0, 1)),
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      CONSTRAINT uq_manzana_lote UNIQUE (manzana, lote)
    );

    CREATE INDEX IF NOT EXISTS idx_census_manzana ON census_properties(manzana);
    CREATE INDEX IF NOT EXISTS idx_census_is_active ON census_properties(is_active);

    -- 2. Official Announcements Table
    CREATE TABLE IF NOT EXISTS announcements (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL CHECK (length(trim(title)) >= 5),
      slug TEXT NOT NULL UNIQUE,
      summary TEXT NOT NULL,
      content TEXT NOT NULL,
      category TEXT NOT NULL CHECK (
        category IN (
          'Urgente / Alertas',
          'Mantenimiento',
          'Convocatorias de Asamblea',
          'Normas de Convivencia',
          'Finanzas / Cuotas'
        )
      ),
      audience TEXT NOT NULL DEFAULT 'General' CHECK (
        audience IN (
          'General',
          'Solo Propietarios',
          'Solo Inquilinos'
        )
      ),
      is_urgent INTEGER NOT NULL DEFAULT 0 CHECK (is_urgent IN (0, 1)),
      deadline_date TEXT DEFAULT NULL,
      pinned INTEGER NOT NULL DEFAULT 0 CHECK (pinned IN (0, 1)),
      archived INTEGER NOT NULL DEFAULT 0 CHECK (archived IN (0, 1)),
      visit_count INTEGER NOT NULL DEFAULT 0 CHECK (visit_count >= 0),
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE INDEX IF NOT EXISTS idx_announcements_slug ON announcements(slug);
    CREATE INDEX IF NOT EXISTS idx_announcements_feed ON announcements(archived, pinned DESC, created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_announcements_category ON announcements(category);
    CREATE INDEX IF NOT EXISTS idx_announcements_audience ON announcements(audience);

    -- 3. Property-Level Read Confirmations Table
    CREATE TABLE IF NOT EXISTS read_confirmations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      announcement_id INTEGER NOT NULL,
      property_id INTEGER NOT NULL,
      resident_name TEXT NOT NULL CHECK (length(trim(resident_name)) >= 3),
      role TEXT NOT NULL CHECK (role IN ('Propietario', 'Inquilino')),
      confirmed_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (announcement_id) REFERENCES announcements(id) ON DELETE CASCADE,
      FOREIGN KEY (property_id) REFERENCES census_properties(id) ON DELETE RESTRICT,
      CONSTRAINT uq_announcement_property UNIQUE (announcement_id, property_id)
    );

    CREATE INDEX IF NOT EXISTS idx_read_confirmations_announcement ON read_confirmations(announcement_id);
    CREATE INDEX IF NOT EXISTS idx_read_confirmations_property ON read_confirmations(property_id);

    -- 4. Mercado Laureles Directory Table
    CREATE TABLE IF NOT EXISTS marketplace_listings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      category TEXT NOT NULL CHECK (
        category IN (
          'Gastronomía / Comida',
          'Vestimenta / Ropa',
          'Servicios Técnicos',
          'Gasfitería / Electricidad',
          'Belleza / Cuidado Personal',
          'Otros'
        )
      ),
      entrepreneur_name TEXT NOT NULL,
      property_address TEXT NOT NULL,
      phone TEXT NOT NULL,
      whatsapp_message TEXT,
      image_url TEXT DEFAULT '/images/marketplace/default-business.svg',
      schedule_hours TEXT,
      status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
      admin_notes TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE INDEX IF NOT EXISTS idx_marketplace_status ON marketplace_listings(status);
    CREATE INDEX IF NOT EXISTS idx_marketplace_category ON marketplace_listings(category);

    -- 5. Admin Authentication Sessions Table
    CREATE TABLE IF NOT EXISTS admin_sessions (
      token TEXT PRIMARY KEY,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      expires_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_admin_sessions_expires ON admin_sessions(expires_at);
  `);
}

/**
 * Closes the singleton database instance if open.
 */
export function closeDb(): void {
  if (defaultDbInstance) {
    try {
      defaultDbInstance.close();
    } catch {
      // Ignore if already closed
    }
    defaultDbInstance = null;
  }
}

export function seedDatabase(database?: DatabaseSync) {
  const db = database || getDb();
  return runSeed(db);
}

export default getDb;



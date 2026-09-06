# Project: Urbanización Los Laureles — Portal Comunitario y Web Residencial

## Architecture
- **Framework**: Astro (v5 or v4 latest) with `@astrojs/node` in `standalone` mode (`output: 'server'`).
- **Styling**: Tailwind CSS, mobile-first responsive design tailored for WhatsApp webview access.
- **Database**: Native Node.js v24 `node:sqlite` (`DatabaseSync`), zero C++ compilation dependencies.
- **Concurrency**: SQLite configured with `PRAGMA journal_mode = WAL;` and `PRAGMA busy_timeout = 5000;`.
- **Architecture Pattern**: SSR + API Endpoints (`APIRoute`), single-instance database connection in `src/lib/db.ts`.
- **Security**: Admin route protection (`/admin/*`) via PIN validation, cryptographic session cookie (`HttpOnly`, `SameSite=Strict`), and Astro SSR middleware.

## Feature Inventory
| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| 1 | SQLite Engine & Singleton | Native `node:sqlite` DatabaseSync connection manager with WAL mode and error handling | M1 | spec_miner_survey_1 |
| 2 | Relational Schema DDL | Tables: `census_properties`, `announcements`, `read_confirmations`, `marketplace_listings`, `admin_sessions` | M1 | explorer_survey_2 & 3 |
| 3 | Preloaded Residential Census | 52 residential properties structured across Manzanas A-E with street addresses and owner names | M1 | explorer_survey_2 |
| 4 | Seed Announcements | 5 official seed notices covering all categories, urgencies, and audiences | M1 | explorer_survey_2 |
| 5 | Seed Marketplace Listings | 6 community business listings covering food, apparel, plumbing, electrical, and personal care | M1 | explorer_survey_3 |
| 6 | Institutional Portal Layout | Mobile-first responsive layout, clean header, navigation, and mobile touch targets | M2 | explorer_survey_2 |
| 7 | Emergency Directory Banner | 1-Tap call/chat actions: Portería, Vigilancia 24/7, Administración, Policía 105, Bomberos 116, SAMU 106 | M2 | explorer_survey_2 |
| 8 | Announcements Feed & Badges | Official announcements list with category tags, urgency badges, and deadline notices | M2 | explorer_survey_2 |
| 9 | Audience Filters | Filter announcements by General, Solo Propietarios, and Solo Inquilinos | M2 | explorer_survey_2 |
| 10 | Keyword & Date Search | Real-time interactive keyword search and publication date filters | M2 | explorer_survey_2 |
| 11 | Announcement Detail View | Full announcement reader with metadata, status badges, and action bars | M2 | explorer_survey_2 |
| 12 | Atomic Visit Counter | Atomic view counter increment with client-side debounce to track community engagement | M3 | explorer_survey_2 |
| 13 | Read Confirmation Form | Interactive form: census property picker (Manzana + Lote), resident name, role (Propietario / Inquilino) | M3 | explorer_survey_2 |
| 14 | Census Validation & Anti-Duplicate | Server-side validation against census; composite unique constraint prevents duplicate property reads | M3 | explorer_survey_2 |
| 15 | Community Read Progress Bar | Real-time calculation: (confirmed properties / total census) * 100 with tiered color indicators | M3 | explorer_survey_2 |
| 16 | Mercado Laureles Catalog | Community business directory page with 6 category filter pills | M4 | explorer_survey_3 |
| 17 | Business Presentation Cards | Presentation cards with photo/icon, schedule, entrepreneur name, and property address | M4 | explorer_survey_3 |
| 18 | Direct WhatsApp Link Generator | `https://wa.me/51XXXXXXXXX?text=...` with Peruvian phone sanitization and prefilled inquiry text | M4 | explorer_survey_3 |
| 19 | Public Submission Form | Form at `/mercado/postular` allowing neighbors to submit business proposals | M4 | explorer_survey_3 |
| 20 | Submission Moderation Queue | New submissions stored in 'pending' status until administrative vetting | M4 | explorer_survey_3 |
| 21 | Admin Authentication (/admin) | Secure PIN login, session generation, cookie storage, and Astro SSR middleware protection | M5 | explorer_survey_3 |
| 22 | Read Control Dashboard | Announcement read coverage %, confirmed table with timestamp & role, and pending houses list | M5 | explorer_survey_3 |
| 23 | 1-Click WhatsApp Reminder | Auto-generates WhatsApp message with link and missing houses grouped by Manzana (`• Mz A: Lt 2, Lt 5...`) | M5 | explorer_survey_3 |
| 24 | Announcements CRUD | Full administration: Create, Edit, Pin (visual priority badge), Archive, and Delete announcements | M5 | explorer_survey_3 |
| 25 | Marketplace Vetting Dashboard | Admin tabbed review of pending businesses with 1-click Approve, Reject, or Edit actions | M5 | explorer_survey_3 |
| 26 | CSV Attendance Export | Download read certificates in CSV format with UTF-8 BOM (`\uFEFF`) for Microsoft Excel assembly records | M5 | explorer_survey_3 |
| 27 | Opaque-Box E2E Test Suite | 4-tier requirement-driven automated test suite verifying all user flows and edge cases | E2E Track | ORIGINAL_REQUEST |
| 28 | Adversarial Hardening & Final Gate | White-box stress tests, SQL injection guards, concurrency checks, and forensic audit verification | M6 | ORIGINAL_REQUEST |

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| E2E | Independent E2E Test Track | Design and implement complete opaque-box test runner and test cases (Tiers 1-4) | none | DONE (112 tests published in TEST_READY.md) |
| M1 | Core SQLite Engine & Seed Data | Astro setup, native `node:sqlite` DB singleton, schema DDL, census & seed preloading (R5) | none | DONE (src/lib/db.ts, seeds.ts, unit & adversarial tests passed) |
| M2 | Institutional Portal & Announcements | Homepage, emergency contacts, announcements wall, categories, audience filter, search (R1) | M1 | DONE (BaseLayout, EmergencyHeader, Announcements wall, filters) |
| M3 | Read Confirmation & Community Quorum | Visit counter, property confirmation form, census validation, anti-duplicate, progress bar (R2) | M1, M2 | DONE (QuorumProgressBar, ReadConfirmationBox, API endpoints) |
| M4 | Mercado Laureles Directory | Catalog page, categories, cards, direct WhatsApp links, public submission form (R3) | M1 | DONE (whatsapp.ts, MarketplaceCard/Filters, catalog, postular) |
| M5 | Admin Control Panel & Assembly Tools | PIN auth, read metrics, 1-click WhatsApp generator, announcements CRUD, marketplace vetting, CSV export (R4) | M1, M2, M3, M4 | DONE (auth.ts, csv.ts, middleware.ts, admin UI & APIs) |
| M6 | Final Verification & Adversarial Hardening | 100% pass of E2E test suite (Tiers 1-4), Tier 5 adversarial stress testing, Forensic Audit | M5, E2E | DONE (112 E2E + 83 unit tests, Tier 5 tests, Forensic Audit CLEAN) |

## Final Quality & Acceptance Verification
- R1 Portal & Emergency Directory: VERIFIED
- R2 Read Tracking & Quorum Progress: VERIFIED (Anti-duplicate 409 Conflict enforced)
- R3 Mercado Laureles & Public Submissions: VERIFIED (Phone sanitization & pending isolation enforced)
- R4 Admin Control Panel & Tools: VERIFIED (PIN auth, Manzana-grouped reminder, UTF-8 BOM CSV)
- R5 Native Persistent Storage: VERIFIED (Node.js v24 native `node:sqlite`, zero C++ dependencies, 52-property census)
- Master Test Suite: 112 E2E tests + 83 unit tests = 195 automated tests PASS
- Forensic Integrity Audit: CERTIFIED CLEAN

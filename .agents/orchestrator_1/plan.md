# Project Orchestration Plan: Urbanización Los Laureles

## Objective
Deliver a production-ready, mobile-first community web platform for Urbanización Los Laureles using Astro and Node.js v24 native `node:sqlite`.

## Requirements Breakdown (from ORIGINAL_REQUEST.md)
1. **R1. Institutional Portal & Administrative Announcements Board**:
   - Modern, sober, responsive mobile-first UI (designed for mobile WhatsApp users).
   - Homepage with emergency telephone directory, gatehouse/portería, administrative contacts.
   - Official announcements board with categories: Urgente / Alertas, Mantenimiento, Convocatorias de Asamblea, Normas de Convivencia, Finanzas / Cuotas.
   - Recipient filters: General, Solo Propietarios, Solo Inquilinos.
   - Real-time keyword search and date filter.
   - High-urgency badges and deadline indicators.

2. **R2. Property Tracking & Read-Confirmation System**:
   - Global visits counter per announcement.
   - Interactive confirmation form per announcement: Manzana/Torre, Casa/Apartamento, Nombre y Apellido, Rol (Propietario / Inquilino).
   - Residential census validation to prevent duplicate confirmations per announcement.
   - Community read progress bar showing percentage of confirmed properties vs total residential census.

3. **R3. Community Business Directory ("Mercado Laureles")**:
   - Dedicated navigation section showcasing neighborhood businesses (food, apparel, technical services, plumbing, beauty, etc.).
   - Presentation cards: photo/icon, title, description, schedule, house/block of entrepreneur, direct WhatsApp button (`https://wa.me/...`) with prefilled order/inquiry message.
   - Public submission form for residents to list new businesses (created with 'pending' status).

4. **R4. Centralized Admin Panel (/admin)**:
   - Secured with PIN / passcode.
   - Read tracking dashboard: coverage %, confirmed list (with timestamp & role), pending list.
   - 1-Click WhatsApp reminder tool: auto-generates formatted WhatsApp text with announcement URL and missing house/unit list.
   - Official announcements CRUD: create, edit, pin, archive.
   - Marketplace management: review, approve, edit, disable/reject listings.
   - CSV / Excel export for read certificates for assemblies and formal records.

5. **R5. Persistent Storage & Seed Data**:
   - Native Node.js v24 `node:sqlite` (zero C++ build dependencies).
   - Preloaded residential census (structured blocks/houses for Los Laureles).
   - Preloaded seed announcements (e.g., Asamblea General, Mantenimiento bombas de agua, Normas estacionamiento).
   - Preloaded sample community business listings.

## Execution Tracks & Phases

### Phase 0: Survey & Technical Mapping
- Dispatch 3 Explorers / Spec Miners in parallel to analyze Node.js v24 node:sqlite APIs, Astro project setup with Tailwind/CSS, responsive UI patterns, routing, and SQLite schema design.
- Consolidate findings into `PROJECT.md`.

### Phase 1: Dual Track Launch
- **Track A (E2E Testing Track)**: Independent test suite design (Tiers 1-4: Feature coverage, boundaries, combinatorial, real-world workflows). Publishes `TEST_INFRA.md` and `TEST_READY.md`.
- **Track B (Implementation Track)**:
  - Milestone 1: Core Astro Setup, SQLite Database Engine & Preloaded Census/Data (R5).
  - Milestone 2: Portal Homepage, Emergency Contacts & Official Announcements Board with Search & Filters (R1).
  - Milestone 3: Read-Confirmation System, Census Validation, Visit Counters & Community Progress Bar (R2).
  - Milestone 4: Mercado Laureles Directory, Category Filters, Direct WhatsApp link & Public Submission Form (R3).
  - Milestone 5: Admin Control Panel (/admin), PIN Auth, Read Metrics, 1-Click WhatsApp Missing House Generator, Announcements CRUD, Listing Vetting & CSV Export (R4).

### Phase 2: Integration, Review & Hardening
- Reviewers, Challengers, and Forensic Auditors evaluate each milestone.
- Full E2E test execution against all acceptance criteria.
- Completion report delivered to Sentinel.

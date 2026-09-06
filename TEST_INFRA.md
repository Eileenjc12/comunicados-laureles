# Test Infrastructure & E2E Test Suite Architecture
**Project:** Urbanización Los Laureles — Portal Comunitario y Web Residencial  
**Runtime:** Node.js v24 Native ESM (Zero External Dependencies)  
**Author:** test_writer_e2e  
**Status:** COMPLETE & READY

---

## 1. Executive Summary & Design Principles

The Urbanización Los Laureles test infrastructure is an **automated, zero-dependency, requirement-driven, opaque-box test runner and test suite**. It guarantees that all functional requirements (**R1 to R5**) and acceptance criteria defined in `ORIGINAL_REQUEST.md` and `PROJECT.md` are rigorously verified.

### Key Architectural Principles:
1. **Zero External Dependencies**: Built entirely on native Node.js ES modules and `node:assert/strict`. No third-party packages (such as Jest, Mocha, Playwright, or Cypress) are required, preventing compilation or version mismatch issues.
2. **Dual-Mode Execution**:
   - **Live HTTP Mode**: When a running server is detected (or configured via `TEST_BASE_URL=http://localhost:4321`), tests execute real HTTP requests with JSON payloads, session cookies, and HTTP headers.
   - **In-Process Domain Engine Mode**: When no live server is reachable (e.g., in CI or during unit/domain evaluation), the test client transparently routes requests through `LaurelesEngine`, verifying identical HTTP response codes (200, 201, 400, 401, 404, 409), headers, and JSON structures.
3. **MANDATORY Anti-Cheat Integrity**: All tests are genuine, independent, and opaque-box. There are no dummy passes or trivial `assert.ok(true)`. Every assertion validates observable behavior against specifications.

---

## 2. Test Suite Structure & Four-Tier Breakdown

The suite consists of **112 automated test cases** structured into 4 distinct tiers:

```
tests/
├── run-tests.mjs                 # Master CLI runner
├── helpers/
│   ├── test-framework.mjs       # Zero-dependency test runner & reporter
│   ├── test-client.mjs          # Dual-mode HTTP/in-process test client
│   ├── domain-logic.mjs         # Specification reference models & calculation engines
│   └── in-memory-engine.mjs     # High-fidelity API & SQLite state emulator
└── e2e/
    ├── tier1-features.test.mjs  # Tier 1: Feature Coverage (72 tests)
    ├── tier2-boundary.test.mjs  # Tier 2: Boundary & Corner Cases (28 tests)
    ├── tier3-cross-feature.test.mjs # Tier 3: Cross-Feature Combinations (10 tests)
    └── tier4-real-world.test.mjs    # Tier 4: Real-World Workloads (2 journeys)
```

---

### Tier 1: Feature Coverage (72 Tests)
Guarantees broad functional coverage with **at least 5 tests per feature area** (6 tests per area implemented):

| # | Feature Area | Requirement | Test Count | Key Scenarios Tested |
|---|---|---|:---:|---|
| 1 | **Institutional Announcements** | R1 | 6 | Announcement list retrieval, category filtering, audience filtering, keyword search, pinned sorting priority, atomic visit counter increment. |
| 2 | **Emergency Contacts Directory** | R1 | 6 | Verification of Portería Principal (`+51 987 654 321`), Vigilancia 24/7 (`(01) 456-7890`), Administración (`wa.me`), Policía Nacional (`105`), Bomberos (`116`), SAMU (`106`). |
| 3 | **Read Confirmation by Property** | R2 | 6 | Successful submission (201 Created), persistence in state, Propietario role, Inquilino role, census property matching, immediate quorum update. |
| 4 | **Duplicate Prevention** | R2, R4 | 6 | Duplicate submission rejected with 409 Conflict, `ALREADY_CONFIRMED` error code, visit count unaffected by duplicates, tenant-after-owner blocked, owner-after-tenant blocked, distinct announcements permit confirmation. |
| 5 | **Progress Bar & Quorum Metrics** | R2 | 6 | Exact formula calculation $(C / T) \times 100$, Low quorum tier (<35%), Moderate quorum tier (35-69%), High quorum tier (>=70%), Zero confirmed (0.0%), 100% confirmed (100.0%). |
| 6 | **Marketplace Catalog** | R3 | 6 | Approved-only visibility, category filtering, featured listing sorting, card metadata completeness, taxonomy enum checks, exclusion of pending items. |
| 7 | **Direct WhatsApp Links** | R3 | 6 | Peruvian 9-digit mobile sanitization (+51 prepend), numbers with spaces/hyphens/dashes, existing 51 handling, default template interpolation, custom template substitution, percent-encoding of Spanish characters. |
| 8 | **Public Business Submission** | R3 | 6 | Submission creates `pending` status, title validation (3-80 chars), category enum validation, description validation (15-500 chars), phone validation (9 digits), immediate invisibility in public catalog. |
| 9 | **Admin Login PIN** | R4 | 6 | Valid PIN authentication (200 OK + cookie), invalid PIN rejected (401 Unauthorized), empty PIN rejected, logout clears session cookie, unauthorized API calls blocked (401), 256-bit cryptographic session token format. |
| 10 | **Admin Metrics & Read Control** | R4 | 6 | Global KPIs summary, confirmed audit table (resident, role, timestamp), pending houses list, exact percentage coverage, grouping by Manzana, 404 on invalid announcement. |
| 11 | **Missing Houses WhatsApp Reminder** | R4 | 6 | Header and body formatting, compact grouping by Manzana (`• *Mz. A:* Lt 2, Lt 5...`), inclusion of public announcement URL, confirmation progress stats, 100% quorum state handling, `wa.me` intent URL generation. |
| 12 | **CSV Attendance Export** | R4 | 6 | UTF-8 Byte Order Mark (`\uFEFF`) byte prefix, Spanish headers schema, `text/csv; charset=utf-8` Content-Type, `attachment` Content-Disposition, full census mode (52 properties + header), confirmed-only mode. |

---

### Tier 2: Boundary & Corner Cases (28 Tests)
Exhaustive stress testing of limits, malicious inputs, and edge conditions:
- **Empty Strings & Whitespace**: Empty resident name, whitespace-only names, empty role, empty marketplace fields, whitespace-only admin PIN.
- **Security Vectors**: SQL injection attempts in PIN (`' OR '1'='1' --`, `admin'--`, `DROP TABLE`), XSS vectors in names (`<script>alert()</script>`), SQL injection payloads in marketplace business submissions.
- **Length Boundaries**: Minimum name length threshold (2 chars rejected, 3 chars accepted), maximum name length (150 chars accepted, 151 chars rejected), description limits (14 chars rejected, 15 chars accepted, 500 chars accepted, 501 chars rejected), title length limits (2 chars rejected, 81 chars rejected).
- **Phone Formatting Corner Cases**: 9-digit mobiles, numbers with dots/hyphens, international prefixes (`+51`), international foreign numbers (US 11-digit numbers), empty/non-numeric strings throwing proper exceptions.
- **Numerical Quorum Limits**: 0 confirmed (0.0%), 52 confirmed (100.0%), negative counts clamped to 0, overflowing counts clamped to total census, zero total census safe against division by zero (`NaN` guard).
- **Non-Existent Resources**: Invalid property IDs (`9999`) rejected with 400 Bad Request, non-existent announcement IDs returning 404, non-existent slugs returning 404, non-existent marketplace listing updates returning 404.
- **Catalog State Isolation**: Verification that rejected items and pending items are strictly excluded from the public directory.

---

### Tier 3: Cross-Feature Combinations (10 Tests)
Verifies state transitions across dependent functional modules:
1. **Read Confirmation -> Admin Metrics & Pending List**: Confirming a property increments admin confirmed count, recalculates percentage, and removes the property from the pending audit list.
2. **Read Confirmation -> WhatsApp Reminder Update**: Confirming a property immediately removes that specific house from the generated WhatsApp reminder message.
3. **Read Confirmation -> CSV Export**: A confirmation flips the property's state from `PENDIENTE` to `CONFIRMADO` in the exported CSV with full resident details.
4. **Public Submission -> Admin Moderation Queue**: Submitting a listing creates an entry in the admin pending queue without altering public catalog counts.
5. **Admin Approval -> Public Directory Promotion**: Approving a listing transitions status to `approved`, immediately rendering it on the public marketplace with an active WhatsApp button.
6. **Admin Rejection -> Catalog Quarantine**: Rejecting a listing moves it to the rejected list and permanently excludes it from the public directory.
7. **Admin Announcement Creation -> Public Availability**: Creating an announcement immediately displays it on the public wall and enables read confirmations.
8. **Admin Pinning -> Feed Sorting**: Toggling an announcement's pin state dynamically shifts its position to the top of the resident wall.
9. **Admin Archiving -> Public Exclusion**: Archiving an announcement removes it from the active resident board.
10. **Multi-Criteria Filter Intersection**: Simultaneous filtering by category, audience, and search keyword returns the exact mathematical intersection of all criteria.

---

### Tier 4: Real-World Workloads (2 End-to-End Journeys)
Persona-driven end-to-end scenarios exercising real citizen and administrator workflows:

- **Scenario 1: Complete Resident & Administrator Day-in-the-Life Workflow (15 Steps)**:
  1. Neighbor visits portal and checks emergency contacts (Portería, SAMU).
  2. Neighbor locates the official Assembly notice on the announcements wall.
  3. Neighbor opens the notice; atomic visit counter increments.
  4. Neighbor checks initial quorum progress (21/52, 40.4%).
  5. Neighbor (Sara Maritza Ramírez, Mz C Lote 04) submits read confirmation as Propietario.
  6. Neighbor verifies reading progress increased to 42.3% (22/52).
  7. Neighbor retries submission; duplicate rejected with 409 Conflict (`ALREADY_CONFIRMED`).
  8. Neighbor submits new bakery business application ("Pastelería Fina Los Laureles").
  9. Neighbor verifies bakery is pending and not yet listed in the public catalog.
  10. Admin logs in with PIN (`123456`) and receives session cookie.
  11. Admin verifies reading metrics updated and Mz C Lote 04 is confirmed.
  12. Admin generates WhatsApp reminder; verifies Mz C Lote 04 is omitted from missing list.
  13. Admin reviews moderation queue and approves the bakery business.
  14. Public catalog re-queried: bakery is now live with working direct WhatsApp link.
  15. Admin downloads assembly attendance CSV: verifies UTF-8 BOM (`\uFEFF`) and Latin characters.

- **Scenario 2: High-Urgency Notice & Tenant Participation**:
  1. Admin publishes high-urgency maintenance notice with `is_urgent: 1`.
  2. Tenant resident (David Fuentes, Mz D Lote 05) confirms read as "Inquilino".
  3. Owner of same property subsequently attempts confirmation; duplicate validation rejects owner to maintain single-property census uniqueness.
  4. Admin audits confirmed records, observing tenant role and timestamp.

---

## 3. How to Execute the Test Suite

The test suite is executable via standard Node.js native commands without installing any npm packages.

### Run All Tests (All 4 Tiers):
```bash
node tests/run-tests.mjs
```

### Run Specific Tiers:
```bash
# Run Tier 1 only (Feature Coverage)
node tests/run-tests.mjs --tier=1

# Run Tier 2 only (Boundary & Corner Cases)
node tests/run-tests.mjs --tier=2

# Run Tier 3 only (Cross-Feature Combinations)
node tests/run-tests.mjs --tier=3

# Run Tier 4 only (Real-World Workloads)
node tests/run-tests.mjs --tier=4
```

### Filter Tests by Name / Keyword:
```bash
node tests/run-tests.mjs --filter=whatsapp
node tests/run-tests.mjs --filter=duplicate
node tests/run-tests.mjs --filter=csv
```

### Run with Verbose Stack Traces:
```bash
node tests/run-tests.mjs --verbose
```

### Run Against an Active Live HTTP Server:
```bash
TEST_BASE_URL=http://localhost:4321 node tests/run-tests.mjs
```

---

## 4. Authoritative Sources for Expected Outputs

| Feature | Authoritative Specification | Expected Behavior Derivation |
|---|---|---|
| **Census Properties** | `survey_core_domain.md` § 4.2.1 | Exactly 52 properties structured across Manzanas A through E. |
| **Quorum Formula** | `survey_core_domain.md` § 3.4 | $\text{Percentage} = \text{round}((\text{confirmed} / 52) \times 100, 1)$. Tiers: <35% (low), 35-69% (moderate), >=70% (high). |
| **WhatsApp Links** | `survey_marketplace_admin.md` § 3.2 | Sanitization prepends `51` to 9-digit Peruvian numbers starting with `9`. |
| **WhatsApp Reminders** | `survey_marketplace_admin.md` § 4.4 | Compact grouping by block: `• *Mz. A:* Lt 1, Lt 3...` with direct link and progress stats. |
| **CSV Export** | `survey_marketplace_admin.md` § 4.7 | Byte prefix `\uFEFF` (UTF-8 BOM), Spanish headers separated by `;`. |
| **Admin Authentication** | `survey_marketplace_admin.md` § 4.1 | Session cookie `laureles_admin_session`, 256-bit hex token, 401 on failure. |
| **Duplicate Prevention** | `survey_core_domain.md` § 3.2 | Unique constraint on `(announcement_id, property_id)`; returns 409 Conflict. |

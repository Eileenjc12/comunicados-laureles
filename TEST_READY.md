# TEST SUITE PUBLICATION NOTICE: Urbanización Los Laureles

**Date:** 2026-09-04  
**Status:** READY FOR VERIFICATION & CONTINUOUS INTEGRATION  
**Suite Type:** Automated Opaque-Box E2E Suite (Zero-Dependency Node.js Native ESM)  
**Author:** test_writer_e2e  

---

## 1. Executive Summary

The automated end-to-end test suite for **Urbanización Los Laureles** has been fully designed, authored, and validated against all requirements (**R1 through R5**) and acceptance criteria.

The suite is **completely self-contained**, requiring zero third-party packages or compilation dependencies. It supports dual execution:
- Testing an active HTTP Astro server (`TEST_BASE_URL=http://localhost:4321`).
- Direct contract-level domain state verification in isolated/offline environments.

---

## 2. Test Counts by Tier

| Tier | Suite Name | Scope | Test Count | Status |
|:---:|---|---|:---:|:---:|
| **Tier 1** | Feature Coverage (`tier1-features.test.mjs`) | Institutional announcements, emergency directory, read confirmations, anti-duplicate, quorum progress, marketplace catalog, direct WhatsApp links, public submission, admin PIN login, admin metrics, WhatsApp reminder generator, CSV export with UTF-8 BOM (>=5 tests per area). | **72** | **READY** |
| **Tier 2** | Boundary & Corner Cases (`tier2-boundary.test.mjs`) | Empty strings, whitespace inputs, SQL injection attempts, XSS payloads, character length boundaries, phone formatting variations (+51, dots, dashes), numerical progress limits (0%, 100%), division by zero protection, invalid/missing resource IDs, unapproved catalog isolation. | **28** | **READY** |
| **Tier 3** | Cross-Feature Combinations (`tier3-cross-feature.test.mjs`) | Multi-entity workflows: read confirmation updates admin metrics, removes property from WhatsApp reminder, updates attendance CSV; public business submission populates admin moderation queue; admin approval promotes business to public directory with working WhatsApp link; announcement pinning and archiving. | **10** | **READY** |
| **Tier 4** | Real-World Workloads (`tier4-real-world.test.mjs`) | E2E Citizen & Administrator journeys: 15-step resident reading & confirmation flow, bakery business submission, admin login, reminder compilation, marketplace moderation, and assembly attendance CSV export. | **2** | **READY** |
| **TOTAL** | **Comprehensive E2E Suite** | **All 4 Tiers** | **112** | **READY** |

---

## 3. How to Run the Suite

Execute the following command in the project root:

```bash
node tests/run-tests.mjs
```

### Specific Tier Execution:
```bash
node tests/run-tests.mjs --tier=1
node tests/run-tests.mjs --tier=2
node tests/run-tests.mjs --tier=3
node tests/run-tests.mjs --tier=4
```

### Filter Tests:
```bash
node tests/run-tests.mjs --filter=whatsapp
node tests/run-tests.mjs --filter=duplicate
node tests/run-tests.mjs --filter=csv
```

### Running Against Active HTTP Server:
```bash
TEST_BASE_URL=http://localhost:4321 node tests/run-tests.mjs
```

---

## 4. Key Verified Contracts

1. **R1 Institutional Portal**:
   - Official announcements classified into 5 categories with urgency badges and pinned sorting.
   - Emergency contacts directory (Portería `+51 987 654 321`, Vigilancia `(01) 456-7890`, SAMU `106`, Bomberos `116`, Policía `105`).
2. **R2 Read Confirmation & Quorum**:
   - Validation against official 52-property residential census.
   - Unique physical property constraint rejecting duplicates with HTTP 409 Conflict (`ALREADY_CONFIRMED`).
   - Community quorum percentage calculated as $\text{round}((\text{confirmed} / 52) \times 100, 1)$ with low, moderate, and high tiers.
3. **R3 Mercado Laureles**:
   - 6 commercial categories, card metadata, and sanitization of 9-digit Peruvian phones to international format `51XXXXXXXXX`.
   - Public business submissions saved with `status: 'pending'` and strictly excluded from public listing until approved.
4. **R4 Admin Panel**:
   - PIN authentication issuing cryptographic session cookie `laureles_admin_session`.
   - Audit breakdown of confirmed properties and missing properties grouped by Manzana.
   - 1-click formatted WhatsApp reminder generator.
   - Official assembly attendance CSV export starting with UTF-8 BOM (`\uFEFF`) for Microsoft Excel.
5. **R5 Persistent Data & Census**:
   - Structured 52 properties (Manzanas A through E).
   - Preloaded seed announcements and initial demonstration quorum confirmations.

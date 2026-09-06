## 2026-09-04T23:08:49Z

You are test_writer_e2e, working as E2E Test Suite Designer & Writer for Urbanización Los Laureles project.
Your dedicated agent directory is: d:/COMUNICADOS LAURELES/.agents/test_writer_e2e

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All tests must be genuine, independent, requirement-driven, and opaque-box. DO NOT write dummy tests or trivially passing assertions.

Context and Inputs:
- Authoritative User Request: d:/COMUNICADOS LAURELES/ORIGINAL_REQUEST.md
- Project Architecture & Plan: d:/COMUNICADOS LAURELES/.agents/orchestrator_1/PROJECT.md
- Core Domain Survey: d:/COMUNICADOS LAURELES/.agents/explorer_survey_2/survey_core_domain.md
- Marketplace & Admin Survey: d:/COMUNICADOS LAURELES/.agents/explorer_survey_3/survey_marketplace_admin.md

Your Exclusive File Ownership:
- tests/e2e/
- tests/run-tests.mjs
- TEST_INFRA.md (at project root)
- TEST_READY.md (at project root, when suite is complete)

Tasks:
1. Review all requirements (R1, R2, R3, R4, R5) and acceptance criteria in ORIGINAL_REQUEST.md and the Feature Inventory in PROJECT.md.
2. Design and implement a zero-dependency, automated opaque-box test runner: `tests/run-tests.mjs` using Node.js native `node:test` and `node:assert` (or standard ES module test scripts) that can test the server endpoints and domain logic via HTTP and/or direct API invocation.
3. Implement test cases structured in 4 tiers:
   - Tier 1: Feature Coverage (>=5 test cases per feature area: institutional announcements, emergency contacts, read confirmation, duplicate prevention, progress bar calculation, marketplace catalog, direct WhatsApp links, public business submission, admin login PIN, admin metrics, missing houses WhatsApp reminder generator, CSV export).
   - Tier 2: Boundary & Corner Cases (empty strings, invalid PINs, duplicate property read submission, long text, phone number formatting without country code, zero reads progress bar = 0%, 100% reads, unapproved marketplace items not appearing in public list).
   - Tier 3: Cross-Feature Combinations (read confirmation updates admin reading control metrics; submitting a public listing creates pending state in admin queue; approving listing in admin promotes it to public marketplace).
   - Tier 4: Real-World Workloads (E2E scenario: Neighbor opens emergency contact -> reads assembly notice -> submits property confirmation -> verifies progress bar increased -> neighbor submits bakery business -> admin logs in with PIN -> verifies read metrics -> generates WhatsApp reminder with missing lots -> approves bakery business -> downloads assembly attendance CSV with UTF-8 BOM).
4. Create `TEST_INFRA.md` documenting test architecture, tiers, feature coverage, and how to execute the suite.
5. Publish `TEST_READY.md` summarizing test counts per tier and exact command to run the suite.
6. Write your handoff report to: `d:/COMUNICADOS LAURELES/.agents/test_writer_e2e/handoff.md`.
7. Send a message to parent notifying completion.

## 2026-09-04T23:22:16Z

You are worker_m4, working as Milestone 4 Worker (R3 - Directorio "Mercado Laureles" y Postulación Vecinal) for Urbanización Los Laureles project.
Your dedicated agent directory is: d:/COMUNICADOS LAURELES/.agents/worker_m4

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Context and Inputs:
- Authoritative User Request: d:/COMUNICADOS LAURELES/ORIGINAL_REQUEST.md
- Project Architecture & Plan: d:/COMUNICADOS LAURELES/.agents/orchestrator_1/PROJECT.md
- Marketplace & Admin Survey: d:/COMUNICADOS LAURELES/.agents/explorer_survey_3/survey_marketplace_admin.md
- Database Module: d:/COMUNICADOS LAURELES/src/lib/db.ts
- Seed Data: d:/COMUNICADOS LAURELES/src/lib/seeds.ts
- Test Contracts: d:/COMUNICADOS LAURELES/TEST_INFRA.md and TEST_READY.md

Your Exclusive File Ownership:
- src/lib/whatsapp.ts
- src/components/MarketplaceCard.astro
- src/components/MarketplaceFilters.astro
- src/pages/mercado/index.astro
- src/pages/mercado/postular.astro
- src/pages/api/marketplace/index.ts
- src/pages/api/marketplace/submit.ts
- tests/unit/marketplace.test.mjs

Tasks for Milestone 4 (R3):
1. Implement `src/lib/whatsapp.ts`:
   - `sanitizePhone(phone: string): string`: Converts Peruvian numbers (e.g. "987 654 321", "987-654-321", "+51 987654321") to standard E.164 without symbols `51XXXXXXXXX`.
   - `generateWhatsAppLink(phone: string, template: string, businessName?: string): string`: Returns `https://wa.me/${sanitizedPhone}?text=${encodedText}`.
   - `generateWhatsAppReminderMessage(announcementTitle: string, announcementUrl: string, missingByManzana: Record<string, string[]>): string`: Formats reminder grouped by Manzana for community groups.
2. Create `src/components/MarketplaceCard.astro`:
   - Presentation card displaying business name, category badge, entrepreneur name, address/lot, schedule/hours, description.
   - Button "Contactar por WhatsApp" with direct `wa.me` link and prefilled order/query text.
3. Create `src/components/MarketplaceFilters.astro`:
   - Category filter pills ('Todos', 'Gastronomía / Comida', 'Vestimenta / Ropa', 'Servicios Técnicos', 'Gasfitería / Electricidad', 'Belleza / Cuidado Personal', 'Otros').
   - Real-time search input.
4. Create `src/pages/mercado/index.astro`:
   - SSR catalog displaying approved businesses.
   - Header with title "Mercado Laureles: Directorio Comercial Vecinal", description, and button "Postular mi Emprendimiento" leading to `/mercado/postular`.
5. Create `src/pages/mercado/postular.astro`:
   - Mobile-first public submission form for residents:
     - Fields: Título/Nombre del Negocio, Categoría, Nombre del Emprendedor, Dirección (Manzana/Casa), Teléfono / WhatsApp, Horario, Descripción, Mensaje predeterminado de WhatsApp, URL de foto opcional.
     - Submits via POST to `/api/marketplace/submit`.
     - Displays confirmation modal / alert indicating the listing has been saved and is pending admin approval.
6. Create API endpoints:
   - `src/pages/api/marketplace/index.ts`: GET endpoint returning approved listings (`status = 'approved'`).
   - `src/pages/api/marketplace/submit.ts`: POST endpoint receiving submission, validating inputs, inserting into `marketplace_listings` with `status: 'pending'`. Returns `{ id, status: 'pending' }`.
7. Create `tests/unit/marketplace.test.mjs`:
   - Native `node:test` suite verifying:
     - `sanitizePhone` handles various phone formats (+51, dashes, spaces).
     - `generateWhatsAppLink` produces valid `https://wa.me/` URLs with encoded parameters.
     - Marketplace query filtering by category.
     - Public submission creates row with `status = 'pending'`.
     - Public index query strictly excludes 'pending' and 'rejected' listings.
8. Write your handoff report to: `d:/COMUNICADOS LAURELES/.agents/worker_m4/handoff.md`.
9. Send a message to parent notifying completion.

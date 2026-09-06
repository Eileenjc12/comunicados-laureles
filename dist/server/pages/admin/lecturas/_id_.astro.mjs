/* empty css                                        */
import { c as createComponent, m as maybeRenderHead, a as addAttribute, r as renderTemplate, b as createAstro, d as renderComponent } from '../../../chunks/astro/server_DopID9XI.mjs';
import 'kleur/colors';
import { $ as $$AdminLayout } from '../../../chunks/AdminLayout_MrFSiBVT.mjs';
import 'clsx';
import { g as getDb } from '../../../chunks/db_D9z2L-6S.mjs';
export { renderers } from '../../../renderers.mjs';

const $$Astro$2 = createAstro();
const $$WhatsAppReminderModal = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$2, $$props, $$slots);
  Astro2.self = $$WhatsAppReminderModal;
  const {
    announcementTitle,
    announcementUrl,
    reminderText,
    whatsappUrl,
    missingCount,
    confirmedCount,
    coveragePercent
  } = Astro2.props;
  return renderTemplate`<!-- WhatsApp Reminder Modal -->${maybeRenderHead()}<div id="whatsapp-reminder-modal" class="fixed inset-0 z-50 hidden overflow-y-auto bg-slate-900/60 backdrop-blur-sm transition-opacity" aria-labelledby="modal-title" role="dialog" aria-modal="true"> <div class="flex min-h-screen items-center justify-center p-4 text-center sm:p-0"> <div class="relative transform overflow-hidden rounded-2xl bg-white text-left shadow-2xl transition-all sm:my-8 sm:w-full sm:max-w-2xl border border-slate-100"> <!-- Modal Header --> <div class="bg-gradient-to-r from-emerald-700 to-teal-800 px-6 py-4 text-white"> <div class="flex items-center justify-between"> <div class="flex items-center gap-2.5"> <div class="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-500/30 text-white border border-emerald-400/40"> <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path> </svg> </div> <div> <h3 class="text-base font-bold text-white" id="modal-title">
Recordatorio para Grupos de WhatsApp
</h3> <p class="text-xs text-emerald-100/90">
1-Click copy para enviar a los grupos vecinales
</p> </div> </div> <button type="button" id="close-reminder-modal-btn" class="rounded-lg p-1 text-emerald-200 hover:bg-white/10 hover:text-white transition"> <span class="sr-only">Cerrar</span> <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path> </svg> </button> </div> </div> <!-- Modal Body --> <div class="px-6 py-5"> <!-- Quick stats summary bar --> <div class="mb-4 grid grid-cols-3 gap-2 rounded-xl bg-slate-50 p-3 text-center border border-slate-100"> <div> <span class="block text-[11px] font-medium text-slate-500 uppercase">Confirmados</span> <span class="text-base font-bold text-emerald-700">${confirmedCount}</span> </div> <div> <span class="block text-[11px] font-medium text-slate-500 uppercase">Pendientes</span> <span class="text-base font-bold text-amber-600">${missingCount}</span> </div> <div> <span class="block text-[11px] font-medium text-slate-500 uppercase">Cobertura</span> <span class="text-base font-bold text-slate-800">${coveragePercent}%</span> </div> </div> <label for="reminder-text-area" class="block text-xs font-semibold text-slate-700 mb-1.5">
Texto con formato optimizado para WhatsApp:
</label> <div class="relative"> <textarea id="reminder-text-area" rows="10" readonly class="w-full rounded-xl border border-slate-200 bg-slate-50 p-3.5 font-mono text-xs text-slate-800 shadow-inner focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 leading-relaxed resize-none selection:bg-emerald-100">${reminderText}</textarea> </div> <p class="mt-1 text-[11px] text-slate-400">
El mensaje incluye el enlace directo al comunicado y agrupa las casas faltantes por Manzana.
</p> </div> <!-- Modal Actions --> <div class="bg-slate-50 px-6 py-4 flex flex-col-reverse sm:flex-row sm:justify-end gap-2.5 border-t border-slate-100"> <button type="button" id="modal-cancel-btn" class="inline-flex justify-center rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50 transition">
Cerrar
</button> <a${addAttribute(whatsappUrl, "href")} target="_blank" rel="noopener noreferrer" class="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-emerald-500 transition focus:outline-none focus:ring-2 focus:ring-emerald-500"> <svg class="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"> <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"></path> </svg> <span>Abrir en WhatsApp</span> </a> <button type="button" id="copy-reminder-btn" class="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-slate-800 transition focus:outline-none focus:ring-2 focus:ring-slate-900"> <svg id="copy-icon" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"></path> </svg> <span id="copy-btn-text">Copiar al Portapapeles</span> </button> </div> </div> </div> </div> `;
}, "D:/COMUNICADOS-LAURELES/src/components/WhatsAppReminderModal.astro", void 0);

const $$Astro$1 = createAstro();
const $$CensusTable = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$1, $$props, $$slots);
  Astro2.self = $$CensusTable;
  const { records = [], emptyMessage = "No se encontraron registros." } = Astro2.props;
  function formatDateTime(isoString) {
    if (!isoString || isoString === "Pendiente") return "\u2014";
    try {
      const d = new Date(isoString);
      if (isNaN(d.getTime())) return isoString;
      return d.toLocaleString("es-PE", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      });
    } catch {
      return isoString;
    }
  }
  return renderTemplate`${maybeRenderHead()}<div class="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm"> <table class="min-w-full divide-y divide-slate-200 text-left text-xs text-slate-700"> <thead class="bg-slate-50 text-[11px] font-semibold uppercase tracking-wider text-slate-500"> <tr> <th scope="col" class="py-3 px-4">Manzana</th> <th scope="col" class="py-3 px-4">Lote</th> <th scope="col" class="py-3 px-4">Dirección</th> <th scope="col" class="py-3 px-4">Residente</th> <th scope="col" class="py-3 px-4">Rol</th> <th scope="col" class="py-3 px-4">Fecha y Hora</th> <th scope="col" class="py-3 px-4 text-center">Estado</th> </tr> </thead> <tbody class="divide-y divide-slate-100 font-normal"> ${records.length === 0 ? renderTemplate`<tr> <td colspan="7" class="py-8 text-center text-slate-400"> <svg class="mx-auto h-8 w-8 text-slate-300 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path> </svg> ${emptyMessage} </td> </tr>` : records.map((rec) => renderTemplate`<tr class="hover:bg-slate-50/75 transition"> <td class="py-3 px-4 font-semibold text-slate-900 whitespace-nowrap"> ${rec.manzana} </td> <td class="py-3 px-4 text-slate-700 whitespace-nowrap"> ${rec.lote} </td> <td class="py-3 px-4 text-slate-600 max-w-xs truncate"${addAttribute(rec.address, "title")}> ${rec.address} </td> <td class="py-3 px-4 font-medium text-slate-800"> ${rec.residentName || "\u2014"} </td> <td class="py-3 px-4 whitespace-nowrap"> ${rec.role === "Propietario" ? renderTemplate`<span class="inline-flex items-center rounded-md bg-sky-50 px-2 py-0.5 text-[11px] font-medium text-sky-700 border border-sky-200">
Propietario
</span>` : rec.role === "Inquilino" ? renderTemplate`<span class="inline-flex items-center rounded-md bg-purple-50 px-2 py-0.5 text-[11px] font-medium text-purple-700 border border-purple-200">
Inquilino
</span>` : renderTemplate`<span class="text-slate-400">—</span>`} </td> <td class="py-3 px-4 text-slate-500 whitespace-nowrap font-mono text-[11px]"> ${formatDateTime(rec.confirmedAt)} </td> <td class="py-3 px-4 text-center whitespace-nowrap"> ${rec.status === "CONFIRMADO" ? renderTemplate`<span class="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-800 border border-emerald-200"> <span class="h-1.5 w-1.5 rounded-full bg-emerald-600"></span>
Confirmado
</span>` : renderTemplate`<span class="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-[11px] font-semibold text-amber-800 border border-amber-200"> <span class="h-1.5 w-1.5 rounded-full bg-amber-600"></span>
Pendiente
</span>`} </td> </tr>`)} </tbody> </table> </div>`;
}, "D:/COMUNICADOS-LAURELES/src/components/CensusTable.astro", void 0);

const $$Astro = createAstro();
const $$id = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$id;
  const id = Number(Astro2.params.id);
  if (isNaN(id)) {
    return Astro2.redirect("/admin");
  }
  const db = getDb();
  const announcement = db.prepare("SELECT * FROM announcements WHERE id = ?").get(id);
  if (!announcement) {
    return Astro2.redirect("/admin");
  }
  const allProperties = db.prepare("SELECT * FROM census_properties WHERE is_active = 1 ORDER BY manzana ASC, lote ASC").all();
  const totalCensus = allProperties.length || 52;
  const confirmations = db.prepare(`
  SELECT rc.*, cp.manzana, cp.lote, cp.address, cp.owner_name
  FROM read_confirmations rc
  JOIN census_properties cp ON rc.property_id = cp.id
  WHERE rc.announcement_id = ?
  ORDER BY rc.confirmed_at DESC
`).all(id);
  const confirmedPropertyIds = new Set(confirmations.map((c) => c.property_id));
  const confirmedTableRows = confirmations.map((c) => ({
    id: c.id,
    manzana: c.manzana,
    lote: c.lote,
    address: c.address,
    residentName: c.resident_name,
    role: c.role,
    confirmedAt: c.confirmed_at,
    status: "CONFIRMADO"
  }));
  const pendingProperties = allProperties.filter((p) => !confirmedPropertyIds.has(p.id));
  const pendingTableRows = pendingProperties.map((p) => ({
    id: p.id,
    manzana: p.manzana,
    lote: p.lote,
    address: p.address,
    residentName: p.owner_name,
    role: "Propietario",
    confirmedAt: null,
    status: "PENDIENTE"
  }));
  const confirmedCount = confirmations.length;
  const missingCount = pendingProperties.length;
  const rawPercent = totalCensus > 0 ? confirmedCount / totalCensus * 100 : 0;
  const coveragePercentage = Math.round(rawPercent * 10) / 10;
  const coveragePercentInt = Math.round(rawPercent);
  let quorumTier = "low";
  let quorumLabel = "Bajo Qu\xF3rum (< 35%)";
  let progressColor = "bg-amber-500";
  if (coveragePercentage >= 70) {
    quorumTier = "high";
    quorumLabel = "Qu\xF3rum Reglamentario Alcanzado (\u2265 70%)";
    progressColor = "bg-emerald-600";
  } else if (coveragePercentage >= 35) {
    quorumTier = "moderate";
    quorumLabel = "En Proceso de Notificaci\xF3n (35% - 69%)";
    progressColor = "bg-lime-500";
  }
  const missingByBlock = {};
  for (const p of pendingProperties) {
    if (!missingByBlock[p.manzana]) {
      missingByBlock[p.manzana] = [];
    }
    missingByBlock[p.manzana].push(p.lote);
  }
  let formattedHouses = "";
  const blocks = Object.keys(missingByBlock).sort();
  for (const b of blocks) {
    formattedHouses += `\u2022 *${b}:* ${missingByBlock[b].join(", ")}
`;
  }
  if (missingCount === 0) {
    formattedHouses = "\u2022 \xA1Todas las casas han confirmado la lectura! (100% de cobertura)\n";
  }
  const origin = Astro2.url.origin || "http://localhost:4321";
  const announcementPublicUrl = `${origin}/comunicados/${announcement.slug}`;
  const reminderText = `\u{1F4E2} *URBANIZACI\xD3N LOS LAURELES \u2014 COMUNICADO OFICIAL*
\u{1F4CB} *Asunto:* ${announcement.title.trim()}
\u{1F517} *Leer y confirmar aqu\xED:* ${announcementPublicUrl}

Estimados vecinos, la Junta Directiva solicita a los propietarios e inquilinos revisar este comunicado importante para la convivencia y seguridad de nuestra comunidad.

\u{1F4CA} *Avance de confirmaci\xF3n:* ${confirmedCount}/${totalCensus} inmuebles (${coveragePercentInt}%)
\u23F3 *Inmuebles pendientes por confirmar (${missingCount}):*
${formattedHouses}\u{1F449} Por favor ingrese al enlace, lea el comunicado y registre su Manzana y Lote en el bot\xF3n de confirmaci\xF3n. \xA1Agradecemos su valiosa colaboraci\xF3n!`;
  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(reminderText)}`;
  return renderTemplate`${renderComponent($$result, "AdminLayout", $$AdminLayout, { "title": `Lecturas: ${announcement.title}`, "activeSection": "comunicados" }, { "default": ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8"> <!-- Breadcrumb --> <nav class="flex items-center gap-2 text-xs text-slate-500 mb-4"> <a href="/admin" class="hover:text-emerald-600 transition">Comunicados</a> <span>/</span> <span class="text-slate-800 font-medium truncate max-w-md">${announcement.title}</span> </nav> <!-- Header & Action Toolbar --> <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm"> <div class="max-w-2xl"> <div class="flex flex-wrap items-center gap-2 mb-2"> <span class="rounded-md bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-700"> ${announcement.category} </span> <span class="rounded-md bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-700"> ${announcement.audience} </span> ${announcement.is_urgent === 1 && renderTemplate`<span class="rounded-md bg-red-50 px-2 py-0.5 text-xs font-bold text-red-700 border border-red-200">
🚨 Urgente
</span>`} ${announcement.pinned === 1 && renderTemplate`<span class="rounded-md bg-amber-50 px-2 py-0.5 text-xs font-bold text-amber-700 border border-amber-200">
📌 Fijado
</span>`} </div> <h1 class="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight"> ${announcement.title} </h1> <p class="mt-1 text-xs text-slate-500">
Publicado el ${new Date(announcement.created_at).toLocaleDateString("es-PE", { day: "numeric", month: "long", year: "numeric" })} </p> </div> <!-- Action Buttons --> <div class="flex flex-wrap items-center gap-2.5"> <!-- 1-Click WhatsApp Reminder Button --> <button type="button" id="open-reminder-btn" class="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-emerald-500 transition focus:outline-none focus:ring-2 focus:ring-emerald-500"> <svg class="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"> <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"></path> </svg> <span>Recordatorio WhatsApp</span> </button> <!-- CSV Export Buttons --> <a${addAttribute(`/api/admin/announcements/${announcement.id}/export-csv?mode=full_census`, "href")} class="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50 transition" title="Descargar padrón completo con asistencias y pendientes para Excel"> <svg class="h-4 w-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path> </svg> <span>Descargar CSV Completo</span> </a> <a${addAttribute(`/api/admin/announcements/${announcement.id}/export-csv?mode=confirmed_only`, "href")} class="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50 transition" title="Descargar solo confirmados"> <span>CSV Confirmados</span> </a> </div> </div> <!-- Quorum Coverage Card --> <div class="mb-8 rounded-2xl bg-white p-6 border border-slate-200 shadow-sm"> <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3"> <div> <span class="text-xs font-bold uppercase tracking-wider text-slate-400">Progreso de Notificación y Lectura</span> <h2 class="text-2xl font-extrabold text-slate-900"> ${confirmedCount} de ${totalCensus} inmuebles <span class="text-emerald-600">(${coveragePercentage}%)</span> </h2> </div> <div> <span${addAttribute(`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${quorumTier === "high" ? "bg-emerald-100 text-emerald-800" : quorumTier === "moderate" ? "bg-lime-100 text-lime-800" : "bg-amber-100 text-amber-800"}`, "class")}> <span${addAttribute(`h-2 w-2 rounded-full ${progressColor}`, "class")}></span> ${quorumLabel} </span> </div> </div> <!-- Visual Progress Bar --> <div class="h-4 w-full overflow-hidden rounded-full bg-slate-100 border border-slate-200"> <div${addAttribute(`h-full transition-all duration-500 ${progressColor}`, "class")}${addAttribute(`width: ${Math.min(100, Math.max(0, coveragePercentage))}%`, "style")}></div> </div> <div class="mt-3 flex justify-between text-xs text-slate-400 font-medium"> <span>0 inmuebles (0%)</span> <span>Quórum ordinario (50% + 1)</span> <span>Meta total: 52 inmuebles (100%)</span> </div> </div> <!-- Tabs Navigation --> <div class="mb-6 border-b border-slate-200"> <div class="flex gap-4"> <button type="button" id="tab-btn-confirmed" class="tab-btn border-b-2 border-emerald-600 pb-3 px-2 text-sm font-bold text-emerald-700 transition">
Inmuebles Confirmados (${confirmedCount})
</button> <button type="button" id="tab-btn-pending" class="tab-btn border-b-2 border-transparent pb-3 px-2 text-sm font-semibold text-slate-500 hover:text-slate-800 transition">
Inmuebles Pendientes (${missingCount})
</button> </div> </div> <!-- Section 1: Confirmed Properties (CensusTable) --> <div id="section-confirmed" class="tab-content"> ${renderComponent($$result2, "CensusTable", $$CensusTable, { "records": confirmedTableRows, "emptyMessage": "A\xFAn no se registran lecturas confirmadas para este comunicado." })} </div> <!-- Section 2: Pending Properties --> <div id="section-pending" class="tab-content hidden"> <!-- Missing grouped by Manzana summary cards --> <div class="mb-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3"> ${blocks.map((block) => renderTemplate`<div class="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"> <h3 class="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center justify-between"> <span>${block}</span> <span class="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] text-amber-800 font-bold"> ${missingByBlock[block].length} faltan
</span> </h3> <div class="flex flex-wrap gap-1"> ${missingByBlock[block].map((lot) => renderTemplate`<span class="rounded bg-slate-100 px-2 py-0.5 text-xs text-slate-700 font-medium"> ${lot} </span>`)} </div> </div>`)} </div> <!-- Pending Census Table --> ${renderComponent($$result2, "CensusTable", $$CensusTable, { "records": pendingTableRows, "emptyMessage": "\xA1Excelente! Todos los inmuebles del padr\xF3n han confirmado la lectura." })} </div> </div>  ${renderComponent($$result2, "WhatsAppReminderModal", $$WhatsAppReminderModal, { "announcementTitle": announcement.title, "announcementUrl": announcementPublicUrl, "reminderText": reminderText, "whatsappUrl": whatsappUrl, "missingCount": missingCount, "confirmedCount": confirmedCount, "coveragePercent": coveragePercentInt })} ` })} `;
}, "D:/COMUNICADOS-LAURELES/src/pages/admin/lecturas/[id].astro", void 0);

const $$file = "D:/COMUNICADOS-LAURELES/src/pages/admin/lecturas/[id].astro";
const $$url = "/admin/lecturas/[id]";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$id,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };

/* empty css                                     */
import { c as createComponent, m as maybeRenderHead, a as addAttribute, r as renderTemplate, b as createAstro, d as renderComponent, u as unescapeHTML } from '../../chunks/astro/server_DopID9XI.mjs';
import 'kleur/colors';
import { $ as $$BaseLayout, a as $$EmergencyHeader } from '../../chunks/EmergencyHeader_CpKHUMGg.mjs';
import 'clsx';
import { g as getDb } from '../../chunks/db_D9z2L-6S.mjs';
export { renderers } from '../../renderers.mjs';

const $$Astro$2 = createAstro();
const $$QuorumProgressBar = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$2, $$props, $$slots);
  Astro2.self = $$QuorumProgressBar;
  const {
    confirmedCount = 0,
    totalCensus = 52,
    percentage: initialPercentage,
    tier: initialTier,
    tierLabel: initialTierLabel
  } = Astro2.props;
  const rawPercentage = totalCensus > 0 ? confirmedCount / totalCensus * 100 : 0;
  const percentage = initialPercentage !== void 0 ? initialPercentage : Math.round(rawPercentage * 10) / 10;
  let tier = initialTier;
  let tierLabel = initialTierLabel;
  if (!tier || !tierLabel) {
    if (percentage >= 70) {
      tier = "high";
      tierLabel = "Qu\xF3rum reglamentario alcanzado";
    } else if (percentage >= 35) {
      tier = "moderate";
      tierLabel = "En proceso de notificaci\xF3n";
    } else {
      tier = "low";
      tierLabel = "Bajo qu\xF3rum";
    }
  }
  const tierStyles = {
    high: {
      bar: "bg-emerald-600",
      badge: "bg-emerald-100 text-emerald-800 border-emerald-300",
      text: "text-emerald-700"
    },
    moderate: {
      bar: "bg-blue-600",
      badge: "bg-blue-100 text-blue-800 border-blue-300",
      text: "text-blue-700"
    },
    low: {
      bar: "bg-amber-500",
      badge: "bg-amber-100 text-amber-800 border-amber-300",
      text: "text-amber-700"
    }
  };
  const currentTierStyle = tierStyles[tier] || tierStyles.low;
  const pendingCount = Math.max(0, totalCensus - confirmedCount);
  return renderTemplate`${maybeRenderHead()}<div id="quorum-progress-card" class="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 my-6"> <!-- Card Header --> <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4"> <div> <span class="text-xs font-bold uppercase tracking-wider text-slate-400">Seguimiento Comunitario</span> <h4 class="text-base font-bold text-slate-900 flex items-center gap-2"> <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-emerald-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"> <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path> <circle cx="9" cy="7" r="4"></circle> <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path> <path d="M16 3.13a4 4 0 0 1 0 7.75"></path> </svg>
Quórum de Lectura y Notificación
</h4> </div> <!-- Tier Badge --> <div> <span id="quorum-tier-badge"${addAttribute(`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border ${currentTierStyle.badge}`, "class")}> ${tierLabel} </span> </div> </div> <!-- Dynamic Progress Bar --> <div class="relative w-full bg-slate-100 rounded-full h-4 overflow-hidden mb-3 border border-slate-200"> <div id="quorum-bar"${addAttribute(`h-full rounded-full transition-all duration-500 ease-out ${currentTierStyle.bar}`, "class")}${addAttribute(`width: ${Math.min(100, Math.max(0, percentage))}%`, "style")}></div> </div> <!-- Dynamic Label & Metrics Grid --> <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-600"> <p id="quorum-summary-label" class="font-medium text-slate-800"> <strong id="quorum-confirmed-text" class="text-slate-900 font-bold">${confirmedCount}</strong> de ${totalCensus} inmuebles han confirmado (<span id="quorum-percent-text" class="font-bold text-emerald-700">${percentage}%</span>)
</p> <div class="flex items-center gap-4 text-[11px] text-slate-500"> <span class="flex items-center gap-1"> <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
Confirmados: <strong id="quorum-confirmed-metric">${confirmedCount}</strong> </span> <span class="flex items-center gap-1"> <span class="w-2 h-2 rounded-full bg-slate-300"></span>
Pendientes: <strong id="quorum-pending-metric">${pendingCount}</strong> </span> </div> </div> <!-- Statutory Quorum Note --> <div class="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400"> <span>Estatuto Vecinal: Quórum formal 50% + 1 (27 inmuebles)</span> <span>Total padrón: ${totalCensus} casas</span> </div> </div>`;
}, "D:/COMUNICADOS-LAURELES/src/components/QuorumProgressBar.astro", void 0);

const $$Astro$1 = createAstro();
const $$ReadConfirmationBox = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$1, $$props, $$slots);
  Astro2.self = $$ReadConfirmationBox;
  const { announcementId } = Astro2.props;
  return renderTemplate`${maybeRenderHead()}<div class="bg-gradient-to-br from-slate-50 to-emerald-50/40 rounded-2xl p-6 sm:p-8 shadow-sm border border-emerald-200/80 my-8"> <div class="max-w-2xl mx-auto"> <!-- Header --> <div class="text-center mb-6"> <div class="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-emerald-600 text-white shadow-md shadow-emerald-600/20 mb-3"> <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"> <path d="M9 11l3 3L22 4"></path> <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path> </svg> </div> <h3 class="text-xl font-bold text-slate-900">Registro de Confirmación de Lectura</h3> <p class="text-sm text-slate-600 mt-1">
Cada inmueble de la urbanización debe confirmar la recepción y toma de conocimiento de este comunicado oficial.
</p> </div> <!-- Alert Container for Dynamic Feedback --> <div id="confirmation-feedback" class="hidden mb-6 rounded-xl p-4 text-sm transition-all"> <div class="flex items-start gap-3"> <div id="feedback-icon" class="flex-shrink-0 mt-0.5"></div> <div class="flex-1"> <h4 id="feedback-title" class="font-bold text-sm"></h4> <p id="feedback-message" class="mt-1 text-xs leading-relaxed"></p> </div> </div> </div> <!-- Confirmation Form --> <form id="read-confirmation-form" class="space-y-4"${addAttribute(announcementId, "data-announcement-id")}> <!-- Step 1: Manzana & Lote Picker --> <div class="grid grid-cols-1 sm:grid-cols-2 gap-4"> <div> <label for="select-manzana" class="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
1. Manzana <span class="text-rose-500">*</span> </label> <select id="select-manzana" name="manzana" required class="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"> <option value="">Seleccione Manzana...</option> <option value="Mz. A">Mz. A (Calle Los Rosales)</option> <option value="Mz. B">Mz. B (Calle Los Álamos)</option> <option value="Mz. C">Mz. C (Jirón Las Acacias)</option> <option value="Mz. D">Mz. D (Pasaje Los Cipreses)</option> <option value="Mz. E">Mz. E (Av. Los Laureles)</option> </select> </div> <div> <label for="select-lote" class="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
2. Lote / Inmueble <span class="text-rose-500">*</span> </label> <select id="select-lote" name="propertyId" required disabled class="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-slate-50 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 disabled:opacity-60 disabled:cursor-not-allowed"> <option value="">Primero elija Manzana...</option> </select> </div> </div> <!-- Address preview --> <div id="property-address-box" class="hidden px-3.5 py-2 rounded-lg bg-emerald-50/60 border border-emerald-200 text-xs text-emerald-900"> <span class="font-semibold">Dirección registrada:</span> <span id="property-address-text"></span> </div> <!-- Step 2: Resident Name --> <div> <label for="input-resident-name" class="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
3. Nombre Completo del Residente <span class="text-rose-500">*</span> </label> <input id="input-resident-name" type="text" name="residentName" required minlength="3" maxlength="150" placeholder="Ej. Carlos Alberto Mendoza Silva" class="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 placeholder:text-slate-400"> <span class="block text-[11px] text-slate-500 mt-1">Mínimo 3 caracteres. Ingrese nombres y apellidos de quien confirma.</span> </div> <!-- Step 3: Role Picker --> <div> <label class="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
4. Condición en el Inmueble <span class="text-rose-500">*</span> </label> <div class="grid grid-cols-2 gap-3"> <label class="relative flex items-center gap-3 p-3 rounded-xl border border-slate-200 bg-white hover:border-emerald-400 cursor-pointer transition-colors has-[:checked]:border-emerald-600 has-[:checked]:bg-emerald-50/30"> <input type="radio" name="role" value="Propietario" checked class="w-4 h-4 text-emerald-600 focus:ring-emerald-500"> <div> <span class="block text-sm font-semibold text-slate-900">Propietario</span> <span class="block text-[11px] text-slate-500">Titular del predio</span> </div> </label> <label class="relative flex items-center gap-3 p-3 rounded-xl border border-slate-200 bg-white hover:border-emerald-400 cursor-pointer transition-colors has-[:checked]:border-emerald-600 has-[:checked]:bg-emerald-50/30"> <input type="radio" name="role" value="Inquilino" class="w-4 h-4 text-emerald-600 focus:ring-emerald-500"> <div> <span class="block text-sm font-semibold text-slate-900">Inquilino</span> <span class="block text-[11px] text-slate-500">Arrendatario residente</span> </div> </label> </div> </div> <!-- Legal Declaration --> <div class="pt-2"> <p class="text-[11px] text-slate-500 leading-relaxed italic">
* Al presionar el botón inferior, declara bajo responsabilidad comunitaria ser habitante o propietario del inmueble indicado y dar por notificado el presente comunicado.
</p> </div> <!-- Submit Button --> <div class="pt-2"> <button id="btn-submit-confirmation" type="submit" class="w-full inline-flex items-center justify-center gap-2 py-3 px-6 rounded-xl bg-emerald-700 hover:bg-emerald-800 active:bg-emerald-900 text-white font-bold text-sm shadow-md shadow-emerald-700/20 hover:scale-[1.01] transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed"> <svg id="btn-spinner" class="hidden animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"> <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle> <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path> </svg> <span id="btn-text">Confirmar Lectura de Inmueble</span> </button> </div> </form> </div> </div> `;
}, "D:/COMUNICADOS-LAURELES/src/components/ReadConfirmationBox.astro", void 0);

const $$Astro = createAstro();
const prerender = false;
const $$slug = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$slug;
  const { slug } = Astro2.params;
  if (!slug) {
    return Astro2.redirect("/");
  }
  const db = getDb();
  const announcement = db.prepare("SELECT * FROM announcements WHERE slug = ?").get(slug);
  if (!announcement) {
    return Astro2.redirect("/");
  }
  db.prepare("UPDATE announcements SET visit_count = visit_count + 1 WHERE id = ?").run(announcement.id);
  announcement.visit_count = (announcement.visit_count || 0) + 1;
  const readsCountRow = db.prepare("SELECT COUNT(*) as count FROM read_confirmations WHERE announcement_id = ?").get(announcement.id);
  const confirmedCount = readsCountRow ? readsCountRow.count : 0;
  const censusCountRow = db.prepare("SELECT COUNT(*) as count FROM census_properties WHERE is_active = 1").get();
  const totalCensus = censusCountRow ? censusCountRow.count : 52;
  const rawPercentage = totalCensus > 0 ? confirmedCount / totalCensus * 100 : 0;
  const percentage = Math.round(rawPercentage * 10) / 10;
  let tier = "low";
  let tierLabel = "Bajo qu\xF3rum";
  if (percentage >= 70) {
    tier = "high";
    tierLabel = "Qu\xF3rum reglamentario alcanzado";
  } else if (percentage >= 35) {
    tier = "moderate";
    tierLabel = "En proceso de notificaci\xF3n";
  }
  const pubDate = new Date(announcement.created_at);
  const formattedPubDate = !isNaN(pubDate.getTime()) ? pubDate.toLocaleDateString("es-PE", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric"
  }) : announcement.created_at;
  let formattedDeadline = null;
  if (announcement.deadline_date) {
    const dDate = new Date(announcement.deadline_date);
    formattedDeadline = !isNaN(dDate.getTime()) ? dDate.toLocaleDateString("es-PE", {
      day: "numeric",
      month: "long",
      year: "numeric"
    }) : announcement.deadline_date;
  }
  const categoryStyles = {
    "Urgente / Alertas": "bg-red-100 text-red-800 border-red-200",
    "Mantenimiento": "bg-amber-100 text-amber-800 border-amber-200",
    "Convocatorias de Asamblea": "bg-blue-100 text-blue-800 border-blue-200",
    "Normas de Convivencia": "bg-emerald-100 text-emerald-800 border-emerald-200",
    "Finanzas / Cuotas": "bg-purple-100 text-purple-800 border-purple-200"
  };
  const catBadgeClass = categoryStyles[announcement.category] || "bg-slate-100 text-slate-800 border-slate-200";
  function formatContent(content) {
    if (!content) return "";
    let html = content.replace(/^### (.*$)/gim, '<h3 class="text-lg font-bold text-slate-900 mt-6 mb-2">$1</h3>').replace(/^## (.*$)/gim, '<h2 class="text-xl font-bold text-slate-900 mt-8 mb-3">$1</h2>').replace(/^# (.*$)/gim, '<h1 class="text-2xl font-bold text-slate-900 mt-4 mb-4">$1</h1>');
    html = html.replace(/^\> (.*$)/gim, '<blockquote class="border-l-4 border-emerald-500 bg-emerald-50/50 p-4 rounded-r-xl my-4 text-emerald-900 text-sm italic">$1</blockquote>');
    html = html.replace(/^\- (.*$)/gim, '<li class="ml-4 list-disc text-slate-700 my-1">$1</li>');
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-slate-900">$1</strong>').replace(/\*(.*?)\*/g, '<em class="italic">$1</em>');
    const paragraphs = html.split(/\n\n+/);
    return paragraphs.map((p) => {
      p = p.trim();
      if (!p) return "";
      if (p.startsWith("<h") || p.startsWith("<blockquote") || p.startsWith("<li")) {
        return p;
      }
      return `<p class="text-slate-700 leading-relaxed my-3">${p}</p>`;
    }).join("");
  }
  const renderedContent = formatContent(announcement.content);
  const pageUrl = Astro2.url.href;
  const shareText = `\u{1F4E2} *URBANIZACI\xD3N LOS LAURELES \u2014 COMUNICADO OFICIAL*
*Asunto:* ${announcement.title}

Por favor revise y confirme la lectura de su inmueble aqu\xED:
${pageUrl}`;
  const whatsappShareUrl = `https://wa.me/?text=${encodeURIComponent(shareText)}`;
  return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, { "title": `${announcement.title} \u2014 Urbanizaci\xF3n Los Laureles`, "description": announcement.summary }, { "default": ($$result2) => renderTemplate` ${renderComponent($$result2, "EmergencyHeader", $$EmergencyHeader, {})}  ${maybeRenderHead()}<div class="bg-white border-b border-slate-200"> <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-3"> <nav class="flex items-center gap-2 text-xs font-medium text-slate-500"> <a href="/" class="hover:text-emerald-700 transition-colors">Inicio</a> <span>/</span> <a href="/" class="hover:text-emerald-700 transition-colors">Comunicados</a> <span>/</span> <span class="text-slate-900 truncate max-w-xs">${announcement.title}</span> </nav> </div> </div> <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10"> <!-- Announcement Header Article --> <article class="bg-white rounded-2xl p-6 sm:p-10 shadow-sm border border-slate-200"> <!-- Badges Row --> <div class="flex flex-wrap items-center gap-2.5 mb-4"> ${announcement.pinned === 1 && renderTemplate`<span class="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-900 border border-emerald-300"> <svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5 text-emerald-700" viewBox="0 0 24 24" fill="currentColor"> <path d="M16 12V4h1V2H7v2h1v8l-2 2v2h5.2v6h1.6v-6H18v-2l-2-2z"></path> </svg>
Fijado Prioritario
</span>`} ${announcement.is_urgent === 1 && renderTemplate`<span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-300 animate-pulse"> <span class="relative flex h-2 w-2"> <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span> <span class="relative inline-flex rounded-full h-2 w-2 bg-rose-600"></span> </span>
Urgente / Alerta
</span>`} <span${addAttribute(`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${catBadgeClass}`, "class")}> ${announcement.category} </span> <span class="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
Dirigido a: <strong class="ml-1 font-semibold">${announcement.audience}</strong> </span> </div> <!-- Main Title --> <h1 class="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 leading-tight mb-4"> ${announcement.title} </h1> <!-- Metadata Line --> <div class="flex flex-wrap items-center gap-4 text-xs text-slate-500 pb-6 border-b border-slate-100"> <span class="flex items-center gap-1.5"> <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"> <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect> <line x1="16" y1="2" x2="16" y2="6"></line> <line x1="8" y1="2" x2="8" y2="6"></line> <line x1="3" y1="10" x2="21" y2="10"></line> </svg>
Publicado el ${formattedPubDate} </span> <span class="flex items-center gap-1.5"> <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"> <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path> <circle cx="12" cy="12" r="3"></circle> </svg> ${announcement.visit_count} visitas
</span> <!-- WhatsApp Share Button --> <a${addAttribute(whatsappShareUrl, "href")} target="_blank" rel="noopener noreferrer" class="ml-auto inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 font-semibold transition-colors" title="Compartir comunicado por WhatsApp vecinal"> <svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5 text-emerald-600" fill="currentColor" viewBox="0 0 24 24"> <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981z"></path> </svg>
Compartir en grupo vecinal
</a> </div> <!-- Deadline Notice Banner if Applicable --> ${formattedDeadline && renderTemplate`<div class="my-6 rounded-xl bg-orange-50 border border-orange-200 p-4 flex items-center gap-3 text-orange-950"> <div class="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center flex-shrink-0 text-orange-700"> <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"> <circle cx="12" cy="12" r="10"></circle> <polyline points="12 6 12 12 16 14"></polyline> </svg> </div> <div> <span class="block text-xs font-bold uppercase tracking-wider text-orange-800">Fecha Límite / Convocatoria</span> <span class="block text-sm font-semibold">${formattedDeadline}</span> </div> </div>`} <!-- Summary Lead Callout --> <div class="my-6 p-4 rounded-xl bg-slate-50 border-l-4 border-emerald-600 text-slate-800 font-medium text-base leading-relaxed"> ${announcement.summary} </div> <!-- Rich Formatted Body Content --> <div class="prose max-w-none text-slate-700 text-base leading-relaxed">${unescapeHTML(renderedContent)}</div> </article> <!-- Milestone 3: Quorum Progress Bar Component (R2) --> ${renderComponent($$result2, "QuorumProgressBar", $$QuorumProgressBar, { "confirmedCount": confirmedCount, "totalCensus": totalCensus, "percentage": percentage, "tier": tier, "tierLabel": tierLabel })} <!-- Milestone 3: Read Confirmation Box Component (R2) --> ${renderComponent($$result2, "ReadConfirmationBox", $$ReadConfirmationBox, { "announcementId": announcement.id })} <!-- Navigation Back Link --> <div class="mt-8 text-center"> <a href="/" class="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 shadow-sm transition-all"> <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"> <path d="M19 12H5M12 19l-7-7 7-7"></path> </svg>
Volver al tablón de comunicados
</a> </div> </div> ` })}`;
}, "D:/COMUNICADOS-LAURELES/src/pages/comunicados/[slug].astro", void 0);

const $$file = "D:/COMUNICADOS-LAURELES/src/pages/comunicados/[slug].astro";
const $$url = "/comunicados/[slug]";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$slug,
  file: $$file,
  prerender,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };

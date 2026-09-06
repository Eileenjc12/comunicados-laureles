/* empty css                                  */
import { c as createComponent, m as maybeRenderHead, a as addAttribute, r as renderTemplate, b as createAstro, d as renderComponent } from '../chunks/astro/server_DopID9XI.mjs';
import 'kleur/colors';
import { $ as $$BaseLayout, a as $$EmergencyHeader } from '../chunks/EmergencyHeader_CpKHUMGg.mjs';
import 'clsx';
import { g as getDb } from '../chunks/db_D9z2L-6S.mjs';
export { renderers } from '../renderers.mjs';

const $$Astro = createAstro();
const $$AnnouncementCard = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$AnnouncementCard;
  const { announcement } = Astro2.props;
  const categoryStyles = {
    "Urgente / Alertas": {
      badge: "bg-red-50 text-red-800 border-red-200 ring-red-600/10",
      dot: "bg-red-500"
    },
    "Mantenimiento": {
      badge: "bg-amber-50 text-amber-800 border-amber-200 ring-amber-600/10",
      dot: "bg-amber-500"
    },
    "Convocatorias de Asamblea": {
      badge: "bg-blue-50 text-blue-800 border-blue-200 ring-blue-600/10",
      dot: "bg-blue-500"
    },
    "Normas de Convivencia": {
      badge: "bg-emerald-50 text-emerald-800 border-emerald-200 ring-emerald-600/10",
      dot: "bg-emerald-500"
    },
    "Finanzas / Cuotas": {
      badge: "bg-purple-50 text-purple-800 border-purple-200 ring-purple-600/10",
      dot: "bg-purple-500"
    }
  };
  const currentCatStyle = categoryStyles[announcement.category] || {
    badge: "bg-slate-100 text-slate-800 border-slate-200 ring-slate-600/10",
    dot: "bg-slate-500"
  };
  const audienceStyles = {
    "General": "bg-slate-100 text-slate-700 border-slate-200",
    "Solo Propietarios": "bg-indigo-50 text-indigo-700 border-indigo-200",
    "Solo Inquilinos": "bg-teal-50 text-teal-700 border-teal-200"
  };
  const currentAudienceStyle = audienceStyles[announcement.audience] || "bg-slate-100 text-slate-700 border-slate-200";
  const pubDate = new Date(announcement.created_at);
  const formattedDate = !isNaN(pubDate.getTime()) ? pubDate.toLocaleDateString("es-PE", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  }) : announcement.created_at;
  let formattedDeadline = null;
  if (announcement.deadline_date) {
    const deadline = new Date(announcement.deadline_date);
    formattedDeadline = !isNaN(deadline.getTime()) ? deadline.toLocaleDateString("es-PE", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    }) : announcement.deadline_date;
  }
  const searchCorpus = `${announcement.title} ${announcement.summary} ${announcement.category}`.toLowerCase();
  return renderTemplate`${maybeRenderHead()}<article${addAttribute(`announcement-card relative flex flex-col justify-between rounded-2xl bg-white p-6 shadow-sm border transition-all duration-200 hover:shadow-md hover:border-emerald-300 group ${announcement.pinned ? "border-emerald-400/80 ring-1 ring-emerald-400/30" : "border-slate-200"}`, "class")}${addAttribute(announcement.category, "data-category")}${addAttribute(announcement.audience, "data-audience")}${addAttribute(searchCorpus, "data-search")}${addAttribute(announcement.created_at, "data-date")}${addAttribute(announcement.pinned ? "1" : "0", "data-pinned")}> <div> <!-- Top Metadata Row: Pinned, Urgency, Category, Audience --> <div class="flex flex-wrap items-center gap-2 mb-3"> ${announcement.pinned === 1 && renderTemplate`<span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-900 border border-emerald-300"> <svg xmlns="http://www.w3.org/2000/svg" class="w-3 h-3 text-emerald-700" viewBox="0 0 24 24" fill="currentColor"> <path d="M16 12V4h1V2H7v2h1v8l-2 2v2h5.2v6h1.6v-6H18v-2l-2-2z"></path> </svg>
Fijado
</span>`} ${announcement.is_urgent === 1 && renderTemplate`<span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-300 animate-pulse"> <span class="relative flex h-2 w-2"> <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span> <span class="relative inline-flex rounded-full h-2 w-2 bg-rose-600"></span> </span>
Urgente
</span>`} <span${addAttribute(`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${currentCatStyle.badge}`, "class")}> <span${addAttribute(`w-1.5 h-1.5 rounded-full ${currentCatStyle.dot}`, "class")}></span> ${announcement.category} </span> <span${addAttribute(`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium border ${currentAudienceStyle}`, "class")}> ${announcement.audience} </span> </div> <!-- Title & Summary --> <h3 class="text-lg font-bold text-slate-900 group-hover:text-emerald-700 transition-colors leading-snug mb-2"> <a${addAttribute(`/comunicados/${announcement.slug}`, "href")} class="focus:outline-none focus:underline"> ${announcement.title} </a> </h3> <p class="text-sm text-slate-600 line-clamp-3 leading-relaxed mb-4"> ${announcement.summary} </p> <!-- Deadline Banner if Set --> ${formattedDeadline && renderTemplate`<div class="mb-4 inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-orange-50 border border-orange-200 text-xs font-medium text-orange-800"> <svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5 text-orange-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"> <circle cx="12" cy="12" r="10"></circle> <polyline points="12 6 12 12 16 14"></polyline> </svg> <span>Fecha Límite / Asamblea: <strong>${formattedDeadline}</strong></span> </div>`} </div> <!-- Card Footer: Metrics & Action Link --> <div class="pt-4 mt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500"> <div class="flex items-center gap-3"> <!-- Date --> <span class="flex items-center gap-1" title="Fecha de publicación"> <svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"> <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect> <line x1="16" y1="2" x2="16" y2="6"></line> <line x1="8" y1="2" x2="8" y2="6"></line> <line x1="3" y1="10" x2="21" y2="10"></line> </svg> ${formattedDate} </span> <!-- Visit Count --> <span class="flex items-center gap-1" title="Visitas registradas"> <svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"> <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path> <circle cx="12" cy="12" r="3"></circle> </svg> ${announcement.visit_count} vistas
</span> </div> <!-- Read CTA Button --> <a${addAttribute(`/comunicados/${announcement.slug}`, "href")} class="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 group-hover:text-emerald-800 group-hover:translate-x-0.5 transition-all">
Leer y confirmar
<svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"> <path d="M5 12h14M12 5l7 7-7 7"></path> </svg> </a> </div> </article>`;
}, "D:/COMUNICADOS-LAURELES/src/components/AnnouncementCard.astro", void 0);

const $$AnnouncementFilters = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${maybeRenderHead()}<div class="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 mb-8"> <div class="space-y-4"> <!-- Top Row: Real-time Search Input & Date Picker --> <div class="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between"> <!-- Search Bar --> <div class="relative flex-1"> <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400"> <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"> <circle cx="11" cy="11" r="8"></circle> <line x1="21" y1="21" x2="16.65" y2="16.65"></line> </svg> </div> <input id="filter-search-input" type="search" placeholder="Buscar comunicados por palabra clave (ej. cisterna, asamblea, mascotas)..." class="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors placeholder:text-slate-400"> </div> <!-- Date Filter & Reset --> <div class="flex items-center gap-2"> <div class="relative"> <input id="filter-date-input" type="date" title="Filtrar por fecha de publicación" class="px-3 py-2 rounded-xl border border-slate-300 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"> </div> <button id="filter-reset-btn" type="button" class="px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-colors whitespace-nowrap" title="Restablecer todos los filtros">
Limpiar filtros
</button> </div> </div> <!-- Audience Segment Filter Tabs --> <div class="pt-2 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3"> <div> <span class="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Audiencia destinataria</span> <div id="audience-pills" class="flex flex-wrap gap-1.5"> <button type="button" data-audience="Todos" class="filter-audience-btn active px-3 py-1 rounded-lg text-xs font-semibold transition-all bg-emerald-700 text-white shadow-sm">
Todos
</button> <button type="button" data-audience="General" class="filter-audience-btn px-3 py-1 rounded-lg text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 transition-all">
General
</button> <button type="button" data-audience="Solo Propietarios" class="filter-audience-btn px-3 py-1 rounded-lg text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 transition-all">
Solo Propietarios
</button> <button type="button" data-audience="Solo Inquilinos" class="filter-audience-btn px-3 py-1 rounded-lg text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 transition-all">
Solo Inquilinos
</button> </div> </div> <!-- Result Counter --> <div class="text-right self-end sm:self-center"> <span id="filter-results-count" class="text-xs font-medium text-slate-500">
Cargando comunicados...
</span> </div> </div> <!-- Category Pills Row --> <div class="pt-2 border-t border-slate-100"> <span class="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Categoría institucional</span> <div id="category-pills" class="flex flex-wrap gap-1.5"> <button type="button" data-category="Todos" class="filter-category-btn active px-3 py-1.5 rounded-full text-xs font-semibold transition-all bg-emerald-800 text-white shadow-sm">
Todas las categorías
</button> <button type="button" data-category="Urgente / Alertas" class="filter-category-btn px-3 py-1.5 rounded-full text-xs font-medium text-red-800 bg-red-50 hover:bg-red-100 border border-red-200 transition-all">
🚨 Urgente / Alertas
</button> <button type="button" data-category="Mantenimiento" class="filter-category-btn px-3 py-1.5 rounded-full text-xs font-medium text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200 transition-all">
🔧 Mantenimiento
</button> <button type="button" data-category="Convocatorias de Asamblea" class="filter-category-btn px-3 py-1.5 rounded-full text-xs font-medium text-blue-800 bg-blue-50 hover:bg-blue-100 border border-blue-200 transition-all">
🗳️ Convocatorias de Asamblea
</button> <button type="button" data-category="Normas de Convivencia" class="filter-category-btn px-3 py-1.5 rounded-full text-xs font-medium text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-all">
📋 Normas de Convivencia
</button> <button type="button" data-category="Finanzas / Cuotas" class="filter-category-btn px-3 py-1.5 rounded-full text-xs font-medium text-purple-800 bg-purple-50 hover:bg-purple-100 border border-purple-200 transition-all">
💳 Finanzas / Cuotas
</button> </div> </div> </div> </div> `;
}, "D:/COMUNICADOS-LAURELES/src/components/AnnouncementFilters.astro", void 0);

const prerender = false;
const $$Index = createComponent(($$result, $$props, $$slots) => {
  const db = getDb();
  const announcements = db.prepare(`
  SELECT id, title, slug, summary, content, category, audience,
         is_urgent, deadline_date, pinned, archived, visit_count,
         created_at, updated_at
  FROM announcements
  WHERE archived = 0
  ORDER BY pinned DESC, is_urgent DESC, created_at DESC
`).all();
  const urgentCount = announcements.filter((a) => a.is_urgent === 1).length;
  const pinnedCount = announcements.filter((a) => a.pinned === 1).length;
  return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, { "title": "Urbanizaci\xF3n Los Laureles \u2014 Tabl\xF3n Oficial de Comunicados y Qu\xF3rum", "description": "Canal digital institucional para residentes y propietarios de Urbanizaci\xF3n Los Laureles. Comunicados oficiales, convocatorias de asamblea, qu\xF3rum y alertas de mantenimiento." }, { "default": ($$result2) => renderTemplate`  ${renderComponent($$result2, "EmergencyHeader", $$EmergencyHeader, {})}  ${maybeRenderHead()}<section class="bg-gradient-to-b from-emerald-900 via-emerald-800 to-teal-900 text-white py-12 px-4 sm:px-6 lg:px-8 shadow-inner"> <div class="max-w-7xl mx-auto"> <div class="max-w-3xl"> <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-700/60 border border-emerald-500/40 text-xs font-semibold text-emerald-200 mb-4 backdrop-blur"> <span class="w-2 h-2 rounded-full bg-emerald-400"></span>
Padrón Residencial Oficial: 52 Inmuebles
</div> <h1 class="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mb-3">
Tablón Oficial de Comunicados y Notificaciones
</h1> <p class="text-base sm:text-lg text-emerald-100/90 leading-relaxed mb-6">
Bienvenido al portal institucional de <strong>Urbanización Los Laureles</strong>. Consulte aquí los comunicados oficiales de la Junta Directiva, convocatorias de asamblea, reportes de mantenimiento y registre la confirmación de lectura de su inmueble.
</p> <!-- Stat Badges --> <div class="flex flex-wrap items-center gap-3 text-xs"> <div class="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/10 border border-white/20 backdrop-blur"> <span class="font-bold text-white text-sm">${announcements.length}</span> <span class="text-emerald-200">comunicados activos</span> </div> ${urgentCount > 0 && renderTemplate`<div class="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-rose-500/20 border border-rose-400/40 text-rose-200 backdrop-blur"> <span class="w-2 h-2 rounded-full bg-rose-400 animate-pulse"></span> <span class="font-bold text-white text-sm">${urgentCount}</span> <span>alertas urgentes</span> </div>`} ${pinnedCount > 0 && renderTemplate`<div class="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-600/30 border border-emerald-400/30 text-emerald-200 backdrop-blur"> <span class="font-bold text-white text-sm">${pinnedCount}</span> <span>fijados prioritarios</span> </div>`} </div> </div> </div> </section>  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10"> <!-- Interactive Filters Component (R1) --> ${renderComponent($$result2, "AnnouncementFilters", $$AnnouncementFilters, {})} <!-- Feed Section --> <section aria-label="Lista de comunicados institucionales"> <div id="announcements-grid" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"> ${announcements.map((announcement) => renderTemplate`${renderComponent($$result2, "AnnouncementCard", $$AnnouncementCard, { "announcement": announcement })}`)} </div> <!-- Empty State for Filters --> <div id="filter-no-results" class="hidden text-center py-16 px-4 bg-white rounded-2xl border border-slate-200 shadow-sm mt-4"> <div class="w-16 h-16 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-4"> <svg xmlns="http://www.w3.org/2000/svg" class="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"> <circle cx="11" cy="11" r="8"></circle> <line x1="21" y1="21" x2="16.65" y2="16.65"></line> </svg> </div> <h3 class="text-base font-bold text-slate-800">No se encontraron comunicados</h3> <p class="text-sm text-slate-500 max-w-md mx-auto mt-1">
No hay comunicados que coincidan con los criterios de búsqueda o filtros seleccionados. Intente limpiando los filtros.
</p> </div> </section> <!-- Community Directory Banner Shortcut (R3 Preview) --> <section class="mt-16 rounded-3xl bg-gradient-to-r from-emerald-800 to-teal-900 text-white p-8 shadow-md border border-emerald-700/50"> <div class="flex flex-col lg:flex-row items-center justify-between gap-6"> <div class="max-w-2xl"> <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-700/80 text-xs font-semibold text-emerald-200 mb-3"> <span>Comercio Vecinal</span> </div> <h2 class="text-2xl font-extrabold text-white mb-2">
Descubra el Mercado Laureles
</h2> <p class="text-sm text-emerald-100 leading-relaxed">
Directorio exclusivo de emprendimientos vecinales: gastronomía, servicios técnicos, gasfitería, electricidad y belleza en nuestra comunidad con contacto directo por WhatsApp.
</p> </div> <div class="flex-shrink-0"> <a href="/mercado" class="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-emerald-900 font-bold text-sm shadow-lg hover:bg-emerald-50 active:scale-95 transition-all">
Ver Catálogo Comercial
<svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"> <path d="M5 12h14M12 5l7 7-7 7"></path> </svg> </a> </div> </div> </section> </div> ` })}`;
}, "D:/COMUNICADOS-LAURELES/src/pages/index.astro", void 0);

const $$file = "D:/COMUNICADOS-LAURELES/src/pages/index.astro";
const $$url = "";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Index,
  file: $$file,
  prerender,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };

/* empty css                                  */
import { c as createComponent, m as maybeRenderHead, a as addAttribute, r as renderTemplate, b as createAstro, e as renderHead, d as renderComponent } from '../chunks/astro/server_DopID9XI.mjs';
import 'kleur/colors';
import { g as getDb } from '../chunks/db_D9z2L-6S.mjs';
import 'clsx';
/* empty css                                 */
export { renderers } from '../renderers.mjs';

function sanitizePhone(phone) {
  if (!phone || typeof phone !== "string") {
    throw new Error("El teléfono es obligatorio y debe ser un texto.");
  }
  const clean = phone.replace(/\D/g, "");
  if (!clean) {
    throw new Error("El número telefónico no contiene dígitos válidos.");
  }
  if (clean.length === 9 && clean.startsWith("9")) {
    return `51${clean}`;
  }
  return clean;
}
function formatDisplayPhone(phone) {
  if (!phone) return "";
  const clean = phone.replace(/\D/g, "");
  if (clean.length === 11 && clean.startsWith("519")) {
    return `+51 ${clean.slice(2, 5)} ${clean.slice(5, 8)} ${clean.slice(8)}`;
  }
  if (clean.length === 9 && clean.startsWith("9")) {
    return `+51 ${clean.slice(0, 3)} ${clean.slice(3, 6)} ${clean.slice(6)}`;
  }
  return phone;
}
function generateWhatsAppLink(phone, arg2, arg3, arg4) {
  const cleanPhone = sanitizePhone(phone);
  let message = "";
  if (arg4 !== void 0 && arg4 !== null) {
    const title = arg2;
    const name = arg3;
    const customTemplate = arg4;
    if (customTemplate && typeof customTemplate === "string" && customTemplate.trim().length > 0) {
      message = customTemplate.replace(/\{title\}/g, title).replace(/\{businessName\}/g, title).replace(/\{name\}/g, name).replace(/\{entrepreneur_name\}/g, name);
    } else {
      message = `¡Hola ${name}! Vi tu emprendimiento "${title}" en el Mercado Laureles. Quisiera consultar sobre tus productos y servicios.`;
    }
  } else if (arg3 !== void 0 && arg3 !== null) {
    const rawArg2 = arg2;
    if (/\{title\}|\{businessName\}|\{name\}|\{entrepreneur_name\}/i.test(rawArg2)) {
      message = rawArg2.replace(/\{title\}/g, arg3).replace(/\{businessName\}/g, arg3).replace(/\{name\}/g, arg3).replace(/\{entrepreneur_name\}/g, arg3);
    } else if (rawArg2.startsWith("¡Hola") || rawArg2.startsWith("Hola") || rawArg2.length > 50) {
      message = rawArg2;
      if (!message.includes(arg3)) {
        message = `${rawArg2} (${arg3})`;
      }
    } else {
      const title = rawArg2;
      const name = arg3;
      message = `¡Hola ${name}! Vi tu emprendimiento "${title}" en el Mercado Laureles. Quisiera consultar sobre tus productos y servicios.`;
    }
  } else {
    message = arg2;
  }
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message.trim())}`;
}

const $$Astro$2 = createAstro();
const $$MarketplaceCard = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$2, $$props, $$slots);
  Astro2.self = $$MarketplaceCard;
  const props = Astro2.props;
  const item = props.listing || props;
  item.id;
  const title = item.title || "Emprendimiento Vecinal";
  const description = item.description || "";
  const category = item.category || "Otros";
  const entrepreneurName = item.entrepreneur_name || item.entrepreneurName || "Vecino(a)";
  const propertyAddress = item.property_address || item.propertyAddress || "Los Laureles";
  const phone = item.phone || "";
  const scheduleHours = item.schedule_hours || item.scheduleHours || "Consultar horario";
  const whatsappMessage = item.whatsapp_message || item.whatsappMessage || null;
  item.image_url || item.imageUrl || "";
  const whatsappUrl = generateWhatsAppLink(
    phone,
    title,
    entrepreneurName,
    whatsappMessage
  );
  const displayPhone = formatDisplayPhone(phone);
  const categoryStyles = {
    "Gastronom\xEDa / Comida": {
      bg: "bg-amber-50",
      text: "text-amber-800",
      border: "border-amber-200",
      icon: "\u{1F372}"
    },
    "Vestimenta / Ropa": {
      bg: "bg-purple-50",
      text: "text-purple-800",
      border: "border-purple-200",
      icon: "\u{1F457}"
    },
    "Servicios T\xE9cnicos": {
      bg: "bg-blue-50",
      text: "text-blue-800",
      border: "border-blue-200",
      icon: "\u{1F4BB}"
    },
    "Gasfiter\xEDa / Electricidad": {
      bg: "bg-orange-50",
      text: "text-orange-800",
      border: "border-orange-200",
      icon: "\u{1F527}"
    },
    "Belleza / Cuidado Personal": {
      bg: "bg-rose-50",
      text: "text-rose-800",
      border: "border-rose-200",
      icon: "\u{1F487}"
    },
    "Otros": {
      bg: "bg-emerald-50",
      text: "text-emerald-800",
      border: "border-emerald-200",
      icon: "\u{1F4E6}"
    }
  };
  const currentStyle = categoryStyles[category] || categoryStyles["Otros"];
  return renderTemplate`${maybeRenderHead()}<article class="marketplace-card bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between overflow-hidden group"${addAttribute(category, "data-category")}${addAttribute(title.toLowerCase(), "data-title")}${addAttribute(description.toLowerCase(), "data-description")}${addAttribute(entrepreneurName.toLowerCase(), "data-entrepreneur")}> <!-- Card Header & Badge --> <div class="p-6 pb-4"> <div class="flex items-start justify-between gap-3 mb-3"> <span${addAttribute(`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${currentStyle.bg} ${currentStyle.text} ${currentStyle.border}`, "class")}> <span>${currentStyle.icon}</span> <span>${category}</span> </span> <span class="text-xs text-gray-500 flex items-center gap-1 bg-gray-100 px-2.5 py-1 rounded-md font-medium"> <svg class="w-3.5 h-3.5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path> </svg> ${propertyAddress} </span> </div> <!-- Title --> <h3 class="text-xl font-bold text-gray-900 group-hover:text-laureles-700 transition-colors mb-2 leading-snug"> ${title} </h3> <!-- Entrepreneur Info --> <div class="flex items-center gap-2 text-sm text-gray-600 mb-3"> <div class="w-6 h-6 rounded-full bg-laureles-100 text-laureles-800 flex items-center justify-center font-bold text-xs"> ${entrepreneurName.charAt(0).toUpperCase()} </div> <span class="font-medium text-gray-800"> ${entrepreneurName} </span> </div> <!-- Description --> <p class="text-sm text-gray-600 leading-relaxed line-clamp-3 mb-4"> ${description} </p> <!-- Schedule Badge --> <div class="inline-flex items-center gap-2 text-xs text-gray-500 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100"> <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path> </svg> <span>${scheduleHours}</span> </div> </div> <!-- Card Action Footer --> <div class="p-6 pt-3 bg-gray-50/70 border-t border-gray-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3"> ${displayPhone && renderTemplate`<span class="text-xs text-gray-500 flex items-center gap-1 font-mono"> <svg class="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path> </svg> ${displayPhone} </span>`} <a${addAttribute(whatsappUrl, "href")} target="_blank" rel="noopener noreferrer" class="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#25D366] hover:bg-[#1ebd59] active:scale-[0.98] text-white text-sm font-semibold rounded-xl shadow-sm hover:shadow transition-all text-center"${addAttribute(`Contactar a ${title} por WhatsApp`, "aria-label")}> <!-- WhatsApp Logo SVG --> <svg class="w-4 h-4 fill-current" viewBox="0 0 24 24" aria-hidden="true"> <path d="M17.472 14.382c-.301-.15-1.78-.878-2.056-.979-.276-.1-.476-.15-.676.15-.2.3-.777.979-.952 1.18-.175.2-.351.226-.652.076-.3-.15-1.267-.467-2.414-1.489-.893-.796-1.496-1.78-1.671-2.08-.175-.301-.019-.464.132-.614.135-.135.301-.351.451-.527.15-.175.2-.301.3-.501.1-.2.05-.376-.025-.526-.075-.15-.676-1.63-927-2.232-.244-.585-.493-.506-.677-.515-.176-.008-.376-.01-.577-.01-.2 0-.526.075-.802.376-.276.3-1.053 1.029-1.053 2.509 0 1.48 1.078 2.909 1.229 3.109.15.2 2.122 3.24 5.141 4.544.718.31 1.279.496 1.716.635.722.23 1.378.197 1.9.119.58-.088 1.78-.727 2.03-1.43.25-.702.25-1.304.175-1.43-.075-.125-.276-.2-.576-.35zM12.04 2C6.516 2 2.028 6.488 2.028 12.012c0 1.986.58 3.842 1.583 5.409L2 22l4.743-1.547a9.96 9.96 0 005.297 1.559h.004c5.524 0 10.012-4.488 10.012-10.012C22.056 6.488 17.568 2 12.04 2z"></path> </svg> <span>Contactar por WhatsApp</span> </a> </div> </article>`;
}, "D:/COMUNICADOS-LAURELES/src/components/MarketplaceCard.astro", void 0);

const $$Astro$1 = createAstro();
const $$MarketplaceFilters = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$1, $$props, $$slots);
  Astro2.self = $$MarketplaceFilters;
  const { selectedCategory = "Todos", totalListings = 0 } = Astro2.props;
  const categories = [
    { label: "Todos", value: "Todos", icon: "\u{1F3EA}" },
    { label: "Gastronom\xEDa / Comida", value: "Gastronom\xEDa / Comida", icon: "\u{1F372}" },
    { label: "Vestimenta / Ropa", value: "Vestimenta / Ropa", icon: "\u{1F457}" },
    { label: "Servicios T\xE9cnicos", value: "Servicios T\xE9cnicos", icon: "\u{1F4BB}" },
    { label: "Gasfiter\xEDa / Electricidad", value: "Gasfiter\xEDa / Electricidad", icon: "\u{1F527}" },
    { label: "Belleza / Cuidado Personal", value: "Belleza / Cuidado Personal", icon: "\u{1F487}" },
    { label: "Otros", value: "Otros", icon: "\u{1F4E6}" }
  ];
  return renderTemplate`${maybeRenderHead()}<div class="w-full space-y-4 mb-8" data-astro-cid-6cs35q2s> <!-- Search Input Bar --> <div class="relative max-w-xl mx-auto" data-astro-cid-6cs35q2s> <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none" data-astro-cid-6cs35q2s> <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" data-astro-cid-6cs35q2s> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" data-astro-cid-6cs35q2s></path> </svg> </div> <input type="search" id="marketplace-search-input" placeholder="Buscar por negocio, servicio o vecino emprendedor..." class="w-full pl-11 pr-4 py-3 bg-white border border-gray-300 rounded-2xl shadow-sm placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-laureles-500 focus:border-laureles-500 text-sm transition-all" aria-label="Buscar emprendimientos" data-astro-cid-6cs35q2s> </div> <!-- Category Filter Pills (Horizontal scroll on mobile) --> <div class="flex items-center gap-2 overflow-x-auto pb-2 pt-1 px-1 no-scrollbar -mx-4 sm:mx-0 sm:justify-center" data-astro-cid-6cs35q2s> ${categories.map((cat) => {
    const isActive = cat.value.toLowerCase() === selectedCategory.toLowerCase();
    return renderTemplate`<button type="button"${addAttribute(cat.value, "data-category-filter")}${addAttribute(`marketplace-filter-btn whitespace-nowrap px-4 py-2 rounded-full text-xs font-semibold transition-all duration-150 border flex items-center gap-1.5 shadow-sm active:scale-95 ${isActive ? "bg-laureles-700 text-white border-laureles-700 shadow-laureles-100 ring-2 ring-laureles-600/20" : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50 hover:border-gray-300"}`, "class")} data-astro-cid-6cs35q2s> <span data-astro-cid-6cs35q2s>${cat.icon}</span> <span data-astro-cid-6cs35q2s>${cat.label}</span> </button>`;
  })} </div> <!-- Filter Feedback Status --> <div class="text-center text-xs text-gray-500 font-medium" id="marketplace-filter-status" data-astro-cid-6cs35q2s>
Mostrando todos los emprendimientos vecinales verificados
</div> </div>  `;
}, "D:/COMUNICADOS-LAURELES/src/components/MarketplaceFilters.astro", void 0);

const $$Astro = createAstro();
const $$Index = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Index;
  const db = getDb();
  const url = Astro2.url;
  const categoryFilter = url.searchParams.get("categoria") || url.searchParams.get("category") || "Todos";
  let sql = `
  SELECT * FROM marketplace_listings
  WHERE status = 'approved'
`;
  const params = [];
  if (categoryFilter !== "Todos") {
    sql += " AND LOWER(category) = LOWER(?)";
    params.push(categoryFilter);
  }
  sql += " ORDER BY id ASC";
  const approvedListings = db.prepare(sql).all(...params);
  return renderTemplate`<html lang="es"> <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Mercado Laureles: Directorio Comercial Vecinal | Urbanización Los Laureles</title><meta name="description" content="Directorio comercial vecinal de la Urbanización Los Laureles. Conoce y contrata los productos y servicios de tus vecinos con contacto directo por WhatsApp."><link rel="icon" type="image/svg+xml" href="/favicon.svg">${renderHead()}</head> <body class="bg-gray-50 text-gray-800 antialiased min-h-screen flex flex-col font-sans"> <!-- Top Navigation Header --> <header class="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-xs"> <div class="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between"> <a href="/" class="flex items-center gap-3 group"> <div class="w-10 h-10 rounded-xl bg-laureles-700 text-white flex items-center justify-center font-black text-lg shadow-sm group-hover:bg-laureles-800 transition-colors">
🌿
</div> <div> <span class="text-xs uppercase tracking-wider text-laureles-800 font-bold block leading-tight">Urbanización</span> <span class="text-lg font-extrabold text-gray-900 leading-tight">Los Laureles</span> </div> </a> <!-- Desktop & Mobile Nav Links --> <nav class="flex items-center gap-2 sm:gap-4"> <a href="/" class="px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-laureles-700 hover:bg-gray-100 rounded-lg transition-colors hidden sm:inline-block">
Comunicados
</a> <a href="/mercado" class="px-3 py-1.5 text-sm font-bold text-laureles-800 bg-laureles-50 rounded-lg transition-colors">
Mercado Laureles
</a> <a href="/mercado/postular" class="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-laureles-700 hover:bg-laureles-800 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-sm transition-all active:scale-95"> <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path> </svg> <span>Postular Negocio</span> </a> </nav> </div> </header> <!-- Main Content Area --> <main class="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-10"> <!-- Hero Banner Section --> <section class="text-center max-w-3xl mx-auto mb-8 sm:mb-12"> <div class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-laureles-100 text-laureles-800 text-xs font-bold mb-4"> <span>🏪</span> <span>Economía y Colaboración Vecinal</span> </div> <h1 class="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight leading-tight mb-4">
Mercado Laureles: Directorio Comercial Vecinal
</h1> <p class="text-base sm:text-lg text-gray-600 leading-relaxed mb-6">
Apoya y contrata el talento de nuestros propios vecinos. Encuentra comida casera, servicios técnicos, gasfitería, ropa, estética y más, con contacto directo y confiable por WhatsApp.
</p> <!-- Action CTA buttons --> <div class="flex flex-wrap items-center justify-center gap-3"> <a href="/mercado/postular" class="inline-flex items-center gap-2 px-6 py-3 bg-laureles-700 hover:bg-laureles-800 text-white font-semibold rounded-2xl shadow-sm hover:shadow transition-all active:scale-98 text-sm sm:text-base"> <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"></path> </svg> <span>Postular mi Emprendimiento</span> </a> <a href="#directorio" class="inline-flex items-center gap-2 px-5 py-3 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold rounded-2xl shadow-2xs transition-all text-sm sm:text-base"> <span>Explorar Directorio</span> <svg class="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path> </svg> </a> </div> </section> <!-- Search and Filter Controls --> <section id="directorio" class="scroll-mt-20"> ${renderComponent($$result, "MarketplaceFilters", $$MarketplaceFilters, { "selectedCategory": categoryFilter, "totalListings": approvedListings.length })} <!-- Listings Grid --> <div id="marketplace-grid" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"> ${approvedListings.map((listing) => renderTemplate`${renderComponent($$result, "MarketplaceCard", $$MarketplaceCard, { "listing": listing })}`)} </div> <!-- No Results Empty State Message --> <div id="marketplace-no-results"${addAttribute(`text-center py-16 px-4 bg-white rounded-3xl border border-dashed border-gray-300 max-w-lg mx-auto ${approvedListings.length === 0 ? "block" : "hidden"}`, "class")}> <div class="w-16 h-16 bg-gray-100 text-gray-400 rounded-2xl flex items-center justify-center mx-auto mb-4 text-2xl">
🔍
</div> <h2 class="text-lg font-bold text-gray-900 mb-2">No se encontraron emprendimientos</h2> <p class="text-sm text-gray-500 mb-6">
No hay publicaciones aprobadas en esta categoría o con este término de búsqueda. ¿Ofreces este producto o servicio en Los Laureles?
</p> <a href="/mercado/postular" class="inline-flex items-center gap-2 px-5 py-2.5 bg-laureles-700 hover:bg-laureles-800 text-white text-sm font-semibold rounded-xl shadow-sm transition-all"> <span>Postular mi Emprendimiento</span> </a> </div> </section> </main> <!-- Footer --> <footer class="bg-white border-t border-gray-200 mt-16 py-8 text-center text-xs text-gray-500"> <div class="max-w-6xl mx-auto px-4 space-y-2"> <p class="font-semibold text-gray-700">Urbanización Los Laureles — Portal Residencial Oficial</p> <p>Directorio comercial vecinal supervisado por la Junta Directiva y Administración.</p> <div class="pt-2 flex items-center justify-center gap-4 text-gray-400"> <a href="/" class="hover:text-gray-600">Comunicados</a> <span>•</span> <a href="/mercado" class="hover:text-gray-600">Mercado Laureles</a> <span>•</span> <a href="/mercado/postular" class="hover:text-gray-600">Postulación Vecinal</a> <span>•</span> <a href="/admin" class="hover:text-gray-600">Panel Administrativo</a> </div> </div> </footer> </body></html>`;
}, "D:/COMUNICADOS-LAURELES/src/pages/mercado/index.astro", void 0);

const $$file = "D:/COMUNICADOS-LAURELES/src/pages/mercado/index.astro";
const $$url = "/mercado";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Index,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };

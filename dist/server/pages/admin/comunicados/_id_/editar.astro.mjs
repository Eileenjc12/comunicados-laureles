/* empty css                                           */
import { c as createComponent, d as renderComponent, r as renderTemplate, b as createAstro, m as maybeRenderHead, a as addAttribute } from '../../../../chunks/astro/server_DopID9XI.mjs';
import 'kleur/colors';
import { $ as $$AdminLayout } from '../../../../chunks/AdminLayout_MrFSiBVT.mjs';
import { g as getDb } from '../../../../chunks/db_D9z2L-6S.mjs';
export { renderers } from '../../../../renderers.mjs';

const $$Astro = createAstro();
const $$Editar = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Editar;
  const id = Number(Astro2.params.id);
  if (isNaN(id)) {
    return Astro2.redirect("/admin");
  }
  const db = getDb();
  const announcement = db.prepare("SELECT * FROM announcements WHERE id = ?").get(id);
  if (!announcement) {
    return Astro2.redirect("/admin");
  }
  return renderTemplate`${renderComponent($$result, "AdminLayout", $$AdminLayout, { "title": `Editar: ${announcement.title}`, "activeSection": "comunicados" }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8"> <nav class="flex items-center gap-2 text-xs text-slate-500 mb-4"> <a href="/admin" class="hover:text-emerald-600 transition">Comunicados</a> <span>/</span> <span class="text-slate-800 font-medium truncate max-w-sm">${announcement.title}</span> <span>/</span> <span class="text-slate-600 font-semibold">Editar</span> </nav> <div class="rounded-2xl border border-slate-200 bg-white p-6 sm:p-10 shadow-sm"> <div class="border-b border-slate-200 pb-5 mb-6 flex items-center justify-between"> <div> <h1 class="text-2xl font-extrabold text-slate-900 tracking-tight">
Editar Comunicado Oficial
</h1> <p class="mt-1 text-xs text-slate-500">
Actualiza los datos del comunicado. Los cambios se reflejarán de inmediato en el portal de vecinos.
</p> </div> <a${addAttribute(`/admin/lecturas/${announcement.id}`, "href")} class="text-xs text-emerald-600 font-semibold hover:underline">
Ver métricas de lectura →
</a> </div> <div id="form-error" class="hidden mb-6 rounded-xl bg-red-50 border border-red-200 p-4 text-xs text-red-700"></div> <form id="edit-announcement-form" class="space-y-6"${addAttribute(announcement.id, "data-id")}> <!-- Title --> <div> <label for="title" class="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
Título del Comunicado <span class="text-red-500">*</span> </label> <input type="text" id="title" name="title" required minlength="5"${addAttribute(announcement.title, "value")} class="block w-full rounded-xl border border-slate-300 py-2.5 px-3.5 text-sm text-slate-900 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"> </div> <!-- Slug (Readonly display) --> <div> <label for="slug" class="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
Slug URL <span class="text-slate-400 font-normal lowercase">(identificador permanente)</span> </label> <input type="text" id="slug" name="slug" disabled${addAttribute(announcement.slug, "value")} class="block w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 px-3.5 font-mono text-xs text-slate-500 shadow-inner"> </div> <!-- Category & Target Audience --> <div class="grid grid-cols-1 sm:grid-cols-2 gap-5"> <div> <label for="category" class="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
Categoría Temática <span class="text-red-500">*</span> </label> <select id="category" name="category" required class="block w-full rounded-xl border border-slate-300 py-2.5 px-3.5 text-sm text-slate-800 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"> <option value="Convocatorias de Asamblea"${addAttribute(announcement.category === "Convocatorias de Asamblea", "selected")}>Convocatorias de Asamblea</option> <option value="Mantenimiento"${addAttribute(announcement.category === "Mantenimiento", "selected")}>Mantenimiento</option> <option value="Urgente / Alertas"${addAttribute(announcement.category === "Urgente / Alertas", "selected")}>Urgente / Alertas</option> <option value="Normas de Convivencia"${addAttribute(announcement.category === "Normas de Convivencia", "selected")}>Normas de Convivencia</option> <option value="Finanzas / Cuotas"${addAttribute(announcement.category === "Finanzas / Cuotas", "selected")}>Finanzas / Cuotas</option> </select> </div> <div> <label for="audience" class="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
Audiencia Destino <span class="text-red-500">*</span> </label> <select id="audience" name="audience" required class="block w-full rounded-xl border border-slate-300 py-2.5 px-3.5 text-sm text-slate-800 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"> <option value="General"${addAttribute(announcement.audience === "General", "selected")}>General (Toda la Comunidad)</option> <option value="Solo Propietarios"${addAttribute(announcement.audience === "Solo Propietarios", "selected")}>Solo Propietarios</option> <option value="Solo Inquilinos"${addAttribute(announcement.audience === "Solo Inquilinos", "selected")}>Solo Inquilinos</option> </select> </div> </div> <!-- Summary --> <div> <label for="summary" class="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
Resumen Breve <span class="text-red-500">*</span> </label> <textarea id="summary" name="summary" rows="2" required class="block w-full rounded-xl border border-slate-300 py-2.5 px-3.5 text-sm text-slate-900 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500">${announcement.summary}</textarea> </div> <!-- Content --> <div> <label for="content" class="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
Contenido Completo <span class="text-red-500">*</span> </label> <textarea id="content" name="content" rows="10" required class="block w-full rounded-xl border border-slate-300 py-3 px-3.5 font-mono text-xs text-slate-900 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 leading-relaxed">${announcement.content}</textarea> </div> <!-- Deadline Date & Options --> <div class="grid grid-cols-1 sm:grid-cols-4 gap-4 border-t border-slate-100 pt-5"> <div> <label for="deadline_date" class="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
Fecha Límite
</label> <input type="date" id="deadline_date" name="deadline_date"${addAttribute(announcement.deadline_date || "", "value")} class="block w-full rounded-xl border border-slate-300 py-2 px-3 text-xs text-slate-800 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"> </div> <div class="flex items-center gap-2 pt-4"> <input type="checkbox" id="is_urgent" name="is_urgent"${addAttribute(announcement.is_urgent === 1, "checked")} class="h-4 w-4 rounded border-slate-300 text-red-600 focus:ring-red-500"> <label for="is_urgent" class="text-xs font-semibold text-slate-700 cursor-pointer">
🚨 Urgente
</label> </div> <div class="flex items-center gap-2 pt-4"> <input type="checkbox" id="pinned" name="pinned"${addAttribute(announcement.pinned === 1, "checked")} class="h-4 w-4 rounded border-slate-300 text-amber-600 focus:ring-amber-500"> <label for="pinned" class="text-xs font-semibold text-slate-700 cursor-pointer">
📌 Fijado
</label> </div> <div class="flex items-center gap-2 pt-4"> <input type="checkbox" id="archived" name="archived"${addAttribute(announcement.archived === 1, "checked")} class="h-4 w-4 rounded border-slate-300 text-slate-600 focus:ring-slate-500"> <label for="archived" class="text-xs font-semibold text-slate-700 cursor-pointer">
📁 Archivado
</label> </div> </div> <!-- Form Actions --> <div class="flex items-center justify-end gap-3 border-t border-slate-200 pt-6"> <a href="/admin" class="rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50 transition">
Cancelar
</a> <button type="submit" id="save-btn" class="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-emerald-500 transition focus:outline-none focus:ring-2 focus:ring-emerald-500">
Guardar Cambios
</button> </div> </form> </div> </div> ` })} `;
}, "D:/COMUNICADOS-LAURELES/src/pages/admin/comunicados/[id]/editar.astro", void 0);

const $$file = "D:/COMUNICADOS-LAURELES/src/pages/admin/comunicados/[id]/editar.astro";
const $$url = "/admin/comunicados/[id]/editar";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Editar,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };

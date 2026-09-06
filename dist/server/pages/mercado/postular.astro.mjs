/* empty css                                     */
import { c as createComponent, e as renderHead, a as addAttribute, r as renderTemplate } from '../../chunks/astro/server_DopID9XI.mjs';
import 'kleur/colors';
import 'clsx';
import { g as getDb } from '../../chunks/db_D9z2L-6S.mjs';
export { renderers } from '../../renderers.mjs';

const $$Postular = createComponent(async ($$result, $$props, $$slots) => {
  const db = getDb();
  const censusProperties = db.prepare("SELECT id, manzana, lote, address, owner_name FROM census_properties ORDER BY manzana, lote").all();
  const categories = [
    "Gastronom\xEDa / Comida",
    "Vestimenta / Ropa",
    "Servicios T\xE9cnicos",
    "Gasfiter\xEDa / Electricidad",
    "Belleza / Cuidado Personal",
    "Otros"
  ];
  return renderTemplate`<html lang="es"> <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Postular Emprendimiento | Mercado Laureles</title><meta name="description" content="Formulario oficial de postulación de emprendimientos y servicios vecinales para el directorio Mercado Laureles de la Urbanización Los Laureles."><link rel="icon" type="image/svg+xml" href="/favicon.svg">${renderHead()}</head> <body class="bg-gray-50 text-gray-800 antialiased min-h-screen flex flex-col font-sans"> <!-- Top Header --> <header class="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-2xs"> <div class="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between"> <a href="/mercado" class="inline-flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-laureles-800 transition-colors"> <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path> </svg> <span>Volver al Mercado</span> </a> <div class="flex items-center gap-2"> <span class="text-xs font-bold uppercase tracking-wider text-laureles-800 bg-laureles-100 px-2.5 py-1 rounded-full">
Postulación Vecinal
</span> </div> </div> </header> <!-- Main Container --> <main class="flex-1 max-w-2xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-10"> <!-- Title & Intro --> <div class="text-center mb-8"> <div class="w-14 h-14 bg-laureles-100 text-laureles-800 rounded-2xl flex items-center justify-center mx-auto mb-3 text-2xl shadow-2xs">
✍️
</div> <h1 class="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight mb-2">
Postula tu Emprendimiento
</h1> <p class="text-sm text-gray-600 max-w-lg mx-auto leading-relaxed">
Comparte tus productos o servicios con todos los vecinos de la Urbanización Los Laureles.
          Tu negocio será verificado por la administración antes de publicarse en el directorio.
</p> </div> <!-- Application Form Card --> <div class="bg-white rounded-3xl border border-gray-200 shadow-sm p-6 sm:p-8"> <form id="marketplace-submit-form" class="space-y-6" novalidate> <!-- Error Alert Banner (Hidden by default) --> <div id="form-error-banner" class="hidden p-4 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-sm" role="alert"> <div class="flex items-start gap-2"> <svg class="w-5 h-5 text-red-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path> </svg> <div class="space-y-1"> <p class="font-bold">Por favor corrige los siguientes errores:</p> <ul id="form-error-list" class="list-disc list-inside text-xs space-y-0.5"></ul> </div> </div> </div> <!-- 1. Business Name / Title --> <div> <label for="title" class="block text-sm font-bold text-gray-900 mb-1.5">
Nombre Comercial o Título del Negocio <span class="text-red-500">*</span> </label> <input type="text" id="title" name="title" required minlength="3" maxlength="80" placeholder="Ej. Pastelería Doña Rosa / Gasfitería Don Lucho" class="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-laureles-500 focus:border-laureles-500 transition-all shadow-2xs"> <p class="mt-1 text-xs text-gray-400">Entre 3 y 80 caracteres.</p> </div> <!-- 2. Category Selection --> <div> <label for="category" class="block text-sm font-bold text-gray-900 mb-1.5">
Rubro o Categoría <span class="text-red-500">*</span> </label> <select id="category" name="category" required class="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-laureles-500 focus:border-laureles-500 transition-all shadow-2xs"> <option value="" disabled selected>Selecciona un rubro comercial...</option> ${categories.map((cat) => renderTemplate`<option${addAttribute(cat, "value")}>${cat}</option>`)} </select> </div> <!-- 3. Entrepreneur Name & Address Row --> <div class="grid grid-cols-1 sm:grid-cols-2 gap-4"> <!-- Entrepreneur Name --> <div> <label for="entrepreneurName" class="block text-sm font-bold text-gray-900 mb-1.5">
Nombre del Emprendedor(a) <span class="text-red-500">*</span> </label> <input type="text" id="entrepreneurName" name="entrepreneurName" required minlength="3" maxlength="80" placeholder="Tu nombre y apellido" class="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-laureles-500 focus:border-laureles-500 transition-all shadow-2xs"> </div> <!-- Property Address in Laureles --> <div> <label for="propertyAddress" class="block text-sm font-bold text-gray-900 mb-1.5">
Inmueble / Manzana y Casa <span class="text-red-500">*</span> </label> <input type="text" id="propertyAddress" name="propertyAddress" list="census-properties-list" required placeholder="Ej. Mz. A Lote 04" class="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-laureles-500 focus:border-laureles-500 transition-all shadow-2xs"> <datalist id="census-properties-list"> ${censusProperties.map((p) => renderTemplate`<option${addAttribute(`${p.manzana} ${p.lote} (${p.address})`, "value")}> ${p.owner_name} </option>`)} </datalist> </div> </div> <!-- 4. Phone / WhatsApp & Schedule --> <div class="grid grid-cols-1 sm:grid-cols-2 gap-4"> <!-- WhatsApp Phone --> <div> <label for="phone" class="block text-sm font-bold text-gray-900 mb-1.5">
Teléfono / WhatsApp de Contacto <span class="text-red-500">*</span> </label> <div class="relative"> <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400 font-semibold text-xs">
🇵🇪 +51
</div> <input type="tel" id="phone" name="phone" required placeholder="987 654 321" class="w-full pl-16 pr-4 py-3 bg-white border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-laureles-500 focus:border-laureles-500 transition-all shadow-2xs font-mono"> </div> <p class="mt-1 text-xs text-gray-400">Celular de 9 dígitos con WhatsApp activo.</p> </div> <!-- Schedule --> <div> <label for="scheduleHours" class="block text-sm font-bold text-gray-900 mb-1.5">
Horario de Atención <span class="text-red-500">*</span> </label> <input type="text" id="scheduleHours" name="scheduleHours" required minlength="5" maxlength="100" placeholder="Ej. Lun - Sáb: 9:00 AM - 7:00 PM" class="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-laureles-500 focus:border-laureles-500 transition-all shadow-2xs"> </div> </div> <!-- 5. Description --> <div> <label for="description" class="block text-sm font-bold text-gray-900 mb-1.5">
Descripción de Productos / Servicios <span class="text-red-500">*</span> </label> <textarea id="description" name="description" rows="3" required minlength="15" maxlength="500" placeholder="Describe lo que ofreces, especialidades, formas de entrega dentro de la urbanización..." class="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-laureles-500 focus:border-laureles-500 transition-all shadow-2xs resize-y"></textarea> <div class="flex justify-between items-center mt-1 text-xs text-gray-400"> <span>Mínimo 15 caracteres.</span> <span id="description-char-count">0 / 500</span> </div> </div> <!-- 6. Custom WhatsApp Message Template (Optional) --> <div> <label for="whatsappMessage" class="block text-sm font-bold text-gray-900 mb-1.5">
Mensaje Predeterminado de WhatsApp <span class="text-xs font-normal text-gray-400">(Opcional)</span> </label> <input type="text" id="whatsappMessage" name="whatsappMessage" maxlength="200" placeholder="Ej. ¡Hola! Vi tu negocio en Mercado Laureles y deseo hacer una consulta." class="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-laureles-500 focus:border-laureles-500 transition-all shadow-2xs"> <p class="mt-1 text-xs text-gray-400">
Texto que aparecerá automáticamente en el chat cuando un vecino pulse "Contactar por WhatsApp".
</p> </div> <!-- 7. Image URL (Optional) --> <div> <label for="imageUrl" class="block text-sm font-bold text-gray-900 mb-1.5">
URL de Foto o Logotipo <span class="text-xs font-normal text-gray-400">(Opcional)</span> </label> <input type="url" id="imageUrl" name="imageUrl" placeholder="https://... o dejar en blanco para icono predeterminado" class="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-laureles-500 focus:border-laureles-500 transition-all shadow-2xs"> </div> <!-- Terms Notice --> <div class="p-4 rounded-2xl bg-gray-50 border border-gray-200 text-xs text-gray-500 leading-relaxed"> <span class="font-bold text-gray-700">Reglas de Convivencia Comercial:</span> Al postular, confirmas que resides en la Urbanización Los Laureles y que los datos brindados son verídicos. Tu anuncio quedará en estado <span class="font-semibold text-amber-700">Pendiente</span> hasta que la administración verifique la condición residencial.
</div> <!-- Submit Button --> <div class="pt-2"> <button type="submit" id="submit-btn" class="w-full py-3.5 px-6 bg-laureles-700 hover:bg-laureles-800 active:scale-[0.99] text-white font-bold rounded-2xl shadow-sm hover:shadow transition-all flex items-center justify-center gap-2 text-base cursor-pointer"> <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path> </svg> <span id="submit-btn-text">Enviar Postulación a Revisión</span> </button> </div> </form> </div> </main> <!-- Confirmation Success Modal (Hidden by default) --> <div id="success-modal" class="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 hidden" role="dialog" aria-modal="true"> <div class="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-gray-100 text-center animate-in fade-in zoom-in-95 duration-200"> <div class="w-16 h-16 bg-laureles-100 text-laureles-800 rounded-2xl flex items-center justify-center mx-auto mb-4 text-3xl">
🎉
</div> <span class="inline-block px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-xs font-bold uppercase tracking-wider mb-2">
Estado: Pendiente de Aprobación
</span> <h2 class="text-2xl font-extrabold text-gray-900 mb-3">
¡Postulación Recibida con Éxito!
</h2> <p class="text-sm text-gray-600 leading-relaxed mb-6" id="modal-success-description">
Muchas gracias vecino(a). Tu emprendimiento ha sido registrado en la base de datos y pasará a revisión por la Junta Directiva de la Urbanización Los Laureles.
</p> <div class="space-y-2"> <a href="/mercado" class="block w-full py-3 px-4 bg-laureles-700 hover:bg-laureles-800 text-white font-bold rounded-xl shadow-sm transition-all text-sm">
Volver al Mercado Laureles
</a> <button type="button" id="close-modal-btn" class="w-full py-2.5 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl text-sm transition-colors">
Registrar otro negocio
</button> </div> </div> </div> <!-- Client-side Script for Validation, Character Counting and Async POST -->  </body> </html>`;
}, "D:/COMUNICADOS-LAURELES/src/pages/mercado/postular.astro", void 0);

const $$file = "D:/COMUNICADOS-LAURELES/src/pages/mercado/postular.astro";
const $$url = "/mercado/postular";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Postular,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };

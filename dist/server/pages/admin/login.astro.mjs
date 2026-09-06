/* empty css                                     */
import { c as createComponent, e as renderHead, a as addAttribute, r as renderTemplate, b as createAstro } from '../../chunks/astro/server_DopID9XI.mjs';
import 'kleur/colors';
import 'clsx';
import { g as getDb } from '../../chunks/db_D9z2L-6S.mjs';
import { A as ADMIN_SESSION_COOKIE, v as validateAdminSession } from '../../chunks/auth_DB6DN8J0.mjs';
export { renderers } from '../../renderers.mjs';

const $$Astro = createAstro();
const $$Login = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Login;
  const token = Astro2.cookies.get(ADMIN_SESSION_COOKIE)?.value;
  if (token) {
    const db = getDb();
    if (validateAdminSession(db, token)) {
      return Astro2.redirect("/admin");
    }
  }
  const redirectUrl = Astro2.url.searchParams.get("redirect") || "/admin";
  return renderTemplate`<html lang="es" class="h-full bg-slate-900 antialiased"> <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Acceso Administrativo — Urbanización Los Laureles</title><link rel="icon" type="image/svg+xml" href="/favicon.svg">${renderHead()}</head> <body class="flex min-h-full flex-col justify-center px-4 py-12 sm:px-6 lg:px-8 font-sans"> <div class="sm:mx-auto sm:w-full sm:max-w-md text-center"> <!-- Urbanization Shield / Logo --> <div class="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-xl shadow-emerald-900/40 border border-emerald-400/30"> <svg xmlns="http://www.w3.org/2000/svg" class="h-9 w-9" fill="none" viewBox="0 0 24 24" stroke="currentColor"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path> </svg> </div> <h1 class="mt-4 text-2xl font-bold tracking-tight text-white sm:text-3xl">
Urbanización Los Laureles
</h1> <p class="mt-1 text-xs text-emerald-400 font-semibold tracking-wider uppercase">
Panel de Administración y Control
</p> </div> <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md"> <div class="rounded-2xl border border-slate-800 bg-slate-800/80 px-6 py-8 shadow-2xl backdrop-blur-xl sm:px-10"> <!-- Error alert banner --> <div id="login-error" class="hidden mb-5 rounded-xl bg-red-500/10 border border-red-500/30 p-3 text-center text-xs text-red-300">
PIN de acceso incorrecto. Inténtelo nuevamente.
</div> <form id="login-form" class="space-y-6"> <input type="hidden" id="redirect-input"${addAttribute(redirectUrl, "value")}> <div> <label for="pin-input" class="block text-xs font-semibold text-slate-200">
PIN de Acceso Administrativo
</label> <div class="mt-2 relative"> <input type="password" id="pin-input" name="pin" inputmode="numeric" maxlength="12" autocomplete="current-password" required placeholder="••••" autofocus class="block w-full rounded-xl border border-slate-700 bg-slate-900/90 py-3 px-4 text-center font-mono text-2xl tracking-[0.5em] text-white placeholder-slate-600 shadow-inner focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"> </div> <p class="mt-2 text-center text-[11px] text-slate-400">
PIN de prueba predeterminado: <span class="font-mono text-emerald-400 font-semibold">1234</span> </p> </div> <!-- Quick Numeric Keypad for Mobile --> <div class="grid grid-cols-3 gap-2 pt-2"> ${[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => renderTemplate`<button type="button"${addAttribute(num, "data-key")} class="keypad-btn rounded-xl border border-slate-700/80 bg-slate-800/60 py-3 text-lg font-semibold text-white shadow-sm transition hover:bg-slate-700 active:scale-95 focus:outline-none"> ${num} </button>`)} <button type="button" id="btn-clear" class="rounded-xl border border-slate-700/80 bg-slate-800/40 py-3 text-xs font-semibold text-slate-400 transition hover:bg-slate-700 active:scale-95 focus:outline-none">
Borrar
</button> <button type="button" data-key="0" class="keypad-btn rounded-xl border border-slate-700/80 bg-slate-800/60 py-3 text-lg font-semibold text-white shadow-sm transition hover:bg-slate-700 active:scale-95 focus:outline-none">
0
</button> <button type="button" id="btn-backspace" class="rounded-xl border border-slate-700/80 bg-slate-800/40 py-3 text-xs font-semibold text-slate-400 transition hover:bg-slate-700 active:scale-95 focus:outline-none">
⌫
</button> </div> <div> <button type="submit" id="submit-btn" class="flex w-full justify-center rounded-xl bg-emerald-600 py-3 px-4 text-sm font-semibold text-white shadow-lg shadow-emerald-900/50 transition hover:bg-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-slate-900">
Ingresar al Panel
</button> </div> </form> <div class="mt-6 border-t border-slate-700/80 pt-4 text-center"> <a href="/" class="text-xs text-slate-400 hover:text-white transition">
← Volver al portal público de vecinos
</a> </div> </div> </div>  </body> </html>`;
}, "D:/COMUNICADOS-LAURELES/src/pages/admin/login.astro", void 0);

const $$file = "D:/COMUNICADOS-LAURELES/src/pages/admin/login.astro";
const $$url = "/admin/login";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Login,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };

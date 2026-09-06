import { e as defineMiddleware, s as sequence } from './chunks/render-context_BH-EPtJ3.mjs';
import { g as getDb } from './chunks/db_D9z2L-6S.mjs';
import { A as ADMIN_SESSION_COOKIE, v as validateAdminSession } from './chunks/auth_DB6DN8J0.mjs';
import 'es-module-lexer';
import './chunks/astro-designed-error-pages_CYfzkdly.mjs';
import '@astrojs/internal-helpers/path';
import 'cookie';

const onRequest$1 = defineMiddleware(async (context, next) => {
  const { pathname } = context.url;
  const isAdminPage = pathname === "/admin" || pathname.startsWith("/admin/");
  const isAdminApi = pathname === "/api/admin" || pathname.startsWith("/api/admin/");
  const isLoginPage = pathname === "/admin/login";
  const isLoginApi = pathname === "/api/admin/login";
  if (isAdminPage && !isLoginPage || isAdminApi && !isLoginApi) {
    let token = context.cookies.get(ADMIN_SESSION_COOKIE)?.value;
    if (!token) {
      const rawCookie = context.request.headers.get("cookie");
      if (rawCookie) {
        const match = rawCookie.match(new RegExp(`(?:^|;\\s*)${ADMIN_SESSION_COOKIE}=([^;]+)`));
        if (match) {
          token = match[1];
        }
      }
    }
    const db = getDb();
    const isValid = validateAdminSession(db, token);
    if (!isValid) {
      if (isAdminApi) {
        return new Response(
          JSON.stringify({
            success: false,
            error: "UNAUTHORIZED",
            code: "UNAUTHORIZED",
            message: "No autorizado. Sesión inválida o expirada."
          }),
          {
            status: 401,
            headers: {
              "Content-Type": "application/json"
            }
          }
        );
      } else {
        const redirectTarget = encodeURIComponent(pathname);
        return context.redirect(`/admin/login?redirect=${redirectTarget}`);
      }
    }
  }
  return next();
});

const onRequest = sequence(
	
	onRequest$1
	
);

export { onRequest };

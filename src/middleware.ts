import { defineMiddleware } from 'astro:middleware';
import { getDb } from './lib/db.ts';
import { validateAdminSession, ADMIN_SESSION_COOKIE } from './lib/auth.ts';

export const onRequest = defineMiddleware(async (context, next) => {
  const { pathname } = context.url;

  // Determine if path is within admin area
  const isAdminPage = pathname === '/admin' || pathname.startsWith('/admin/');
  const isAdminApi = pathname === '/api/admin' || pathname.startsWith('/api/admin/');

  // Explicitly allow public authentication endpoints
  const isLoginPage = pathname === '/admin/login';
  const isLoginApi = pathname === '/api/admin/login';

  if ((isAdminPage && !isLoginPage) || (isAdminApi && !isLoginApi)) {
    let token = context.cookies.get(ADMIN_SESSION_COOKIE)?.value;

    // Fallback: manually parse raw Cookie header if context.cookies didn't resolve
    if (!token) {
      const rawCookie = context.request.headers.get('cookie');
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
            error: 'UNAUTHORIZED',
            code: 'UNAUTHORIZED',
            message: 'No autorizado. Sesión inválida o expirada.'
          }),
          {
            status: 401,
            headers: {
              'Content-Type': 'application/json'
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

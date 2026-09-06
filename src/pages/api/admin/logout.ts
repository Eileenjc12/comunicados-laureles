import type { APIRoute } from 'astro';
import { getDb } from '../../../lib/db.ts';
import { deleteAdminSession, ADMIN_SESSION_COOKIE } from '../../../lib/auth.ts';

export const POST: APIRoute = async ({ request, cookies }) => {
  let token = cookies.get(ADMIN_SESSION_COOKIE)?.value;

  if (!token) {
    const rawCookie = request.headers.get('cookie');
    if (rawCookie) {
      const match = rawCookie.match(new RegExp(`(?:^|;\\s*)${ADMIN_SESSION_COOKIE}=([^;]+)`));
      if (match) token = match[1];
    }
  }

  if (token) {
    const db = getDb();
    deleteAdminSession(db, token);
  }

  cookies.delete(ADMIN_SESSION_COOKIE, { path: '/' });

  return new Response(
    JSON.stringify({
      success: true,
      message: 'Sesión finalizada correctamente.'
    }),
    {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Set-Cookie': `${ADMIN_SESSION_COOKIE}=; Path=/; HttpOnly; Max-Age=0`
      }
    }
  );
};

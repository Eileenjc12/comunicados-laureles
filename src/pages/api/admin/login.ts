import type { APIRoute } from 'astro';
import { getDb } from '../../../lib/db.ts';
import { validateAdminPin, createAdminSession, ADMIN_SESSION_COOKIE, SESSION_EXPIRY_SECONDS } from '../../../lib/auth.ts';

export const POST: APIRoute = async ({ request, cookies }) => {
  let pin: string | undefined;

  const contentType = request.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    try {
      const body = await request.json();
      pin = body.pin;
    } catch {
      return new Response(
        JSON.stringify({ success: false, code: 'INVALID_JSON', message: 'Cuerpo de solicitud inválido.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
  } else if (contentType.includes('application/x-www-form-urlencoded') || contentType.includes('multipart/form-data')) {
    try {
      const formData = await request.formData();
      pin = formData.get('pin')?.toString();
    } catch {
      return new Response(
        JSON.stringify({ success: false, code: 'INVALID_FORM', message: 'Formulario inválido.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
  }

  if (!pin || !validateAdminPin(pin)) {
    return new Response(
      JSON.stringify({
        success: false,
        code: 'INVALID_PIN',
        message: 'PIN de acceso incorrecto.'
      }),
      {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }

  const db = getDb();
  const token = createAdminSession(db);

  // Set the HTTP-only session cookie
  cookies.set(ADMIN_SESSION_COOKIE, token, {
    path: '/',
    httpOnly: true,
    sameSite: 'strict',
    maxAge: SESSION_EXPIRY_SECONDS,
    secure: process.env.NODE_ENV === 'production'
  });

  return new Response(
    JSON.stringify({
      success: true,
      message: 'Autenticación exitosa.'
    }),
    {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        // Also include explicit Set-Cookie header for clients that inspect raw headers
        'Set-Cookie': `${ADMIN_SESSION_COOKIE}=${token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${SESSION_EXPIRY_SECONDS}${process.env.NODE_ENV === 'production' ? '; Secure' : ''}`
      }
    }
  );
};

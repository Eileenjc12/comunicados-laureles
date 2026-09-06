import { g as getDb } from '../../../chunks/db_D9z2L-6S.mjs';
import { a as validateAdminPin, c as createAdminSession, A as ADMIN_SESSION_COOKIE, S as SESSION_EXPIRY_SECONDS } from '../../../chunks/auth_DB6DN8J0.mjs';
export { renderers } from '../../../renderers.mjs';

const POST = async ({ request, cookies }) => {
  let pin;
  const contentType = request.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    try {
      const body = await request.json();
      pin = body.pin;
    } catch {
      return new Response(
        JSON.stringify({ success: false, code: "INVALID_JSON", message: "Cuerpo de solicitud inválido." }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }
  } else if (contentType.includes("application/x-www-form-urlencoded") || contentType.includes("multipart/form-data")) {
    try {
      const formData = await request.formData();
      pin = formData.get("pin")?.toString();
    } catch {
      return new Response(
        JSON.stringify({ success: false, code: "INVALID_FORM", message: "Formulario inválido." }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }
  }
  if (!pin || !validateAdminPin(pin)) {
    return new Response(
      JSON.stringify({
        success: false,
        code: "INVALID_PIN",
        message: "PIN de acceso incorrecto."
      }),
      {
        status: 401,
        headers: { "Content-Type": "application/json" }
      }
    );
  }
  const db = getDb();
  const token = createAdminSession(db);
  cookies.set(ADMIN_SESSION_COOKIE, token, {
    path: "/",
    httpOnly: true,
    sameSite: "strict",
    maxAge: SESSION_EXPIRY_SECONDS,
    secure: process.env.NODE_ENV === "production"
  });
  return new Response(
    JSON.stringify({
      success: true,
      message: "Autenticación exitosa."
    }),
    {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        // Also include explicit Set-Cookie header for clients that inspect raw headers
        "Set-Cookie": `${ADMIN_SESSION_COOKIE}=${token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${SESSION_EXPIRY_SECONDS}${process.env.NODE_ENV === "production" ? "; Secure" : ""}`
      }
    }
  );
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  POST
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };

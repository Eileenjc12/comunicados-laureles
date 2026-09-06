import { g as getDb } from '../../../chunks/db_D9z2L-6S.mjs';
import { A as ADMIN_SESSION_COOKIE, d as deleteAdminSession } from '../../../chunks/auth_DB6DN8J0.mjs';
export { renderers } from '../../../renderers.mjs';

const POST = async ({ request, cookies }) => {
  let token = cookies.get(ADMIN_SESSION_COOKIE)?.value;
  if (!token) {
    const rawCookie = request.headers.get("cookie");
    if (rawCookie) {
      const match = rawCookie.match(new RegExp(`(?:^|;\\s*)${ADMIN_SESSION_COOKIE}=([^;]+)`));
      if (match) token = match[1];
    }
  }
  if (token) {
    const db = getDb();
    deleteAdminSession(db, token);
  }
  cookies.delete(ADMIN_SESSION_COOKIE, { path: "/" });
  return new Response(
    JSON.stringify({
      success: true,
      message: "Sesión finalizada correctamente."
    }),
    {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Set-Cookie": `${ADMIN_SESSION_COOKIE}=; Path=/; HttpOnly; Max-Age=0`
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

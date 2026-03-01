globalThis.process ??= {}; globalThis.process.env ??= {};
import { d as defineMiddleware, s as sequence } from './chunks/index_BXIQR6V-.mjs';
import { d as drizzle, c as createAuth } from './chunks/auth_BEuxYfJh.mjs';
import { s as schema } from './chunks/schema_HDzOIqy1.mjs';
import './chunks/astro-designed-error-pages_CktFMtSl.mjs';
import './chunks/astro/server_CD2jnfAQ.mjs';

function createDatabase(d1) {
  return drizzle(d1, { schema });
}

const PUBLIC_PATHS = ["/api/auth", "/admin/login", "/api/debug", "/api/setup"];
const ADMIN_ONLY_PATHS = ["/admin/users", "/api/users"];
function isPublicPath(pathname) {
  return PUBLIC_PATHS.some((path) => pathname.startsWith(path));
}
function isAdminOnlyPath(pathname) {
  return ADMIN_ONLY_PATHS.some((path) => pathname.startsWith(path));
}
const onRequest$2 = defineMiddleware(async (context, next) => {
  const { pathname } = context.url;
  const d1 = context.locals.runtime.env.DB;
  context.locals.db = createDatabase(d1);
  if (isPublicPath(pathname)) {
    context.locals.user = null;
    return next();
  }
  if (!pathname.startsWith("/admin") && !pathname.startsWith("/api/")) {
    try {
      const auth = createAuth(d1, context.request);
      const session = await auth.api.getSession({
        headers: context.request.headers
      });
      context.locals.user = session?.user ? {
        id: session.user.id,
        email: session.user.email,
        name: session.user.name,
        role: session.user.role,
        image: session.user.image ?? null
      } : null;
    } catch {
      context.locals.user = null;
    }
    return next();
  }
  try {
    const auth = createAuth(d1, context.request);
    const session = await auth.api.getSession({
      headers: context.request.headers
    });
    console.log("[MIDDLEWARE] Path:", pathname);
    console.log("[MIDDLEWARE] Session exists:", !!session?.user);
    if (session?.user) {
      console.log("[MIDDLEWARE] User ID:", session.user.id);
      console.log("[MIDDLEWARE] User Email:", session.user.email);
      console.log(
        "[MIDDLEWARE] User Role:",
        session.user.role
      );
    }
    if (!session?.user) {
      if (pathname.startsWith("/api/")) {
        return new Response(
          JSON.stringify({ success: false, error: "Unauthorized" }),
          {
            status: 401,
            headers: { "Content-Type": "application/json" }
          }
        );
      }
      console.log("[MIDDLEWARE] Redirecting to login - no session");
      return context.redirect("/admin/login");
    }
    const userRole = session.user.role;
    context.locals.user = {
      id: session.user.id,
      email: session.user.email,
      name: session.user.name,
      role: userRole,
      image: session.user.image ?? null
    };
    if (isAdminOnlyPath(pathname) && userRole !== "admin") {
      if (pathname.startsWith("/api/")) {
        return new Response(
          JSON.stringify({ success: false, error: "Forbidden" }),
          {
            status: 403,
            headers: { "Content-Type": "application/json" }
          }
        );
      }
      return context.redirect("/admin");
    }
    return next();
  } catch (err) {
    console.error("[MIDDLEWARE] Error:", err);
    if (pathname.startsWith("/api/")) {
      return new Response(
        JSON.stringify({ success: false, error: "Unauthorized" }),
        {
          status: 401,
          headers: { "Content-Type": "application/json" }
        }
      );
    }
    return context.redirect("/admin/login");
  }
});

const onRequest$1 = (context, next) => {
  if (context.isPrerendered) {
    context.locals.runtime ??= {
      env: process.env
    };
  }
  return next();
};

const onRequest = sequence(
	onRequest$1,
	onRequest$2
	
);

export { onRequest };

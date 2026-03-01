/**
 * Auth Middleware
 *
 * Three responsibilities (and nothing else):
 * 1. Authenticate — validate session via Better Auth
 * 2. Authorize — protect /admin/* routes, check RBAC
 * 3. Inject context — put `user` and `db` into Astro.locals
 *
 * Clean Code: middleware stays under 50 lines of logic.
 */

import { defineMiddleware } from "astro:middleware";
import { createAuth } from "../auth";
import { createDatabase } from "./db/client";

/** Routes that don't require authentication */
const PUBLIC_PATHS = ["/api/auth", "/admin/login", "/api/setup"];

/** Actions restricted to admin role only */
const ADMIN_ONLY_PATHS = ["/admin/users", "/api/users"];

function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATHS.some((path) => pathname.startsWith(path));
}

function isAdminOnlyPath(pathname: string): boolean {
  return ADMIN_ONLY_PATHS.some((path) => pathname.startsWith(path));
}

export const onRequest = defineMiddleware(async (context, next) => {
  const { pathname } = context.url;
  const d1 = context.locals.runtime.env.DB;

  // Inject database into locals (available to all routes)
  context.locals.db = createDatabase(d1);

  // Public routes — skip auth
  if (isPublicPath(pathname)) {
    context.locals.user = null;
    return next();
  }

  // Non-admin routes — try to get session but don't block
  if (!pathname.startsWith("/admin") && !pathname.startsWith("/api/")) {
    try {
      const auth = createAuth(context.locals.runtime.env, context.request);
      const session = await auth.api.getSession({
        headers: context.request.headers,
      });
      context.locals.user = session?.user
        ? {
            id: session.user.id,
            email: session.user.email,
            name: session.user.name,
            role: (session.user as Record<string, unknown>).role as
              | "admin"
              | "editor"
              | "author",
            image: session.user.image ?? null,
          }
        : null;
    } catch {
      context.locals.user = null;
    }
    return next();
  }

  // Admin/API routes — require authentication
  try {
    const auth = createAuth(context.locals.runtime.env, context.request);
    const session = await auth.api.getSession({
      headers: context.request.headers,
    });

    // Debug: Log session info
    console.log("[MIDDLEWARE] Path:", pathname);
    console.log("[MIDDLEWARE] Session exists:", !!session?.user);
    if (session?.user) {
      console.log("[MIDDLEWARE] User ID:", session.user.id);
      console.log("[MIDDLEWARE] User Email:", session.user.email);
      console.log(
        "[MIDDLEWARE] User Role:",
        (session.user as Record<string, unknown>).role,
      );
    }

    if (!session?.user) {
      // API routes return 401, admin pages redirect to login
      if (pathname.startsWith("/api/")) {
        return new Response(
          JSON.stringify({ success: false, error: "Unauthorized" }),
          {
            status: 401,
            headers: { "Content-Type": "application/json" },
          },
        );
      }
      console.log("[MIDDLEWARE] Redirecting to login - no session");
      return context.redirect("/admin/login");
    }

    const userRole = (session.user as Record<string, unknown>).role as string;

    // Inject user into locals
    context.locals.user = {
      id: session.user.id,
      email: session.user.email,
      name: session.user.name,
      role: userRole as "admin" | "editor" | "author",
      image: session.user.image ?? null,
    };

    // RBAC: admin-only paths
    if (isAdminOnlyPath(pathname) && userRole !== "admin") {
      if (pathname.startsWith("/api/")) {
        return new Response(
          JSON.stringify({ success: false, error: "Forbidden" }),
          {
            status: 403,
            headers: { "Content-Type": "application/json" },
          },
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
          headers: { "Content-Type": "application/json" },
        },
      );
    }
    return context.redirect("/admin/login");
  }
});

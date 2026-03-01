/**
 * Security Utilities — CSRF, sanitization, rate limiting
 *
 * Clean Code: pure functions, no side effects, testable in isolation.
 */

/**
 * Validate CSRF by checking Origin/Referer headers against the site URL.
 * Returns true if the request is safe.
 */
export function validateCSRF(request: Request, siteUrl: string): boolean {
  const method = request.method.toUpperCase();

  // Safe methods don't need CSRF check
  if (['GET', 'HEAD', 'OPTIONS'].includes(method)) return true;

  const origin = request.headers.get('origin');
  const referer = request.headers.get('referer');

  if (origin) {
    try {
      const originUrl = new URL(origin);
      const siteOrigin = new URL(siteUrl);
      return originUrl.origin === siteOrigin.origin;
    } catch {
      return false;
    }
  }

  if (referer) {
    try {
      const refererUrl = new URL(referer);
      const siteOrigin = new URL(siteUrl);
      return refererUrl.origin === siteOrigin.origin;
    } catch {
      return false;
    }
  }

  // No origin or referer — block by default for state-changing requests
  // Exception: API calls with auth tokens (they already have session validation)
  const hasAuth = request.headers.get('cookie')?.includes('better-auth');
  return !!hasAuth;
}

/**
 * Sanitize text content to prevent XSS.
 * Strips dangerous HTML tags while preserving safe formatting.
 */
export function sanitizeTextContent(html: string): string {
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '')
    .replace(/<embed\b[^>]*>/gi, '')
    .replace(/<form\b[^<]*(?:(?!<\/form>)<[^<]*)*<\/form>/gi, '')
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
    .replace(/on\w+\s*=\s*[^\s>]+/gi, '');
}

/**
 * Sanitize a slug to only allow safe characters.
 */
export function sanitizeSlug(slug: string): string {
  return slug
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\u0E00-\u0E7F-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

/**
 * Rate limiter for auth endpoints.
 * Max attempts per IP within a time window.
 */
const authRateLimitMap = new Map<string, { count: number; resetAt: number }>();
const AUTH_MAX_ATTEMPTS = 5;
const AUTH_WINDOW_MS = 300_000; // 5 minutes

export function checkAuthRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = authRateLimitMap.get(ip);

  if (!entry || now > entry.resetAt) {
    authRateLimitMap.set(ip, { count: 1, resetAt: now + AUTH_WINDOW_MS });
    return true;
  }

  if (entry.count >= AUTH_MAX_ATTEMPTS) {
    return false;
  }

  entry.count++;
  return true;
}

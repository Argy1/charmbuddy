import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Edge middleware: generates a per-request nonce and injects a strict
 * Content-Security-Policy header.  Using 'nonce-…' + 'strict-dynamic'
 * means the browser only executes scripts that carry the matching nonce
 * attribute, which eliminates the need for 'unsafe-inline' / 'unsafe-eval'
 * in script-src.
 */
export function middleware(request: NextRequest) {
  // Cryptographically random nonce — unique per request
  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");

  // Resolve API origin from build-time env (NEXT_PUBLIC_ vars are inlined by Next.js)
  const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8001";
  const apiOrigin = apiBase.replace(/\/api\/?$/, "");

  // In development we allow localhost API; in production only the real API origin is trusted
  const isDev = process.env.NODE_ENV === "development";
  const devImgSources = isDev ? " http://localhost:8001 http://127.0.0.1:8001" : "";
  const devConnectSources = isDev
    ? " http://localhost:8001 http://127.0.0.1:8001 ws://localhost:* wss://localhost:*"
    : "";

  const csp = [
    "default-src 'self'",
    // nonce + strict-dynamic: no unsafe-inline / unsafe-eval needed
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'`,
    "style-src 'self'",
    "style-src-elem 'self'",
    // Framer Motion and Next/Image rely on style attributes for runtime layout/animation.
    "style-src-attr 'unsafe-inline'",
    `img-src 'self' data: blob: ${apiOrigin}${devImgSources}`,
    "font-src 'self' data:",
    `connect-src 'self' ${apiBase} ${apiOrigin}${devConnectSources}`,
    "media-src 'self'",
    "worker-src 'self' blob:",
    "object-src 'none'",
    "frame-src 'none'",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "upgrade-insecure-requests",
  ].join("; ");

  // Make nonce available to Server Components via request header
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);
  requestHeaders.set("Content-Security-Policy", csp);

  const response = NextResponse.next({
    request: { headers: requestHeaders },
  });

  // Set CSP on the outgoing response
  response.headers.set("Content-Security-Policy", csp);

  return response;
}

export const config = {
  matcher: [
    /*
     * Match every route EXCEPT:
     * - _next/static  (compiled assets)
     * - _next/image   (image optimisation)
     * - favicon.ico
     * - Static file extensions
     */
    "/((?!_next/static|_next/image|favicon\\.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|txt|xml|json|woff|woff2|ttf|otf|eot)$).*)",
  ],
};

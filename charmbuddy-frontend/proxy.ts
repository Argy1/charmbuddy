import { NextResponse } from "next/server";

/**
 * Edge proxy: applies Content-Security-Policy for the app shell.
 * Next currently emits script tags without a matching nonce in this project,
 * so script-src must allow the generated Next runtime to hydrate the page.
 */
export function proxy() {
  const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8001";
  const apiOrigin = apiBase.replace(/\/api\/?$/, "");

  const isDev = process.env.NODE_ENV === "development";
  const devImgSources = isDev ? " http://localhost:8001 http://127.0.0.1:8001" : "";
  const devConnectSources = isDev
    ? " http://localhost:8001 http://127.0.0.1:8001 ws://localhost:* wss://localhost:*"
    : "";
  const scriptSrc = isDev ? "script-src 'self' 'unsafe-inline' 'unsafe-eval'" : "script-src 'self' 'unsafe-inline'";

  const csp = [
    "default-src 'self'",
    scriptSrc,
    "style-src 'self' 'unsafe-inline'",
    "style-src-elem 'self' 'unsafe-inline'",
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

  const response = NextResponse.next();
  response.headers.set("Content-Security-Policy", csp);

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon\\.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|txt|xml|json|woff|woff2|ttf|otf|eot)$).*)",
  ],
};

import type { NextConfig } from "next";

// ---------------------------------------------------------------------------
// Remote image patterns
// ---------------------------------------------------------------------------

const fallbackPatterns: NonNullable<NextConfig["images"]>["remotePatterns"] = [
  { protocol: "http", hostname: "localhost", port: "8001", pathname: "/**" },
  { protocol: "http", hostname: "127.0.0.1", port: "8001", pathname: "/**" },
];

const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
const remotePatterns = [...fallbackPatterns];
const siteOrigin =
  process.env.NEXT_PUBLIC_SITE_ORIGIN ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : process.env.NODE_ENV === "production"
      ? "https://charmbuddy.vercel.app"
      : "http://localhost:3000");

if (apiBaseUrl) {
  try {
    const parsed = new URL(apiBaseUrl);
    remotePatterns.push({
      protocol: parsed.protocol.replace(":", "") as "http" | "https",
      hostname: parsed.hostname,
      port: parsed.port || undefined,
      pathname: "/**",
    });
  } catch {
    // ignore invalid URL and keep fallback patterns
  }
}

// ---------------------------------------------------------------------------
// Static security headers (applied to every route including _next/static).
// NOTE: Content-Security-Policy is intentionally NOT listed here — it is set
//       per-request by middleware.ts so that a unique nonce can be embedded.
// ---------------------------------------------------------------------------

const securityHeaders = [
  // Prevent MIME-type sniffing
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Deny all framing (clickjacking protection)
  { key: "X-Frame-Options", value: "DENY" },
  // Legacy XSS filter for older browsers
  { key: "X-XSS-Protection", value: "1; mode=block" },
  // Limit referrer information leakage
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // Disable dangerous browser features
  {
    key: "Permissions-Policy",
    value:
      "camera=(), microphone=(), geolocation=(), payment=(), usb=(), magnetometer=(), gyroscope=()",
  },
  // Force HTTPS for 2 years — safe because Vercel always serves over TLS
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  // Prevent Flash / PDF plugin cross-domain data access
  { key: "X-Permitted-Cross-Domain-Policies", value: "none" },
  // Prevent other origins from embedding these pages
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  { key: "Cross-Origin-Resource-Policy", value: "same-origin" },
  // Avoid wildcard CORS on document responses while keeping same-origin use normal.
  { key: "Access-Control-Allow-Origin", value: siteOrigin },
];

// ---------------------------------------------------------------------------
// Next.js config
// ---------------------------------------------------------------------------

const nextConfig: NextConfig = {
  poweredByHeader: false,
  images: {
    remotePatterns,
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;

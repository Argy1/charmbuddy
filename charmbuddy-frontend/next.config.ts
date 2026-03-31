import type { NextConfig } from "next";

const fallbackPatterns: NonNullable<NextConfig["images"]>["remotePatterns"] = [
  { protocol: "http", hostname: "localhost", port: "8000", pathname: "/**" },
  { protocol: "http", hostname: "127.0.0.1", port: "8000", pathname: "/**" },
];

const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
const remotePatterns = [...fallbackPatterns];

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

const nextConfig: NextConfig = {
  images: {
    remotePatterns,
  },
};

export default nextConfig;

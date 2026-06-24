import type { NextConfig } from "next";

const supabaseHostname = (() => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url) return null;
  try {
    return new URL(url).hostname;
  } catch {
    return null;
  }
})();

const securityHeaders = [
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), interest-cohort=()" },
];

const nextConfig: NextConfig = {
  experimental: {
    middlewareClientMaxBodySize: "100mb",
  },
  images: {
    // Vercel Image Optimization is disabled to stay within the Hobby plan's
    // 5k/month transformation limit. Images are served as-is, so keep source
    // files reasonably sized (see /public). Supabase product images are
    // delivered directly without proxying.
    unoptimized: true,
    remotePatterns: supabaseHostname
      ? [{ protocol: "https", hostname: supabaseHostname, pathname: "/storage/v1/object/**" }]
      : [],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
  async redirects() {
    return [
      // The community page was renamed to FallowFam. Keep old links/SEO working.
      { source: "/community", destination: "/fallowfam", permanent: true },
    ];
  },
};

export default nextConfig;

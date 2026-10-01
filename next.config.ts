import withBundleAnalyzer from "@next/bundle-analyzer";
import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

const nextConfig: NextConfig = {
  cacheComponents: false,
  typedRoutes: true,
  reactCompiler: true,
  experimental: {
    // Rust port of the React Compiler, runs inside Turbopack instead of Babel.
    turbopackRustReactCompiler: true,
    optimizeCss: true,
    optimizePackageImports: [
      "@tabler/icons-react",
      "sonner",
      "react-hook-form",
      "zod",
    ],
  },
  // The FAQ moved onto the homepage; keep the old URLs working.
  async redirects() {
    return [
      { source: "/faq", destination: "/#faq", permanent: true },
      {
        source: "/:locale(cs|en)/faq",
        destination: "/:locale#faq",
        permanent: true,
      },
    ];
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Strict-Transport-Security",
            value: "max-age=31536000; includeSubDomains",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "X-DNS-Prefetch-Control",
            value: "on",
          },
        ],
      },
      {
        source: "/sw.js",
        headers: [
          {
            key: "Cache-Control",
            value: "no-cache, no-store, must-revalidate",
          },
          {
            key: "Content-Security-Policy",
            value: "default-src 'self'; script-src 'self'",
          },
        ],
      },
    ];
  },
};

export default withBundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
})(withNextIntl(nextConfig));

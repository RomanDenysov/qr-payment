import type { MetadataRoute } from "next";
import { routing } from "@/i18n/routing";

const BASE = "https://qr-platby.com";

const pages = [
  { path: "", changeFrequency: "monthly" as const, priority: 1 },
  { path: "/bulk", changeFrequency: "monthly" as const, priority: 0.8 },
  {
    path: "/ochrana-udajov",
    changeFrequency: "yearly" as const,
    priority: 0.3,
  },
  { path: "/podmienky", changeFrequency: "yearly" as const, priority: 0.3 },
  { path: "/faq", changeFrequency: "monthly" as const, priority: 0.5 },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const localePages = pages.flatMap((page) =>
    routing.locales.map((locale) => {
      const isDefaultLocale = locale === routing.defaultLocale;
      const urlPath = isDefaultLocale ? page.path : `/${locale}${page.path}`;
      const languageUrls = Object.fromEntries(
        routing.locales.map((l) => {
          const isDefault = l === routing.defaultLocale;
          return [l, `${BASE}${isDefault ? "" : `/${l}`}${page.path}`];
        })
      );

      return {
        url: `${BASE}${urlPath}`,
        lastModified: now,
        changeFrequency: page.changeFrequency,
        priority: page.priority,
        alternates: {
          languages: {
            ...languageUrls,
            "x-default": `${BASE}${page.path}`,
          },
        },
      };
    })
  );

  const staticFiles: MetadataRoute.Sitemap = [
    {
      url: `${BASE}/openapi.json`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${BASE}/llms.txt`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${BASE}/llms-full.txt`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.3,
    },
  ];

  return [...localePages, ...staticFiles];
}

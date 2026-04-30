import type { MetadataRoute } from "next";
import { getLatestChangelogDate } from "@/features/changelog/data";
import { routing } from "@/i18n/routing";
import { localePath } from "@/lib/seo";

interface SitemapPage {
  path: string;
  changeFrequency: "monthly" | "yearly" | "weekly" | "daily";
  priority: number;
  lastModified?: Date;
}

const pages: SitemapPage[] = [
  { path: "", changeFrequency: "monthly", priority: 1 },
  { path: "/studio", changeFrequency: "monthly", priority: 0.7 },
  { path: "/bulk", changeFrequency: "monthly", priority: 0.8 },
  {
    path: "/ochrana-udajov",
    changeFrequency: "yearly",
    priority: 0.3,
  },
  { path: "/podmienky", changeFrequency: "yearly", priority: 0.3 },
  { path: "/faq", changeFrequency: "monthly", priority: 0.5 },
  { path: "/docs", changeFrequency: "monthly", priority: 0.7 },
  {
    path: "/changelog",
    changeFrequency: "weekly",
    priority: 0.6,
    lastModified: new Date(getLatestChangelogDate()),
  },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const localePages = pages.flatMap((page) =>
    routing.locales.map((locale) => ({
      url: localePath(locale, page.path),
      lastModified: page.lastModified ?? now,
      changeFrequency: page.changeFrequency,
      priority: page.priority,
      alternates: {
        languages: {
          ...Object.fromEntries(
            routing.locales.map((l) => [l, localePath(l, page.path)])
          ),
          "x-default": localePath(routing.defaultLocale, page.path),
        },
      },
    }))
  );

  const staticFiles: MetadataRoute.Sitemap = [
    {
      url: localePath(routing.defaultLocale, "/openapi.json"),
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: localePath(routing.defaultLocale, "/llms.txt"),
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: localePath(routing.defaultLocale, "/llms-full.txt"),
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.3,
    },
  ];

  return [...localePages, ...staticFiles];
}

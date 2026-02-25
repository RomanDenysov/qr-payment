import type { MetadataRoute } from "next";

const aiCrawlers = [
  "GPTBot",
  "ChatGPT-User",
  "ClaudeBot",
  "Claude-Web",
  "PerplexityBot",
  "Applebot-Extended",
  "GoogleOther",
  "Google-Extended",
  "cohere-ai",
  "Bytespider",
  "CCBot",
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      ...aiCrawlers.map((bot) => ({
        userAgent: bot,
        allow: ["/", "/llms.txt", "/llms-full.txt", "/openapi.json"],
      })),
      { userAgent: "*", allow: "/" },
    ],
    sitemap: "https://qr-platby.com/sitemap.xml",
  };
}

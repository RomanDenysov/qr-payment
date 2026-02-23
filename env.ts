import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {
    TELEGRAM_BOT_TOKEN: z.string().min(1),
    TELEGRAM_CHAT_ID: z.string().min(1),
  },
  client: {
    NEXT_PUBLIC_APP_URL: z.url().min(1),
  },
  runtimeEnv: {
    TELEGRAM_BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN,
    TELEGRAM_CHAT_ID: process.env.TELEGRAM_CHAT_ID,
    NEXT_PUBLIC_APP_URL:
      process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  },
});

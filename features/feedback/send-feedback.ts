"use server";

import z from "zod";
import { env } from "@/env";

const feedbackSchema = z.object({
  message: z.string().min(1).max(500),
  language: z.string().min(1).max(10),
  deviceType: z.string().min(1).max(50),
});

type SendFeedbackResult = { success: true } | { success: false; error: string };

export async function sendFeedback(
  input: unknown
): Promise<SendFeedbackResult> {
  const parsed = feedbackSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: "invalid-input" };
  }

  const { message, language, deviceType } = parsed.data;

  const timestamp = new Date().toLocaleString("sk-SK", {
    timeZone: "Europe/Bratislava",
  });

  const text = [
    "💡 Feature Request",
    "",
    message,
    "",
    "———",
    `🕐 ${timestamp}`,
    `🌐 ${language}`,
    `📱 ${deviceType}`,
  ].join("\n");

  try {
    const response = await fetch(
      `https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: env.TELEGRAM_CHAT_ID,
          text,
        }),
      }
    );

    if (!response.ok) {
      const body = await response.json().catch(() => null);
      console.error("[Feedback] Telegram API error:", {
        status: response.status,
        description: body?.description,
      });
      return { success: false, error: "api-error" };
    }

    return { success: true };
  } catch (error) {
    console.error(
      "[Feedback] Network error:",
      error instanceof Error ? error.message : error
    );
    return { success: false, error: "network-error" };
  }
}

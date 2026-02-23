"use server";

import { env } from "@/env";

interface SendFeedbackInput {
  message: string;
  language: string;
  deviceType: string;
}

export async function sendFeedback(
  input: SendFeedbackInput
): Promise<{ success: boolean }> {
  const timestamp = new Date().toLocaleString("sk-SK", {
    timeZone: "Europe/Bratislava",
  });

  const text = [
    "💡 Feature Request",
    "",
    input.message,
    "",
    "———",
    `🕐 ${timestamp}`,
    `🌐 ${input.language}`,
    `📱 ${input.deviceType}`,
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
      return { success: false };
    }

    return { success: true };
  } catch (error) {
    console.error(
      "[Feedback] Network error:",
      error instanceof Error ? error.message : error
    );
    return { success: false };
  }
}

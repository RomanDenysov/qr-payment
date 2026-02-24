"use server";

import { track } from "@vercel/analytics/server";
import { after } from "next/server";
import z from "zod";
import { env } from "@/env";

const feedbackSchema = z.object({
  message: z.string().min(1).max(500),
  language: z.string().min(1).max(10),
  deviceType: z.string().min(1).max(50),
});

type SendFeedbackResult =
  | { success: true }
  | {
      success: false;
      error: "invalid-input" | "api-error" | "network-error" | "timeout";
    };

function formatMessage(
  message: string,
  language: string,
  deviceType: string
): string {
  const timestamp = new Date().toLocaleString("sk-SK", {
    timeZone: "Europe/Bratislava",
  });

  return [
    "💡 Feature Request",
    "",
    message,
    "",
    "———",
    `🕐 ${timestamp}`,
    `🌐 ${language}`,
    `📱 ${deviceType}`,
  ].join("\n");
}

export async function sendFeedback(
  input: unknown
): Promise<SendFeedbackResult> {
  const parsed = feedbackSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: "invalid-input" };
  }

  const { message, language, deviceType } = parsed.data;

  try {
    const response = await fetch(
      `https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: env.TELEGRAM_CHAT_ID,
          text: formatMessage(message, language, deviceType),
        }),
        signal: AbortSignal.timeout(5000),
      }
    );

    if (!response.ok) {
      const body = await response.json().catch(() => null);
      console.error("[Feedback] Telegram API error:", {
        status: response.status,
        description: body?.description,
      });
      after(() => {
        track("feature_request_failed", { reason: "api-error" }).catch((err) =>
          console.error("[Feedback] Failed to track event:", err)
        );
      });
      return { success: false, error: "api-error" };
    }

    after(() => {
      track("feature_request_submitted").catch((err) =>
        console.error("[Feedback] Failed to track event:", err)
      );
    });
    return { success: true };
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      console.error("[Feedback] Request timeout");
      after(() => {
        track("feature_request_failed", { reason: "timeout" }).catch((err) =>
          console.error("[Feedback] Failed to track event:", err)
        );
      });
      return { success: false, error: "timeout" };
    }
    console.error(
      "[Feedback] Network error:",
      error instanceof Error ? error.message : error
    );
    after(() => {
      track("feature_request_failed", { reason: "network-error" }).catch(
        (err) => console.error("[Feedback] Failed to track event:", err)
      );
    });
    return { success: false, error: "network-error" };
  }
}

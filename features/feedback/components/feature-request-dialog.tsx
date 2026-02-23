"use client";

import { IconBulb, IconSend } from "@tabler/icons-react";
import { track } from "@vercel/analytics";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { createFeatureRequestSchema } from "../schema";
import { sendFeedback } from "../send-feedback";
import { useFeedbackActions } from "../store";
import { PreviousRequests } from "./previous-requests";

type DialogState = "idle" | "submitting" | "success";

const MOBILE_RE = /Mobi|Android/i;

export function FeatureRequestDialog({
  trigger,
}: {
  trigger?: React.ReactElement;
}) {
  const [message, setMessage] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [state, setState] = useState<DialogState>("idle");
  const { addRequest, canSubmit } = useFeedbackActions();
  const closeRef = useRef<HTMLButtonElement>(null);
  const t = useTranslations("Feedback");

  const schema = useMemo(
    () =>
      createFeatureRequestSchema({
        min: t("messageMin"),
        max: t("messageMax"),
      }),
    [t]
  );

  const handleOpenChange = useCallback((open: boolean) => {
    if (open) {
      track("feature_request_opened");
    } else {
      setMessage("");
      setError(null);
      setState("idle");
    }
  }, []);

  const handleSubmit = useCallback(async () => {
    const result = schema.safeParse({ message });
    if (!result.success) {
      setError(result.error.issues[0]?.message ?? "Validation error");
      return;
    }

    setState("submitting");
    setError(null);

    const isMobile = MOBILE_RE.test(navigator.userAgent);

    try {
      const response = await sendFeedback({
        message: result.data.message,
        language: navigator.language,
        deviceType: isMobile ? "Mobile" : "Desktop",
      });

      if (!response.success) {
        setState("idle");
        setError(t("sendFailed"));
        track("feature_request_failed");
        return;
      }

      addRequest(result.data.message);
      track("feature_request_submitted");
      toast.success(t("submitted"));
      setState("success");
    } catch {
      setState("idle");
      setError(t("sendFailed"));
      track("feature_request_failed");
    }
  }, [message, addRequest, schema, t]);

  useEffect(() => {
    if (state !== "success") {
      return;
    }
    const timer = setTimeout(() => {
      closeRef.current?.click();
    }, 2000);
    return () => clearTimeout(timer);
  }, [state]);

  const allowed = canSubmit();
  const charCount = message.length;

  return (
    <Dialog onOpenChange={handleOpenChange}>
      {trigger ? (
        <DialogTrigger render={trigger} />
      ) : (
        <DialogTrigger render={<Button size="sm" variant="outline" />}>
          <IconBulb />
          {t("trigger")}
        </DialogTrigger>
      )}
      <DialogContent>
        <DialogTitle>{t("title")}</DialogTitle>
        <DialogDescription>{t("description")}</DialogDescription>

        {state === "success" ? (
          <div className="py-6 text-center">
            <p className="font-medium text-sm">{t("successTitle")}</p>
            <p className="mt-1 text-muted-foreground text-xs">
              {t("successClose")}
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {allowed ? (
              <>
                <div className="flex flex-col gap-1.5">
                  <textarea
                    className={cn(
                      "min-h-28 w-full resize-none rounded-none border bg-transparent px-3 py-2 font-mono text-sm outline-none ring-1 ring-foreground/10 placeholder:text-muted-foreground focus:ring-foreground/30",
                      error && "ring-destructive"
                    )}
                    disabled={state === "submitting"}
                    maxLength={500}
                    onChange={(e) => {
                      setMessage(e.target.value);
                      if (error) {
                        setError(null);
                      }
                    }}
                    placeholder={t("placeholder")}
                    value={message}
                  />
                  <div className="flex items-center justify-between">
                    {error ? (
                      <p className="text-destructive text-xs">{error}</p>
                    ) : (
                      <span />
                    )}
                    <span
                      className={cn(
                        "text-muted-foreground text-xs",
                        charCount > 450 && "text-amber-500",
                        charCount >= 500 && "text-destructive"
                      )}
                    >
                      {charCount}/500
                    </span>
                  </div>
                </div>
                <PreviousRequests />
              </>
            ) : (
              <>
                <p className="text-muted-foreground text-xs">{t("maxReached")}</p>
                <PreviousRequests />
              </>
            )}

            <div className="flex gap-2 pt-2">
              <DialogClose render={<Button size="sm" variant="outline" />}>
                {t("close")}
              </DialogClose>
              {allowed && (
                <Button
                  className="flex-1"
                  disabled={state === "submitting" || charCount < 10}
                  onClick={handleSubmit}
                  size="sm"
                >
                  <IconSend />
                  {state === "submitting" ? t("submitting") : t("submit")}
                </Button>
              )}
            </div>
          </div>
        )}

        <DialogClose className="hidden" ref={closeRef} />
      </DialogContent>
    </Dialog>
  );
}

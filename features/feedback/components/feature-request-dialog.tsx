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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [state, setState] = useState<DialogState>("idle");
  const { addRequest } = useFeedbackActions();
  const closeRef = useRef<HTMLButtonElement>(null);
  const t = useTranslations("Feedback");

  const schema = useMemo(
    () =>
      createFeatureRequestSchema({
        min: t("messageMin"),
        max: t("messageMax"),
        email: t("emailInvalid"),
      }),
    [t]
  );

  const handleOpenChange = useCallback((open: boolean) => {
    if (open) {
      track("feature_request_opened");
    } else {
      setMessage("");
      setEmail("");
      setError(null);
      setEmailError(null);
      setState("idle");
    }
  }, []);

  const handleSubmit = useCallback(async () => {
    const result = schema.safeParse({ message, email: email.trim() });
    if (!result.success) {
      const issue = result.error.issues[0];
      const text = issue?.message ?? "Validation error";
      if (issue?.path[0] === "email") {
        setEmailError(text);
      } else {
        setError(text);
      }
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
        ...(result.data.email && { email: result.data.email }),
      });

      if (!response.success) {
        setState("idle");
        setError(t("sendFailed"));
        return;
      }

      addRequest(result.data.message);
      toast.success(t("submitted"));
      setState("success");
    } catch {
      setState("idle");
      setError(t("sendFailed"));
    }
  }, [message, email, addRequest, schema, t]);

  useEffect(() => {
    if (state !== "success") {
      return;
    }
    const timer = setTimeout(() => {
      closeRef.current?.click();
    }, 2000);
    return () => clearTimeout(timer);
  }, [state]);

  const charCount = message.length;

  return (
    <Dialog onOpenChange={handleOpenChange}>
      {trigger ? (
        <DialogTrigger render={trigger} />
      ) : (
        <DialogTrigger render={<Button size="sm" variant="ghost" />}>
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
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="feature-request-email">{t("emailLabel")}</Label>
              <Input
                aria-describedby="feature-request-email-hint"
                aria-invalid={emailError ? true : undefined}
                autoComplete="email"
                disabled={state === "submitting"}
                id="feature-request-email"
                maxLength={254}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (emailError) {
                    setEmailError(null);
                  }
                }}
                placeholder="name@example.com"
                type="email"
                value={email}
              />
              <p
                className={cn(
                  "text-xs",
                  emailError ? "text-destructive" : "text-muted-foreground"
                )}
                id="feature-request-email-hint"
              >
                {emailError ?? t("emailHint")}
              </p>
            </div>
            <PreviousRequests />

            <div className="flex gap-2 pt-2">
              <DialogClose render={<Button size="sm" variant="ghost" />}>
                {t("close")}
              </DialogClose>
              <Button
                className="flex-1"
                disabled={state === "submitting" || charCount < 10}
                onClick={handleSubmit}
                size="sm"
              >
                <IconSend />
                {state === "submitting" ? t("submitting") : t("submit")}
              </Button>
            </div>
          </div>
        )}

        <DialogClose className="hidden" ref={closeRef} />
      </DialogContent>
    </Dialog>
  );
}

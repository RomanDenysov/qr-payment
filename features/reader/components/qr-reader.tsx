"use client";

import { IconPhotoScan, IconUpload } from "@tabler/icons-react";
import { track } from "@vercel/analytics";
import { useTranslations } from "next-intl";
import { useEffect, useEffectEvent, useRef, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { FORMAT_LABELS } from "@/features/payment/format";
import type { PaymentFormData } from "@/features/payment/schema";
import { usePaymentActions } from "@/features/payment/store";
import { useRouter } from "@/i18n/navigation";
import { cn, formatAmount } from "@/lib/utils";
import { type DecodeWarning, decodePayload } from "../decode-payload";
import { readQrFromImage } from "../read-qr-image";

type ReaderState =
  | { status: "idle" | "reading" }
  | { status: "error"; error: "noQr" | "notPayment" | "readFailed" }
  | { status: "done"; payment: PaymentFormData; warnings: DecodeWarning[] };

type Source = "image" | "text";

/** Reads a payment QR from an image or its text and shows what it pays. */
export function QrReader() {
  const t = useTranslations("Reader");
  const [state, setState] = useState<ReaderState>({ status: "idle" });
  const [text, setText] = useState("");
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const showDecoded = (decoded: string, source: Source) => {
    const result = decodePayload(decoded);
    setState(
      result.ok
        ? { status: "done", ...result }
        : { status: "error", error: "notPayment" }
    );
    track("qr_decoded", {
      source,
      format: result.ok ? result.payment.format : "none",
    });
  };

  const handleImage = async (file: File | undefined) => {
    if (!file) {
      return;
    }
    setState({ status: "reading" });
    try {
      const decoded = await readQrFromImage(file);
      if (decoded) {
        showDecoded(decoded, "image");
      } else {
        setState({ status: "error", error: "noQr" });
        track("qr_decoded", { source: "image", format: "none" });
      }
    } catch (error) {
      // createImageBitmap rejects formats the browser cannot open (e.g. HEIC).
      console.error("[QrReader] Failed to read image", error);
      setState({ status: "error", error: "readFailed" });
    }
  };

  // Ctrl+V of a screenshot anywhere on the page. Text pastes into the textarea.
  const onPaste = useEffectEvent((event: ClipboardEvent) => {
    const file = event.clipboardData?.files[0];
    if (file?.type.startsWith("image/")) {
      event.preventDefault();
      handleImage(file);
    }
  });
  useEffect(() => {
    window.addEventListener("paste", onPaste);
    return () => window.removeEventListener("paste", onPaste);
  }, []);

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div className="flex flex-col gap-4">
        <button
          className={cn(
            "flex w-full cursor-pointer flex-col items-center justify-center gap-3 border-2 border-dashed p-8 transition-colors",
            dragging
              ? "border-primary bg-primary/5"
              : "border-muted-foreground/25 hover:border-muted-foreground/50"
          )}
          onClick={() => inputRef.current?.click()}
          onDragLeave={() => setDragging(false)}
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            handleImage(e.dataTransfer.files[0]);
          }}
          type="button"
        >
          <div className="flex items-center gap-2 text-muted-foreground">
            <IconPhotoScan className="size-8" />
            <IconUpload className="size-5" />
          </div>
          <div className="text-center text-sm">
            <p className="font-medium">{t("uploadTitle")}</p>
            <p className="text-muted-foreground text-xs">
              {t("uploadDescription")}
            </p>
          </div>
          <input
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              handleImage(e.target.files?.[0]);
              e.target.value = "";
            }}
            ref={inputRef}
            type="file"
          />
        </button>

        <form
          className="flex flex-col gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            showDecoded(text, "text");
          }}
        >
          <label className="text-muted-foreground text-sm" htmlFor="qr-text">
            {t("textLabel")}
          </label>
          <Textarea
            className="min-h-24 font-mono text-xs"
            id="qr-text"
            onChange={(e) => setText(e.target.value)}
            placeholder="SPD*1.0*ACC:CZ..."
            value={text}
          />
          <Button
            className="self-start"
            disabled={!text.trim()}
            type="submit"
            variant="outline"
          >
            {t("readText")}
          </Button>
        </form>

        <p className="text-muted-foreground text-xs">{t("privacy")}</p>
      </div>

      <ReaderResult state={state} />
    </div>
  );
}

function ReaderResult({ state }: { state: ReaderState }) {
  const t = useTranslations("Reader");
  const tForm = useTranslations("PaymentForm");
  const router = useRouter();
  const { openInForm } = usePaymentActions();

  if (state.status !== "done") {
    return (
      <div
        aria-live="polite"
        className="flex min-h-48 items-center justify-center border border-border border-dashed p-6 text-center text-muted-foreground text-sm"
      >
        {state.status === "error" ? t(`error.${state.error}`) : null}
        {state.status === "reading" ? t("reading") : null}
        {state.status === "idle" ? t("empty") : null}
      </div>
    );
  }

  const { payment, warnings } = state;
  const rows: [string, string | undefined][] = [
    ["IBAN", payment.iban],
    ["BIC", payment.bic],
    [
      tForm("amount"),
      payment.amount ? formatAmount(payment.amount, payment.currency) : "-",
    ],
    [tForm("recipientName"), payment.recipientName],
    ["VS", payment.variableSymbol],
    ["SS", payment.specificSymbol],
    ["KS", payment.constantSymbol],
    [
      payment.format === "epc" ? tForm("paymentReference") : tForm("note"),
      payment.paymentNote,
    ],
    [tForm("dueDate"), payment.paymentDueDate],
    [tForm("invoiceId"), payment.invoiceId],
    [tForm("spaydReference"), payment.spaydReference],
    [tForm("purposeCode"), payment.purposeCode],
    [tForm("instantPayment"), payment.instantPayment ? t("yes") : undefined],
  ];

  const handleOpen = () => {
    openInForm(payment);
    track("qr_decoded_opened", { format: payment.format });
    router.push("/");
  };

  return (
    <Card aria-live="polite">
      <CardHeader className="border-b">
        <CardTitle>{t("resultTitle")}</CardTitle>
        <CardAction>
          <Badge variant="outline">{FORMAT_LABELS[payment.format]}</Badge>
        </CardAction>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <dl className="space-y-2">
          {rows.map(([label, value]) =>
            value ? (
              <div className="flex justify-between gap-4" key={label}>
                <dt className="shrink-0 text-muted-foreground text-xs">
                  {label}
                </dt>
                <dd className="break-all text-right font-medium text-sm">
                  {value}
                </dd>
              </div>
            ) : null
          )}
        </dl>
        {warnings.length > 0 ? (
          <ul className="space-y-1 border border-destructive/40 p-3 text-destructive text-xs">
            {warnings.map((warning) => (
              <li key={warning}>{t(`warning.${warning}`)}</li>
            ))}
          </ul>
        ) : null}
        <Button onClick={handleOpen}>{t("openInForm")}</Button>
        <p className="text-muted-foreground text-xs">{t("openHint")}</p>
      </CardContent>
    </Card>
  );
}

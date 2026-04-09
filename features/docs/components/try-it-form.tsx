"use client";

import {
  IconChevronDown,
  IconChevronUp,
  IconLoader2,
  IconSend,
} from "@tabler/icons-react";
import { useTranslations } from "next-intl";
import { useState, useTransition } from "react";
import { Controller, useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { CopyButton } from "./copy-button";

interface FormValues {
  iban: string;
  amount: string;
  currency: string;
  paymentFormat: string;
  format: string;
  size: string;
  variableSymbol: string;
  specificSymbol: string;
  constantSymbol: string;
  recipientName: string;
  paymentNote: string;
}

interface ApiResult {
  status: number;
  body: Record<string, unknown>;
  rateLimitRemaining?: string;
}

const DEFAULTS: Record<string, string> = {
  currency: "EUR",
  paymentFormat: "bysquare",
  format: "png",
  size: "300",
};

const NUMERIC_FIELDS = new Set(["amount", "size"]);

const CURRENCY_OPTIONS = [
  { value: "EUR", label: "EUR" },
  { value: "CZK", label: "CZK" },
];

const FORMAT_OPTIONS = [
  { value: "bysquare", label: "PAY by square" },
  { value: "spayd", label: "SPAYD" },
  { value: "epc", label: "EPC (SEPA)" },
];

const OUTPUT_OPTIONS = [
  { value: "png", label: "PNG" },
  { value: "svg", label: "SVG" },
];

function buildRequestBody(values: FormValues): Record<string, unknown> {
  const body: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(values)) {
    if (!value || value === DEFAULTS[key]) {
      continue;
    }
    body[key] = NUMERIC_FIELDS.has(key) ? Number(value) : value;
  }

  return body;
}

function RequestBodyBlock({
  body,
  label,
}: {
  body: Record<string, unknown>;
  label: string;
}) {
  const json = JSON.stringify(body, null, 2);
  return (
    <div className="group/code relative space-y-1">
      <span className="font-medium text-muted-foreground text-xs">{label}</span>
      <pre className="overflow-x-auto bg-foreground/[0.04] p-3 ring-1 ring-foreground/5 dark:bg-foreground/[0.06]">
        <code className="text-xs leading-relaxed">{json}</code>
      </pre>
      <CopyButton text={json} />
    </div>
  );
}

function ResponseBodyBlock({ body }: { body: Record<string, unknown> }) {
  const json = JSON.stringify(
    body.success
      ? { ...body, data: `${String(body.data).slice(0, 60)}...` }
      : body,
    null,
    2
  );
  return (
    <div className="group/code relative">
      <pre className="overflow-x-auto bg-foreground/[0.04] p-3 ring-1 ring-foreground/5 dark:bg-foreground/[0.06]">
        <code className="text-xs leading-relaxed">{json}</code>
      </pre>
      <CopyButton text={json} />
    </div>
  );
}

export function TryItForm() {
  const t = useTranslations("Docs");
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<ApiResult | null>(null);
  const [lastRequestBody, setLastRequestBody] = useState<Record<
    string,
    unknown
  > | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      iban: "SK3112000000198742637541",
      amount: "25.50",
      currency: "EUR",
      paymentFormat: "bysquare",
      format: "png",
      size: "300",
      variableSymbol: "",
      specificSymbol: "",
      constantSymbol: "",
      recipientName: "",
      paymentNote: "",
    },
  });

  const onSubmit = (values: FormValues) => {
    startTransition(async () => {
      setResult(null);

      const body = buildRequestBody(values);
      setLastRequestBody(body);

      try {
        const res = await fetch("/api/v1/qr", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });

        let data: Record<string, unknown>;
        try {
          data = await res.json();
        } catch (parseErr) {
          console.error("[TryItForm] JSON parse error:", parseErr);
          setResult({
            status: res.status,
            body: {
              success: false,
              error: {
                code: "PARSE_ERROR",
                message: "Invalid JSON response",
              },
            },
          });
          return;
        }

        setResult({
          status: res.status,
          body: data,
          rateLimitRemaining:
            res.headers.get("X-RateLimit-Remaining") ?? undefined,
        });
      } catch (err) {
        console.error("[TryItForm] Network error:", err);
        setResult({
          status: 0,
          body: {
            success: false,
            error: {
              code: "NETWORK_ERROR",
              message: err instanceof Error ? err.message : "Network error",
            },
          },
        });
      }
    });
  };

  return (
    <div className="space-y-4">
      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field>
            <FieldLabel htmlFor="try-iban">
              <Label>IBAN *</Label>
            </FieldLabel>
            <Controller
              control={control}
              name="iban"
              render={({ field }) => (
                <Input
                  id="try-iban"
                  placeholder="SK3112000000198742637541"
                  {...field}
                />
              )}
              rules={{ required: "IBAN is required" }}
            />
            <FieldError errors={[errors.iban]} />
          </Field>
          <Field>
            <FieldLabel htmlFor="try-amount">
              <Label>{t("amount")}</Label>
            </FieldLabel>
            <Controller
              control={control}
              name="amount"
              render={({ field }) => (
                <Input
                  id="try-amount"
                  placeholder="25.50"
                  step="0.01"
                  type="number"
                  {...field}
                />
              )}
            />
          </Field>
        </div>

        <div className="flex flex-wrap gap-4">
          <Controller
            control={control}
            name="currency"
            render={({ field }) => (
              <SegmentedControl
                onChange={field.onChange}
                options={CURRENCY_OPTIONS}
                value={field.value}
              />
            )}
          />
          <Controller
            control={control}
            name="paymentFormat"
            render={({ field }) => (
              <SegmentedControl
                onChange={field.onChange}
                options={FORMAT_OPTIONS}
                value={field.value}
              />
            )}
          />
          <Controller
            control={control}
            name="format"
            render={({ field }) => (
              <SegmentedControl
                onChange={field.onChange}
                options={OUTPUT_OPTIONS}
                value={field.value}
              />
            )}
          />
        </div>

        <div>
          <button
            className="inline-flex items-center gap-1 text-muted-foreground text-xs underline-offset-4 hover:text-foreground hover:underline"
            onClick={() => setShowAdvanced(!showAdvanced)}
            type="button"
          >
            {t("advanced")}
            {showAdvanced ? (
              <IconChevronUp className="size-3.5" />
            ) : (
              <IconChevronDown className="size-3.5" />
            )}
          </button>
        </div>

        {showAdvanced && (
          <div className="grid gap-4 sm:grid-cols-3">
            <Field>
              <FieldLabel htmlFor="try-vs">
                <Label>variableSymbol</Label>
              </FieldLabel>
              <Controller
                control={control}
                name="variableSymbol"
                render={({ field }) => (
                  <Input id="try-vs" placeholder="2024001" {...field} />
                )}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="try-ss">
                <Label>specificSymbol</Label>
              </FieldLabel>
              <Controller
                control={control}
                name="specificSymbol"
                render={({ field }) => (
                  <Input id="try-ss" placeholder="" {...field} />
                )}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="try-ks">
                <Label>constantSymbol</Label>
              </FieldLabel>
              <Controller
                control={control}
                name="constantSymbol"
                render={({ field }) => (
                  <Input id="try-ks" placeholder="0308" {...field} />
                )}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="try-recipient">
                <Label>recipientName</Label>
              </FieldLabel>
              <Controller
                control={control}
                name="recipientName"
                render={({ field }) => (
                  <Input
                    id="try-recipient"
                    placeholder="Jan Novak"
                    {...field}
                  />
                )}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="try-note">
                <Label>paymentNote</Label>
              </FieldLabel>
              <Controller
                control={control}
                name="paymentNote"
                render={({ field }) => (
                  <Input
                    id="try-note"
                    placeholder="Invoice 2024-001"
                    {...field}
                  />
                )}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="try-size">
                <Label>size</Label>
              </FieldLabel>
              <Controller
                control={control}
                name="size"
                render={({ field }) => (
                  <Input
                    id="try-size"
                    placeholder="300"
                    type="number"
                    {...field}
                  />
                )}
              />
            </Field>
          </div>
        )}

        <Button disabled={isPending} type="submit">
          {isPending ? (
            <IconLoader2 className="size-4 animate-spin" />
          ) : (
            <IconSend className="size-4" />
          )}
          {isPending ? t("loading") : t("send")}
        </Button>
      </form>

      {lastRequestBody && (
        <RequestBodyBlock body={lastRequestBody} label={t("requestBody")} />
      )}

      {result && (
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <span className="font-mono text-xs">
              Status:{" "}
              <span
                className={
                  result.status === 200
                    ? "text-green-600 dark:text-green-400"
                    : "text-destructive"
                }
              >
                {result.status}
              </span>
            </span>
            {result.rateLimitRemaining != null && (
              <span className="text-muted-foreground text-xs">
                Rate limit remaining: {result.rateLimitRemaining}
              </span>
            )}
          </div>

          {result.body.success &&
          typeof result.body.data === "string" &&
          result.body.format === "png" ? (
            <div className="flex justify-center bg-foreground/[0.04] p-4 ring-1 ring-foreground/5">
              {/* biome-ignore lint/a11y/useAltText: QR code is visual data */}
              {/* biome-ignore lint/correctness/useImageSize: dynamic data URI, dimensions set via CSS */}
              {/* biome-ignore lint/performance/noImgElement: data URI cannot use next/image */}
              <img className="size-[200px]" src={result.body.data} />
            </div>
          ) : null}

          <ResponseBodyBlock body={result.body} />
        </div>
      )}
    </div>
  );
}

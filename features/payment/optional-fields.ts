import type { PaymentFormat } from "./format";

/**
 * Optional payment fields the standards support but the form hides by default.
 * Users opt them in per format via the "Fields" config menu. Each key maps to a
 * field on PaymentFormData and is consumed by buildQrPayload / the encoders.
 */
export type OptionalFieldKey =
  | "paymentDueDate"
  | "invoiceId"
  | "bic"
  | "spaydReference"
  | "purposeCode";

export interface OptionalFieldConfig {
  key: OptionalFieldKey;
  /** Translation key under the PaymentForm namespace. */
  labelKey: string;
  /** Translation key for the input placeholder (omit for date inputs). */
  placeholderKey?: string;
  inputType: "text" | "date";
  maxLength?: number;
  inputMode?: "numeric" | "text";
}

export const OPTIONAL_FIELDS: Record<OptionalFieldKey, OptionalFieldConfig> = {
  paymentDueDate: {
    key: "paymentDueDate",
    labelKey: "dueDate",
    inputType: "date",
  },
  invoiceId: {
    key: "invoiceId",
    labelKey: "invoiceId",
    placeholderKey: "invoiceIdPlaceholder",
    inputType: "text",
    maxLength: 10,
  },
  bic: {
    key: "bic",
    labelKey: "bic",
    placeholderKey: "bicPlaceholder",
    inputType: "text",
    maxLength: 11,
  },
  spaydReference: {
    key: "spaydReference",
    labelKey: "spaydReference",
    placeholderKey: "spaydReferencePlaceholder",
    inputType: "text",
    inputMode: "numeric",
    maxLength: 16,
  },
  purposeCode: {
    key: "purposeCode",
    labelKey: "purposeCode",
    placeholderKey: "purposeCodePlaceholder",
    inputType: "text",
    maxLength: 4,
  },
};

export const OPTIONAL_FIELDS_BY_FORMAT: Record<
  PaymentFormat,
  OptionalFieldKey[]
> = {
  bysquare: ["paymentDueDate", "invoiceId", "bic"],
  spayd: ["paymentDueDate", "bic", "spaydReference"],
  epc: ["purposeCode"],
};

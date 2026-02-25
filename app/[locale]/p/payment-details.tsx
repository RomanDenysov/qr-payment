import { getTranslations } from "next-intl/server";
import { Badge } from "@/components/ui/badge";
import type { PaymentFormData } from "@/features/payment/schema";
import { maskIban } from "@/lib/utils";
import { CopyIbanButton } from "./copy-iban-button";

function PaymentField({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-muted-foreground text-xs">{label}</span>
      <span className="font-medium text-sm">{value}</span>
    </div>
  );
}

interface Props {
  payment: PaymentFormData;
  format: string;
}

export async function PaymentDetails({ payment, format }: Props) {
  const tForm = await getTranslations("PaymentForm");

  return (
    <div className="w-full space-y-2 pt-2">
      {format === "epc" ? <Badge variant="outline">EPC / SEPA</Badge> : null}
      <div className="flex items-center justify-between gap-2">
        <span className="text-muted-foreground text-xs">IBAN</span>
        <span className="flex items-center gap-1 font-medium text-sm">
          {maskIban(payment.iban)}
          <CopyIbanButton iban={payment.iban} />
        </span>
      </div>
      <PaymentField
        label={tForm("amount")}
        value={`${payment.amount.toFixed(2)} ${payment.currency ?? "EUR"}`}
      />
      {payment.recipientName ? (
        <PaymentField
          label={tForm("recipientName")}
          value={payment.recipientName}
        />
      ) : null}
      {payment.variableSymbol ? (
        <PaymentField label="VS" value={payment.variableSymbol} />
      ) : null}
      {payment.specificSymbol ? (
        <PaymentField label="SS" value={payment.specificSymbol} />
      ) : null}
      {payment.constantSymbol ? (
        <PaymentField label="KS" value={payment.constantSymbol} />
      ) : null}
      {payment.bic ? <PaymentField label="BIC" value={payment.bic} /> : null}
      {payment.paymentNote ? (
        <PaymentField
          label={format === "epc" ? tForm("paymentReference") : tForm("note")}
          value={payment.paymentNote}
        />
      ) : null}
    </div>
  );
}

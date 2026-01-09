import { PaymentFormCard } from "@/features/payment/components/payment-form-card";
import { QRPreviewCard } from "@/features/payment/components/qr-preview-card";

export default function Page() {
  return (
    <main className="flex-1 pt-5 sm:pt-8 md:pt-16">
      <section className="grid gap-8 *:rounded-none sm:grid-cols-2" role="feed">
        <PaymentFormCard />
        <QRPreviewCard />
      </section>
    </main>
  );
}

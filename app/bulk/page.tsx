import type { Metadata } from "next";
import { BulkPage } from "@/features/bulk/components/bulk-page";

export const metadata: Metadata = {
  title: "Hromadné generovanie",
  description:
    "Hromadné generovanie QR kódov pre platby z CSV súboru. Stiahnite ako ZIP alebo PDF.",
};

export default function Page() {
  return <BulkPage />;
}

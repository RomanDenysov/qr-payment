import { track } from "@vercel/analytics";
import { useTranslations } from "next-intl";
import { useTransition } from "react";
import { toast } from "sonner";
import { useCustomizerConfig } from "@/features/customizer/store";
import { DOWNLOAD_SIZE_PX } from "@/features/customizer/types";
import { resizePngDataUrl, resizePngToBlob } from "../resize-qr";
import { useCurrentPayment } from "../store";

export function useQrPreviewActions() {
  const current = useCurrentPayment();
  const customizer = useCustomizerConfig();
  const t = useTranslations("QRPreview");
  const [downloadPending, startDownload] = useTransition();
  const [copyPending, startCopy] = useTransition();
  const [sharePending, startShare] = useTransition();

  const handleDownload = () => {
    const qrDataUrl = current?.qrDataUrl;
    if (!qrDataUrl) {
      return;
    }
    const size = customizer.downloadSize;
    const targetPx = DOWNLOAD_SIZE_PX[size];
    startDownload(async () => {
      try {
        const resized = await resizePngDataUrl(qrDataUrl, targetPx);
        const link = document.createElement("a");
        link.href = resized;
        link.download = `qr-payment-${targetPx}-${Date.now()}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        track("qr_downloaded", { size, source: "home" });
        toast.success(t("downloaded"));
      } catch (error) {
        console.error("[QRPreviewCard] Failed to download QR image:", error);
        toast.error(t("downloadFailed"));
      }
    });
  };

  const handleCopy = () => {
    const qrDataUrl = current?.qrDataUrl;
    if (!qrDataUrl) {
      return;
    }
    const size = customizer.downloadSize;
    const targetPx = DOWNLOAD_SIZE_PX[size];
    startCopy(async () => {
      try {
        const blob = await resizePngToBlob(qrDataUrl, targetPx);
        await navigator.clipboard.write([
          new ClipboardItem({ "image/png": blob }),
        ]);
        track("qr_copied", { size });
        toast.success(t("copied"));
      } catch (error) {
        console.error("[QRPreviewCard] Failed to copy QR image:", error);
        toast.error(t("copyFailed"));
      }
    });
  };

  const handleShare = () => {
    const qrDataUrl = current?.qrDataUrl;
    if (!(qrDataUrl && navigator.share)) {
      handleCopy();
      return;
    }
    const size = customizer.downloadSize;
    const targetPx = DOWNLOAD_SIZE_PX[size];
    startShare(async () => {
      try {
        const blob = await resizePngToBlob(qrDataUrl, targetPx);
        const file = new File([blob], `qr-payment-${targetPx}.png`, {
          type: "image/png",
        });
        await navigator.share({
          files: [file],
          title: t("shareTitle"),
        });
        track("qr_shared", { size });
        toast.success(t("shared"));
      } catch (error) {
        if ((error as Error).name === "AbortError") {
          return;
        }
        console.error("[QRPreviewCard] Failed to share QR image:", error);
        toast.error(t("shareFailed"));
      }
    });
  };

  return {
    download: handleDownload,
    copy: handleCopy,
    share: handleShare,
    isLoading: downloadPending || copyPending || sharePending,
  };
}

import { IconArrowLeft, IconMoodSad } from "@tabler/icons-react";
import { useTranslations } from "next-intl";
import { buttonVariants } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

export default function NotFoundPage() {
  const t = useTranslations("NotFound");

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 py-16 text-center">
      <IconMoodSad className="size-12 text-muted-foreground" />
      <h1 className="font-bold font-pixel text-xl tracking-wide">
        {t("title")}
      </h1>
      <p className="max-w-md text-muted-foreground text-sm">
        {t("description")}
      </p>
      <Link className={cn(buttonVariants({ variant: "outline" }))} href="/">
        <IconArrowLeft />
        {t("back")}
      </Link>
    </div>
  );
}

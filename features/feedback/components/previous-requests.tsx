"use client";

import { Collapsible } from "@base-ui/react/collapsible";
import { IconChevronDown } from "@tabler/icons-react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { useFeedbackRequests } from "../store";

function formatRelativeTime(
  timestamp: string,
  t: ReturnType<typeof useTranslations<"Feedback">>
): string {
  const diff = Date.now() - new Date(timestamp).getTime();
  const minutes = Math.floor(diff / 60_000);
  const hours = Math.floor(diff / 3_600_000);
  const days = Math.floor(diff / 86_400_000);

  if (minutes < 1) {
    return t("timeNow");
  }
  if (minutes < 60) {
    return t("timeMinutes", { count: minutes });
  }
  if (hours < 24) {
    return t("timeHours", { count: hours });
  }
  return t("timeDays", { count: days });
}

export function PreviousRequests() {
  const requests = useFeedbackRequests();
  const t = useTranslations("Feedback");

  if (requests.length === 0) {
    return null;
  }

  return (
    <Collapsible.Root defaultOpen={false}>
      <Collapsible.Trigger className="group flex w-full items-center gap-1 text-muted-foreground text-xs hover:text-foreground">
        <IconChevronDown className="size-3.5 transition-transform group-data-[panel-open]:rotate-180" />
        {t("previousTitle", { count: requests.length })}
      </Collapsible.Trigger>
      <Collapsible.Panel className="mt-2 flex flex-col gap-2">
        {requests.map((request) => (
          <div
            className={cn(
              "rounded-none border border-foreground/10 px-3 py-2",
              "text-muted-foreground text-xs"
            )}
            key={request.timestamp}
          >
            <p className="line-clamp-2">
              {request.message.length > 80
                ? `${request.message.slice(0, 80)}…`
                : request.message}
            </p>
            <p className="mt-1 text-[10px] text-muted-foreground/60">
              {formatRelativeTime(request.timestamp, t)}
            </p>
          </div>
        ))}
      </Collapsible.Panel>
    </Collapsible.Root>
  );
}

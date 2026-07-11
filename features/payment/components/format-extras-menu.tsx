"use client";

import {
  IconAdjustmentsHorizontal,
  IconChevronDown,
} from "@tabler/icons-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { PaymentFormat } from "@/features/payment/format";
import {
  OPTIONAL_FIELDS,
  OPTIONAL_FIELDS_BY_FORMAT,
  type OptionalFieldKey,
} from "@/features/payment/optional-fields";

interface FormatExtrasMenuProps {
  format: PaymentFormat;
  isVisible: (key: OptionalFieldKey) => boolean;
  onToggle: (key: OptionalFieldKey) => void;
}

export function FormatExtrasMenu({
  format,
  isVisible,
  onToggle,
}: FormatExtrasMenuProps) {
  const t = useTranslations("PaymentForm");
  const keys = OPTIONAL_FIELDS_BY_FORMAT[format];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label={t("optionalFields.menuAria")}
        render={
          <Button variant="ghost">
            <IconAdjustmentsHorizontal className="size-4" />
            <span className="hidden sm:inline">{t("optionalFields.menu")}</span>
            <IconChevronDown className="size-3" />
          </Button>
        }
      />
      <DropdownMenuContent align="end" className="min-w-52">
        <DropdownMenuGroup>
          <DropdownMenuLabel>{t("optionalFields.title")}</DropdownMenuLabel>
          {keys.map((key) => (
            <DropdownMenuCheckboxItem
              checked={isVisible(key)}
              key={key}
              onCheckedChange={() => onToggle(key)}
            >
              {t(OPTIONAL_FIELDS[key].labelKey)}
            </DropdownMenuCheckboxItem>
          ))}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

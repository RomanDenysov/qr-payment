"use client";

import { IconCheck, IconX } from "@tabler/icons-react";
import { useTranslations } from "next-intl";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { maskIban } from "@/lib/utils";
import type { ParsedRow } from "../csv-parser";

interface PreviewTableProps {
  rows: ParsedRow[];
}

export function PreviewTable({ rows }: PreviewTableProps) {
  const validCount = rows.filter((r) => r.valid).length;
  const invalidCount = rows.length - validCount;
  const t = useTranslations("Bulk");
  const tHistory = useTranslations("History");

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-3 text-xs">
        <span className="text-muted-foreground">
          {t("total")}{" "}
          <span className="font-medium text-foreground">{rows.length}</span>
        </span>
        <span className="text-green-600 dark:text-green-400">
          {t("valid")} {validCount}
        </span>
        {invalidCount > 0 && (
          <span className="text-destructive">
            {t("invalid")} {invalidCount}
          </span>
        )}
      </div>

      <div className="max-h-80 overflow-auto border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-8">#</TableHead>
              <TableHead className="w-8" />
              <TableHead>IBAN</TableHead>
              <TableHead>{tHistory("amount")}</TableHead>
              <TableHead>{t("noteColumn")}</TableHead>
              <TableHead>{t("errorColumn")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((parsed) => (
              <TableRow key={parsed.row.rowNumber}>
                <TableCell className="text-muted-foreground">
                  {parsed.row.rowNumber}
                </TableCell>
                <TableCell>
                  {parsed.valid ? (
                    <IconCheck className="size-4 text-green-600 dark:text-green-400" />
                  ) : (
                    <IconX className="size-4 text-destructive" />
                  )}
                </TableCell>
                <TableCell className="font-mono">
                  {maskIban(parsed.row.iban)}
                </TableCell>
                <TableCell>{parsed.row.amount.toFixed(2)} EUR</TableCell>
                <TableCell className="max-w-32 truncate text-muted-foreground">
                  {parsed.row.paymentNote ?? "-"}
                </TableCell>
                <TableCell className="max-w-48 text-destructive">
                  {parsed.errors.join(", ") || "-"}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

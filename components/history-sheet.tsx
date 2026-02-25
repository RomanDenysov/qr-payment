"use client";

import {
  IconBookmark,
  IconBookmarkOff,
  IconCheck,
  IconHistory,
  IconTrash,
  IconX,
} from "@tabler/icons-react";
import { track } from "@vercel/analytics";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { PaymentRecord } from "@/features/payment/schema";
import { usePaymentActions, usePaymentHistory } from "@/features/payment/store";
import { cn, maskIban } from "@/lib/utils";

export function HistorySheet({ onOpen }: { onOpen?: () => void } = {}) {
  const [open, setOpen] = useState(false);
  const [namingId, setNamingId] = useState<string | null>(null);
  const [nameInput, setNameInput] = useState("");
  const history = usePaymentHistory();
  const {
    clearHistory,
    loadFromStorage,
    removeFromStorage,
    nameEntry,
    unnameEntry,
  } = usePaymentActions();
  const t = useTranslations("History");
  const locale = useLocale();

  const named: PaymentRecord[] = [];
  const unnamed: PaymentRecord[] = [];
  for (const p of history) {
    if (p.name) {
      named.push(p);
    } else {
      unnamed.push(p);
    }
  }
  const sorted = [...named, ...unnamed];

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat(locale, {
      timeZone: "Europe/Bratislava",
      dateStyle: "short",
      timeStyle: "short",
    })
      .format(date)
      .replace(/\.\s+/g, ".");
  };

  const startNaming = (id: string, currentName?: string) => {
    setNamingId(id);
    setNameInput(currentName ?? "");
  };

  const confirmName = () => {
    if (!namingId) {
      return;
    }
    const trimmed = nameInput.trim();
    if (trimmed) {
      nameEntry(namingId, trimmed);
      track("history_entry_named");
    }
    setNamingId(null);
    setNameInput("");
  };

  return (
    <Sheet
      onOpenChange={(next) => {
        setOpen(next);
        if (next) {
          onOpen?.();
        } else {
          setNamingId(null);
        }
      }}
      open={open}
    >
      <SheetTrigger
        className={cn(
          buttonVariants({ variant: "ghost", size: "sm" }),
          "h-8 text-sm md:h-7 md:text-xs"
        )}
      >
        <IconHistory />
        {t("title")}
      </SheetTrigger>
      <SheetContent className="w-full data-[side=right]:w-full data-[side=right]:sm:max-w-lg">
        <SheetHeader>
          <div className="flex items-center gap-2">
            <SheetTitle>{t("title")}</SheetTitle>
            <Badge variant="secondary">{history.length}</Badge>
          </div>
        </SheetHeader>

        <div className="flex h-full flex-col items-center justify-center p-0.5">
          {history.length > 0 && (
            <AlertDialog>
              <AlertDialogTrigger
                render={
                  <Button className="w-full" size="sm" variant="destructive">
                    <IconTrash />
                    {t("clearHistory")}
                  </Button>
                }
              />
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>
                    {t("clearHistoryConfirm")}
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    {t("clearHistoryDescription")}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
                  <AlertDialogAction onClick={() => clearHistory()}>
                    {t("delete")}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}

          {history.length === 0 ? (
            <p className="text-center text-muted-foreground text-xs">
              {t("empty")}
            </p>
          ) : (
            <div className="w-full flex-1 overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="align-middle">{t("date")}</TableHead>
                    <TableHead className="align-middle">{t("iban")}</TableHead>
                    <TableHead className="align-middle">
                      {t("amount")}
                    </TableHead>
                    <TableHead className="text-right align-middle">
                      {t("actions")}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sorted.map((entry) => (
                    <TableRow
                      className={entry.name ? "bg-accent/50" : undefined}
                      key={entry.id}
                    >
                      <TableCell className="align-middle text-xs tracking-tighter">
                        <div className="flex flex-col gap-0.5">
                          {entry.name ? (
                            <span className="font-medium">{entry.name}</span>
                          ) : (
                            formatDate(entry.createdAt)
                          )}
                          {(entry.format ?? "bysquare") === "epc" && (
                            <Badge className="w-fit" variant="outline">
                              EPC
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="align-middle text-xs">
                        {maskIban(entry.iban)}
                      </TableCell>
                      <TableCell className="align-middle text-xs">
                        {entry.amount.toFixed(2)} {entry.currency ?? "EUR"}
                      </TableCell>
                      <TableCell className="text-right align-middle">
                        {namingId === entry.id ? (
                          <div className="flex items-center gap-1">
                            <Input
                              className="h-9 w-28 text-sm"
                              maxLength={30}
                              onChange={(e) => setNameInput(e.target.value)}
                              onKeyDown={(e) =>
                                e.key === "Enter" && confirmName()
                              }
                              placeholder={t("namePlaceholder")}
                              value={nameInput}
                            />
                            <Button
                              aria-label={t("save")}
                              className="size-9 p-0"
                              disabled={!nameInput.trim()}
                              onClick={confirmName}
                              size="sm"
                              variant="ghost"
                            >
                              <IconCheck className="size-4" />
                            </Button>
                          </div>
                        ) : (
                          <div className="flex justify-end gap-1">
                            {entry.name ? (
                              <Button
                                aria-label={t("unpin")}
                                className="size-9 p-0"
                                onClick={() => {
                                  unnameEntry(entry.id);
                                  track("history_entry_unnamed");
                                }}
                                size="sm"
                                variant="ghost"
                              >
                                <IconBookmarkOff className="size-4" />
                              </Button>
                            ) : (
                              <Button
                                aria-label={t("pin")}
                                className="size-9 p-0"
                                onClick={() => startNaming(entry.id)}
                                size="sm"
                                variant="ghost"
                              >
                                <IconBookmark className="size-4" />
                              </Button>
                            )}
                            <Button
                              aria-label={t("fillForm")}
                              className="size-9 p-0"
                              onClick={() => {
                                loadFromStorage(entry.id);
                                track("history_item_selected");
                                setOpen(false);
                              }}
                              size="sm"
                              variant="ghost"
                            >
                              <IconCheck className="size-4" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger
                                render={
                                  <Button
                                    aria-label={t("deleteRecord")}
                                    className="size-9 p-0"
                                    size="sm"
                                    variant="ghost"
                                  >
                                    <IconX className="size-4" />
                                  </Button>
                                }
                              />
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>
                                    {t("deleteRecordConfirm")}
                                  </AlertDialogTitle>
                                  <AlertDialogDescription>
                                    {t("deleteRecordDescription")}
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>
                                    {t("cancel")}
                                  </AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => removeFromStorage(entry.id)}
                                  >
                                    {t("delete")}
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

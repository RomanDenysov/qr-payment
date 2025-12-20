"use client";

import { IconTrash } from "@tabler/icons-react";
import { useEffect, useState } from "react";
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
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { PaymentData } from "@/lib/generate-qr-image";
import {
  clearPaymentHistory,
  deletePaymentFromHistory,
  getPaymentHistory,
  maskIban,
  type PaymentHistoryEntry,
} from "@/lib/payment-history";

type HistorySheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectPayment: (payment: PaymentData) => void;
};

export function HistorySheet({
  open,
  onOpenChange,
  onSelectPayment,
}: HistorySheetProps) {
  const [history, setHistory] = useState<PaymentHistoryEntry[]>([]);

  useEffect(() => {
    if (open) {
      setHistory(getPaymentHistory());
    }
  }, [open]);

  const handleDelete = (id: string) => {
    deletePaymentFromHistory(id);
    setHistory(getPaymentHistory());
  };

  const handleClear = () => {
    clearPaymentHistory();
    setHistory([]);
  };

  const handleUse = (entry: PaymentHistoryEntry) => {
    onSelectPayment(entry);
    onOpenChange(false);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("sk-SK", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  return (
    <Sheet onOpenChange={onOpenChange} open={open}>
      <SheetContent className="w-full sm:max-w-md" side="right">
        <SheetHeader>
          <div className="flex items-center justify-between">
            <SheetTitle>História</SheetTitle>
            <Badge variant="secondary">{history.length}</Badge>
          </div>
        </SheetHeader>

        <div className="mt-4 flex flex-col gap-4">
          {history.length > 0 && (
            <AlertDialog>
              <AlertDialogTrigger
                render={
                  <Button size="sm" variant="destructive">
                    <IconTrash />
                    Vymazať históriu
                  </Button>
                }
              />
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Vymazať históriu?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Táto akcia sa nedá vrátiť späť. Všetky uložené platby budú
                    odstránené.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Zrušiť</AlertDialogCancel>
                  <AlertDialogAction onClick={handleClear}>
                    Vymazať
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}

          {history.length === 0 ? (
            <p className="text-center text-muted-foreground text-xs">
              Žiadna história
            </p>
          ) : (
            <div className="overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Dátum</TableHead>
                    <TableHead>IBAN</TableHead>
                    <TableHead>Suma</TableHead>
                    <TableHead className="text-right">Akcie</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {history.map((entry) => (
                    <TableRow key={entry.id}>
                      <TableCell className="text-xs">
                        {formatDate(entry.createdAt)}
                      </TableCell>
                      <TableCell className="text-xs">
                        {maskIban(entry.iban)}
                      </TableCell>
                      <TableCell className="text-xs">
                        {entry.amount.toFixed(2)} EUR
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            onClick={() => handleUse(entry)}
                            size="xs"
                            variant="ghost"
                          >
                            Použiť
                          </Button>
                          <Button
                            onClick={() => handleDelete(entry.id)}
                            size="xs"
                            variant="ghost"
                          >
                            <IconTrash />
                          </Button>
                        </div>
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

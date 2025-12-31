"use client";

import { IconHistory, IconTrash } from "@tabler/icons-react";
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
import { cn, maskIban } from "@/lib/utils";
import {
  usePaymentActions,
  usePaymentHistory,
} from "@/store/payment-history-store";

export function HistorySheet() {
  const [open, setOpen] = useState(false);
  const history = usePaymentHistory();
  const { clearHistory } = usePaymentActions();

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("sk-SK", {
      timeZone: "Europe/Bratislava",
      dateStyle: "short",
      timeStyle: "short",
    })
      .format(date)
      .replace(/\.\s+/g, ".");
  };

  return (
    <Sheet onOpenChange={setOpen} open={open}>
      <SheetTrigger
        className={cn(buttonVariants({ variant: "link", size: "sm" }))}
      >
        <IconHistory />
        História
      </SheetTrigger>
      <SheetContent className="w-full data-[side=right]:w-full data-[side=right]:sm:max-w-lg">
        <SheetHeader>
          <div className="flex items-center gap-2">
            <SheetTitle>História</SheetTitle>
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
                  <AlertDialogAction onClick={() => clearHistory()}>
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
            <div className="w-full flex-1 overflow-auto">
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
                      <TableCell className="text-xs tracking-tighter">
                        {formatDate(entry.createdAt)}
                      </TableCell>
                      <TableCell className="flex items-center gap-0.5 text-xs">
                        {maskIban(entry.iban)}
                      </TableCell>
                      <TableCell className="text-xs">
                        {entry.amount.toFixed(2)} EUR
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2" />
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

"use client";

import { IconCheck, IconHistory, IconTrash, IconX } from "@tabler/icons-react";
import { useState } from "react";
import {
  usePaymentActions,
  usePaymentHistory,
} from "@/app/features/payment/store";
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

export function HistorySheet() {
  const [open, setOpen] = useState(false);
  const history = usePaymentHistory();
  const { clearHistory, loadFromStorage, removeFromStorage } =
    usePaymentActions();

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
                    <TableHead className="align-middle">Dátum</TableHead>
                    <TableHead className="align-middle">IBAN</TableHead>
                    <TableHead className="align-middle">Suma</TableHead>
                    <TableHead className="text-right align-middle">
                      Akcie
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {history.map((entry) => (
                    <TableRow key={entry.id}>
                      <TableCell className="align-middle text-xs tracking-tighter">
                        {formatDate(entry.createdAt)}
                      </TableCell>
                      <TableCell className="align-middle text-xs">
                        {maskIban(entry.iban)}
                      </TableCell>
                      <TableCell className="align-middle text-xs">
                        {entry.amount.toFixed(2)} EUR
                      </TableCell>
                      <TableCell className="text-right align-middle">
                        <div className="flex justify-end gap-1">
                          <Button
                            className="size-7 p-0"
                            onClick={() => {
                              loadFromStorage(entry.id);
                              setOpen(false);
                            }}
                            size="sm"
                            title="Naplniť formulár"
                            variant="ghost"
                          >
                            <IconCheck className="size-3" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger
                              render={
                                <Button
                                  className="size-7 p-0"
                                  size="sm"
                                  title="Vymazať"
                                  variant="ghost"
                                >
                                  <IconX className="size-3" />
                                </Button>
                              }
                            />
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  Vymazať záznam?
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  Táto akcia sa nedá vrátiť späť. Záznam bude
                                  odstránený z histórie.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Zrušiť</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => removeFromStorage(entry.id)}
                                >
                                  Vymazať
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
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

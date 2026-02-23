"use client";

import { Accordion as AccordionPrimitive } from "@base-ui/react/accordion";
import { IconChevronDown } from "@tabler/icons-react";
import { cn } from "@/lib/utils";

function Accordion({ className, ...props }: AccordionPrimitive.Root.Props) {
  return (
    <AccordionPrimitive.Root
      className={cn("flex w-full flex-col", className)}
      {...props}
    />
  );
}

function AccordionItem({ className, ...props }: AccordionPrimitive.Item.Props) {
  return (
    <AccordionPrimitive.Item
      className={cn("not-last:border-b", className)}
      {...props}
    />
  );
}

function AccordionTrigger({
  className,
  children,
  ...props
}: AccordionPrimitive.Trigger.Props) {
  return (
    <AccordionPrimitive.Header className="flex">
      <AccordionPrimitive.Trigger
        className={cn(
          "group flex flex-1 cursor-pointer items-center justify-between gap-2 py-3 text-left font-medium text-sm transition-colors hover:text-primary",
          className
        )}
        {...props}
      >
        {children}
        <IconChevronDown className="size-4 shrink-0 text-muted-foreground transition-transform duration-200 group-aria-expanded:rotate-180" />
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  );
}

function AccordionContent({
  className,
  children,
  ...props
}: AccordionPrimitive.Panel.Props) {
  return (
    <AccordionPrimitive.Panel
      className="overflow-hidden transition-all duration-200 data-[ending-style]:h-0 data-[starting-style]:h-0"
      {...props}
    >
      <div
        className={cn(
          "pb-3 text-muted-foreground text-sm leading-relaxed",
          className
        )}
      >
        {children}
      </div>
    </AccordionPrimitive.Panel>
  );
}

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent };

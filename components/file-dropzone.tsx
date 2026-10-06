"use client";

import { IconUpload } from "@tabler/icons-react";
import { type ReactNode, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface FileDropzoneProps {
  /** Passed to the file input, e.g. ".csv,text/csv" or "image/*". */
  accept: string;
  /** Format icon shown left of the upload arrow. */
  icon: ReactNode;
  title: string;
  description: string;
  onFile: (file: File | undefined) => void;
  disabled?: boolean;
}

/** Click-or-drop area for a single file. Type and size checks are the caller's. */
export function FileDropzone({
  accept,
  icon,
  title,
  description,
  onFile,
  disabled,
}: FileDropzoneProps) {
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <button
      className={cn(
        "flex w-full cursor-pointer flex-col items-center justify-center gap-3 border-2 border-dashed p-8 transition-colors",
        dragging
          ? "border-primary bg-primary/5"
          : "border-muted-foreground/25 hover:border-muted-foreground/50",
        disabled && "pointer-events-none opacity-50"
      )}
      onClick={() => inputRef.current?.click()}
      onDragLeave={() => setDragging(false)}
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDrop={(e) => {
        e.preventDefault();
        setDragging(false);
        onFile(e.dataTransfer.files[0]);
      }}
      type="button"
    >
      <div className="flex items-center gap-2 text-muted-foreground">
        {icon}
        <IconUpload className="size-5" />
      </div>
      <div className="text-center text-sm">
        <p className="font-medium">{title}</p>
        <p className="text-muted-foreground text-xs">{description}</p>
      </div>
      <input
        accept={accept}
        className="hidden"
        disabled={disabled}
        onChange={(e) => {
          onFile(e.target.files?.[0]);
          // Lets the same file be picked again after an error.
          e.target.value = "";
        }}
        ref={inputRef}
        type="file"
      />
    </button>
  );
}

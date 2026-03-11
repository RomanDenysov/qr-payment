import { CopyButton } from "./copy-button";

interface CodeBlockProps {
  code: string;
  language?: string;
}

export function CodeBlock({ code, language }: CodeBlockProps) {
  return (
    <div className="group/code relative">
      {language && (
        <span className="absolute top-2 left-3 select-none font-medium text-[10px] text-muted-foreground uppercase">
          {language}
        </span>
      )}
      <pre className="overflow-x-auto bg-foreground/[0.04] p-3 pt-7 ring-1 ring-foreground/5 dark:bg-foreground/[0.06]">
        <code className="text-xs leading-relaxed">{code}</code>
      </pre>
      <CopyButton text={code} />
    </div>
  );
}

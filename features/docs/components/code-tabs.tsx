"use client";

import { useState } from "react";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { codeExamples } from "../data/code-examples";
import { CodeBlock } from "./code-block";

const OPTIONS = codeExamples.map((ex) => ({
  value: ex.language,
  label: ex.label,
}));

export function CodeTabs() {
  const [language, setLanguage] = useState("curl");

  const active = codeExamples.find((ex) => ex.language === language);

  return (
    <div className="space-y-3">
      <SegmentedControl
        onChange={setLanguage}
        options={OPTIONS}
        value={language}
      />
      {active && <CodeBlock code={active.code} />}
    </div>
  );
}

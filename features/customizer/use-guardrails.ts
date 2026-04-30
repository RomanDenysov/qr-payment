import { useMemo } from "react";
import { checkGuardrails, type Guardrail } from "./guardrails";
import { useCustomizerConfig } from "./store";

export function useGuardrails(): Guardrail[] {
  const config = useCustomizerConfig();
  return useMemo(() => checkGuardrails(config), [config]);
}

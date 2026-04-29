"use client";

import { IconAlertTriangle, IconInfoCircle } from "@tabler/icons-react";
import { track } from "@vercel/analytics";
import { useTranslations } from "next-intl";
import { useEffect, useMemo, useRef } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CenterTextEditor } from "@/features/customizer/components/center-text-editor";
import {
  DOT_STYLE_LABEL_KEYS,
  DotStyleSelector,
} from "@/features/customizer/components/dot-style-selector";
import { LogoUploader } from "@/features/customizer/components/logo-uploader";
import { cn } from "@/lib/utils";
import {
  checkGuardrails,
  type Guardrail,
  getResolvedMaxLogoSizePct,
} from "../guardrails";
import { useCustomizerActions, useCustomizerConfig } from "../store";
import {
  type CustomizerConfig,
  fillPrimaryColor,
  OVERLAY_POSITION_SHORT,
  type OverlayPosition,
} from "../types";
import { FrameEditor } from "./controls/frame-editor";
import { GradientEditor } from "./controls/gradient-editor";
import { LogoSizeSlider } from "./controls/logo-size-slider";
import { PositionPicker } from "./controls/position-picker";

interface CustomizerControlsProps {
  defaultOpen?: string[];
  className?: string;
}

const DEFAULT_OPEN = ["colors"];

export function CustomizerControls({
  defaultOpen = DEFAULT_OPEN,
  className,
}: CustomizerControlsProps) {
  const config = useCustomizerConfig();
  const { update } = useCustomizerActions();
  const t = useTranslations("Studio");
  const tBranding = useTranslations("Branding");

  const guardrails = useMemo(() => checkGuardrails(config), [config]);
  const maxLogoSize = useMemo(
    () => getResolvedMaxLogoSizePct(config),
    [config]
  );

  return (
    <Accordion
      className={cn("flex flex-col gap-3", className)}
      defaultValue={defaultOpen}
      multiple
    >
      <GuardrailWarnings guardrails={guardrails} />

      <Section
        chip={
          <ColorChips
            bg={fillPrimaryColor(config.bgFill)}
            fg={fillPrimaryColor(config.fgFill)}
            fgKind={config.fgFill.kind}
          />
        }
        title={t("section.colors")}
        value="colors"
      >
        <GradientEditor
          contrastWith={fillPrimaryColor(config.bgFill)}
          label={t("fgColor")}
          onChange={(fgFill) => update({ fgFill })}
          value={config.fgFill}
        />
        <GradientEditor
          contrastWith={fillPrimaryColor(config.fgFill)}
          label={t("bgColor")}
          onChange={(bgFill) => update({ bgFill })}
          value={config.bgFill}
        />
      </Section>

      <Section
        chip={<span>{tBranding(DOT_STYLE_LABEL_KEYS[config.dotStyle])}</span>}
        title={t("section.dots")}
        value="dots"
      >
        <DotStyleSelector
          hideHeading
          onChange={(dotStyle) => update({ dotStyle })}
          value={config.dotStyle}
        />
      </Section>

      <Section
        chip={textChip(config, t)}
        title={t("section.text")}
        value="text"
      >
        <label className="flex items-center gap-2 text-sm">
          <input
            checked={config.centerTextEnabled}
            className="size-4 accent-primary"
            onChange={(e) => {
              const enabled = e.target.checked;
              if (enabled && !config.centerText.trim()) {
                update({
                  centerTextEnabled: true,
                  centerText: tBranding("centerTextPlaceholder"),
                });
                return;
              }
              update({ centerTextEnabled: enabled });
            }}
            type="checkbox"
          />
          <span className="font-medium">{t("textEnabled")}</span>
        </label>
        {config.centerTextEnabled && (
          <>
            <CenterTextEditor
              hideHeading
              onChange={(centerText) => update({ centerText })}
              onTextBoldChange={(centerTextBold) => update({ centerTextBold })}
              onTextFontChange={(centerTextFont) => update({ centerTextFont })}
              onTextSizeChange={(centerTextSize) => update({ centerTextSize })}
              textBold={config.centerTextBold}
              textFont={config.centerTextFont}
              textSize={config.centerTextSize}
              value={config.centerText}
            />
            <PositionPicker
              label={t("positionText")}
              onChange={(centerTextPosition) => update({ centerTextPosition })}
              value={config.centerTextPosition}
            />
          </>
        )}
      </Section>

      <Section
        chip={logoChip(config, t)}
        title={t("section.logo")}
        value="logo"
      >
        <LogoUploader
          onChange={(logo) => update({ logo })}
          value={config.logo}
        />
        {config.logo && (
          <>
            <LogoSizeSlider
              max={maxLogoSize}
              onChange={(logoSizePct) => update({ logoSizePct })}
              value={config.logoSizePct}
            />
            <PositionPicker
              label={t("positionLogo")}
              onChange={(logoPosition) => update({ logoPosition })}
              value={config.logoPosition}
            />
          </>
        )}
      </Section>

      <Section
        chip={frameChip(config, t)}
        title={t("section.frame")}
        value="frame"
      >
        <FrameEditor
          onChange={(frame) => update({ frame })}
          value={config.frame}
        />
      </Section>
    </Accordion>
  );
}

interface SectionProps {
  value: string;
  title: string;
  chip: React.ReactNode;
  children: React.ReactNode;
}

function Section({ value, title, chip, children }: SectionProps) {
  return (
    <AccordionItem
      className="border border-border not-last:border-b bg-card"
      value={value}
    >
      <AccordionTrigger className="px-4">
        <span className="flex flex-1 items-center justify-between gap-3">
          <span className="font-medium text-sm">{title}</span>
          <span className="flex items-center gap-2 text-muted-foreground text-xs">
            {chip}
          </span>
        </span>
      </AccordionTrigger>
      <AccordionContent className="flex flex-col gap-3 px-4 text-foreground">
        {children}
      </AccordionContent>
    </AccordionItem>
  );
}

function ColorChips({
  fg,
  bg,
  fgKind,
}: {
  fg: string;
  bg: string;
  fgKind: "solid" | "linear" | "radial";
}) {
  return (
    <span className="flex items-center gap-1">
      <Swatch color={fg} />
      <Swatch color={bg} />
      {fgKind !== "solid" && (
        <span className="font-mono text-[10px] uppercase">{fgKind}</span>
      )}
    </span>
  );
}

function Swatch({ color }: { color: string }) {
  return (
    <span
      className="inline-block size-3 ring-1 ring-foreground/20"
      style={{ backgroundColor: color }}
    />
  );
}

function textChip(
  config: CustomizerConfig,
  t: (key: string) => string
): React.ReactNode {
  if (!config.centerTextEnabled) {
    return <span>{t("off")}</span>;
  }
  const text = config.centerText.split("\n").join(" ");
  if (!text.trim()) {
    return <span>{t("empty")}</span>;
  }
  const trimmed = text.length > 14 ? `${text.slice(0, 14)}…` : text;
  return (
    <span>
      &quot;{trimmed}&quot; · {posLabel(config.centerTextPosition, t)}
    </span>
  );
}

function logoChip(
  config: CustomizerConfig,
  t: (key: string) => string
): React.ReactNode {
  if (!config.logo) {
    return <span>{t("empty")}</span>;
  }
  return (
    <span>
      {config.logoSizePct}% · {posLabel(config.logoPosition, t)}
    </span>
  );
}

function frameChip(
  config: CustomizerConfig,
  t: (key: string) => string
): React.ReactNode {
  if (!config.frame.enabled) {
    return <span>{t("off")}</span>;
  }
  const parts: string[] = [];
  if (config.frame.title) {
    parts.push("T");
  }
  if (config.frame.caption) {
    parts.push("C");
  }
  parts.push(`${config.frame.borderWidth}px`);
  return <span>{parts.join(" · ")}</span>;
}

function posLabel(p: OverlayPosition, t: (key: string) => string): string {
  if (p === "center") {
    return t("centerShort");
  }
  return OVERLAY_POSITION_SHORT[p];
}

function GuardrailWarnings({ guardrails }: { guardrails: Guardrail[] }) {
  const tBranding = useTranslations();
  const trackedKeys = useRef<Set<string>>(new Set());

  useEffect(() => {
    for (const g of guardrails) {
      if (trackedKeys.current.has(g.key)) {
        continue;
      }
      trackedKeys.current.add(g.key);
      track("guardrail_warning_shown", {
        key: g.key,
        severity: g.severity,
      });
    }
  }, [guardrails]);

  if (guardrails.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-col gap-2">
      {guardrails.map((g) => (
        <Alert
          className={cn(
            "items-start px-3 py-2",
            g.severity === "warning"
              ? "border-destructive/50 bg-destructive/5 text-destructive"
              : "border-amber-500/40 bg-amber-500/5 text-amber-700 dark:text-amber-400"
          )}
          key={g.key}
        >
          {g.severity === "warning" ? (
            <IconAlertTriangle className="size-4" />
          ) : (
            <IconInfoCircle className="size-4" />
          )}
          <AlertDescription className="text-xs leading-relaxed">
            {tBranding(g.i18nKey, g.values)}
          </AlertDescription>
        </Alert>
      ))}
    </div>
  );
}

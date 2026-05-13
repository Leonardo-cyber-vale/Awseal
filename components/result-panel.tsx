"use client";

import { useState } from "react";
import {
  CheckCircle2,
  Clipboard,
  Copy,
  ShieldAlert,
  Sparkles,
} from "lucide-react";

import { motion } from "framer-motion";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

import {
  RISK_STYLES,
  SECTION_META,
} from "@/lib/constants";

import type {
  AnalysisSectionKey,
  FinalAnalysis,
  RiskLevel,
} from "@/lib/types";

import { cn } from "@/lib/utils";

interface ResultPanelProps {
  analysis: FinalAnalysis;
}

const LEGACY_RISK_LEVELS: Record<
  string,
  RiskLevel
> = {
  low: "Baixo",
  Low: "Baixo",
  LOW: "Baixo",

  medium: "Medio",
  Medium: "Medio",
  MEDIUM: "Medio",

  high: "Alto",
  High: "Alto",
  HIGH: "Alto",

  critical: "Critico",
  Critical: "Critico",
  CRITICAL: "Critico",
};

function normalizeRiskLevel(
  riskLevel?: string
): RiskLevel {
  if (!riskLevel) {
    return "Medio";
  }

  if (riskLevel in LEGACY_RISK_LEVELS) {
    return LEGACY_RISK_LEVELS[riskLevel];
  }

  switch (riskLevel.toUpperCase()) {
    case "LOW":
      return "Baixo";

    case "MEDIUM":
      return "Medio";

    case "HIGH":
      return "Alto";

    case "CRITICAL":
      return "Critico";

    default:
      return "Medio";
  }
}

export function ResultPanel({
  analysis,
}: ResultPanelProps) {
  const [activeSection, setActiveSection] =
    useState<AnalysisSectionKey>(
      "overview"
    );

  const [copied, setCopied] =
    useState(false);

  // =========================
  // FIX SEVERITY
  // =========================

  const normalizedRiskLevel =
    normalizeRiskLevel(
      analysis.riskLevel ||
        analysis.severity
    );

  const riskStyle =
    RISK_STYLES[
      normalizedRiskLevel
    ] ?? RISK_STYLES["Medio"];

  // =========================
  // FALLBACKS
  // =========================

  const overview =
    analysis.overview ??
    analysis.summary ??
    "Analise concluida.";

  const highlightedEvidence =
    analysis.highlightedEvidence ??
    [];

  const score =
    analysis.score ??
    (normalizedRiskLevel ===
    "Critico"
      ? 95
      : normalizedRiskLevel ===
        "Alto"
      ? 78
      : normalizedRiskLevel ===
        "Baixo"
      ? 12
      : 45);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(
      overview
    );

    setCopied(true);

    setTimeout(() => {
      setCopied(false);
    }, 1800);
  };

  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 18,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      transition={{
        duration: 0.45,
      }}
      className="grid gap-4 lg:grid-cols-[220px_minmax(0,1fr)]"
    >
      <aside className="rounded-[28px] border border-white/70 bg-white/86 p-5 shadow-panel dark:border-awseal-950/60 dark:bg-slate-950/80">
        <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-awseal-100 bg-awseal-50 px-3 py-1 text-xs font-semibold text-awseal-700">
          <Clipboard className="size-3.5" />
          Mapa da analise
        </div>

        <div className="space-y-2">
          {SECTION_META.map(
            (section) => {
              const Icon =
                section.icon;

              const isActive =
                activeSection ===
                section.key;

              return (
                <button
                  key={section.key}
                  type="button"
                  onClick={() => {
                    setActiveSection(
                      section.key
                    );

                    document
                      .getElementById(
                        section.key
                      )
                      ?.scrollIntoView({
                        behavior:
                          "smooth",
                      });
                  }}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-2xl border px-3 py-3 text-left text-sm font-medium transition",
                    isActive
                      ? "border-awseal-200 bg-awseal-50 text-awseal-700"
                      : "border-transparent text-slate-600 hover:border-slate-200 hover:bg-slate-50"
                  )}
                >
                  <Icon className="size-4" />

                  <span>
                    {section.label}
                  </span>
                </button>
              );
            }
          )}
        </div>
      </aside>

      <div className="rounded-[28px] border border-white/70 bg-white/86 p-5 shadow-panel dark:border-awseal-950/60 dark:bg-slate-950/80">
        <div className="mb-5 flex flex-col gap-3 border-b border-slate-100 pb-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 text-sm font-semibold text-slate-900">
              <CheckCircle2 className="size-4 text-emerald-500" />

              Analise concluida
            </div>

            <p className="text-sm text-slate-500">
              Revisao AWS IAM.
            </p>
          </div>

          <Button
            variant="secondary"
            size="sm"
            type="button"
            onClick={handleCopy}
          >
            {copied ? (
              <CheckCircle2 className="size-4" />
            ) : (
              <Copy className="size-4" />
            )}

            {copied
              ? "Copiado"
              : "Copiar"}
          </Button>
        </div>

        <div className="grid gap-4 xl:grid-cols-[minmax(0,1.6fr)_220px]">
          <Card
            id="overview"
            className="overflow-hidden border-slate-200/80 bg-white/95"
          >
            <div className="border-b border-slate-100 px-5 py-4">
              <div className="inline-flex items-center gap-2 text-sm font-semibold text-awseal-700">
                <Sparkles className="size-4" />

                Visao geral
              </div>
            </div>

            <div className="space-y-4 px-5 py-5">
              <p className="text-sm leading-7 text-slate-700">
                {overview}
              </p>

              {highlightedEvidence.length >
              0 ? (
                <div className="flex flex-wrap gap-2">
                  {highlightedEvidence.map(
                    (item) => (
                      <Badge
                        key={item}
                        variant="secondary"
                        className="rounded-full"
                      >
                        {item}
                      </Badge>
                    )
                  )}
                </div>
              ) : null}
            </div>
          </Card>

          <Card
            className={cn(
              "relative overflow-hidden border p-5",
              riskStyle.panel
            )}
          >
            <div className="relative flex h-full flex-col justify-between gap-6">
              <div className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600">
                <ShieldAlert className="size-4" />

                Nivel de risco
              </div>

              <div className="space-y-4">
                <Badge
                  className={cn(
                    "w-fit text-sm",
                    riskStyle.badge
                  )}
                >
                  {
                    normalizedRiskLevel
                  }
                </Badge>

                <div>
                  <p className="text-3xl font-extrabold tracking-[-0.04em] text-slate-950">
                    {score}
                  </p>

                  <p className="text-sm text-slate-500">
                    Pontuacao AWS IAM
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </motion.div>
  );
}
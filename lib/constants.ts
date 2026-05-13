import {
  AlertTriangle,
  CheckCircle2,
  FileWarning,
  Search,
  ShieldAlert,
} from "lucide-react";

import type { AnalysisSectionKey, RiskLevel } from "@/lib/types";

export const APP_NAME = "Awseal";
export const MAX_INPUT_CHARS = 10000;

export const DEFAULT_EDITOR_VALUE = `{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": "*",
      "Resource": "*"
    }
  ]
}`;

export const SECTION_META: Array<{
  key: AnalysisSectionKey;
  label: string;
  icon: typeof ShieldAlert;
}> = [
  { key: "overview", label: "Visao geral", icon: CheckCircle2 },
  { key: "securityRisk", label: "Risco de seguranca", icon: ShieldAlert },
  { key: "probableCause", label: "Causa provavel", icon: Search },
  { key: "howToFix", label: "Como corrigir", icon: FileWarning },
  { key: "bestPractices", label: "Boas praticas", icon: AlertTriangle },
];

export const RISK_STYLES: Record<
  RiskLevel,
  {
    badge: string;
    panel: string;
    glow: string;
  }
> = {
  Baixo: {
    badge:
      "border-emerald-200/80 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-200",
    panel:
      "border-emerald-200/80 bg-emerald-50/80 dark:border-emerald-500/30 dark:bg-emerald-500/10",
    glow: "from-emerald-400/15 via-emerald-200/0",
  },
  Medio: {
    badge:
      "border-amber-200/80 bg-amber-50 text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200",
    panel:
      "border-amber-200/80 bg-amber-50/80 dark:border-amber-500/30 dark:bg-amber-500/10",
    glow: "from-amber-400/15 via-amber-200/0",
  },
  Alto: {
    badge:
      "border-orange-200/80 bg-orange-50 text-orange-700 dark:border-orange-500/30 dark:bg-orange-500/10 dark:text-orange-200",
    panel:
      "border-orange-200/80 bg-orange-50/80 dark:border-orange-500/30 dark:bg-orange-500/10",
    glow: "from-orange-400/15 via-orange-200/0",
  },
  Critico: {
    badge:
      "border-rose-200/80 bg-rose-50 text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-200",
    panel:
      "border-rose-200/80 bg-rose-50/80 dark:border-rose-500/30 dark:bg-rose-500/10",
    glow: "from-rose-400/15 via-rose-200/0",
  },
};

export const GITHUB_URL = "https://github.com/awseal/awseal";

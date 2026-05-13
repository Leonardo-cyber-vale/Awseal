import { buildLocalAnalysis } from "@/lib/analysis/detectors";
import { DEFAULT_EDITOR_VALUE } from "@/lib/constants";
import type { FinalAnalysis } from "@/lib/types";

const local = buildLocalAnalysis(DEFAULT_EDITOR_VALUE);

export const SEED_ANALYSIS: FinalAnalysis = {
  riskLevel: local.riskLevel,
  score: local.score,
  inputKind: local.inputKind,
  overview: local.overview,
  securityRisk: local.securityRisk,
  probableCause: local.probableCause,
  howToFix: local.howToFix,
  bestPractices: local.bestPractices,
  findings: local.findings,
  highlightedEvidence: local.highlightedEvidence,
  provider: "local",
  generatedAt: new Date("2026-05-07T12:00:00.000Z").toISOString(),
};

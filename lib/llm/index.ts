import type { FinalAnalysis } from "@/lib/types";

import { buildLocalAnalysis } from "@/lib/analysis/detectors";
import { humanizeWithGroq } from "@/lib/llm/groq";

export async function generateAnalysis(content: string): Promise<FinalAnalysis> {
  const localAnalysis = buildLocalAnalysis(content);
  const humanized = await humanizeWithGroq(content, localAnalysis);

  return {
    riskLevel: localAnalysis.riskLevel,
    score: localAnalysis.score,
    inputKind: localAnalysis.inputKind,
    overview: humanized?.overview ?? localAnalysis.overview,
    securityRisk: humanized?.securityRisk ?? localAnalysis.securityRisk,
    probableCause: humanized?.probableCause ?? localAnalysis.probableCause,
    howToFix: humanized?.howToFix ?? localAnalysis.howToFix,
    bestPractices: humanized?.bestPractices ?? localAnalysis.bestPractices,
    findings: localAnalysis.findings,
    highlightedEvidence: localAnalysis.highlightedEvidence,
    provider: humanized ? "groq" : "local",
    generatedAt: new Date().toISOString(),
  };
}

export type RiskLevel = "Baixo" | "Medio" | "Alto" | "Critico";

export type ParsedInputKind =
  | "iam-policy"
  | "aws-log"
  | "cloudtrail"
  | "json"
  | "plain-text";

export type AnalysisSectionKey =
  | "overview"
  | "securityRisk"
  | "probableCause"
  | "howToFix"
  | "bestPractices";

export interface DetectorFinding {
  id: string;
  title: string;
  severity: RiskLevel;
  evidence: string;
  rationale: string;
  recommendation: string;
  category:
    | "wildcard"
    | "least-privilege"
    | "privilege-escalation"
    | "service-admin"
    | "trust"
    | "logging"
    | "diagnostic";
}

export interface LocalAnalysis {
  riskLevel: RiskLevel;
  score: number;
  charCount: number;
  inputKind: ParsedInputKind;
  findings: DetectorFinding[];
  overview: string;
  securityRisk: string;
  probableCause: string;
  howToFix: string[];
  bestPractices: string[];
  contextForLlm: string;
  highlightedEvidence: string[];
}

export interface FinalAnalysis {
  riskLevel: RiskLevel;
  score: number;
  inputKind: ParsedInputKind;
  overview: string;
  securityRisk: string;
  probableCause: string;
  howToFix: string[];
  bestPractices: string[];
  findings: DetectorFinding[];
  highlightedEvidence: string[];
  provider: "local" | "groq";
  generatedAt: string;
}

export interface AnalyzeRequest {
  content: string;
}

export interface AnalyzeResponse {
  analysis: FinalAnalysis;
}

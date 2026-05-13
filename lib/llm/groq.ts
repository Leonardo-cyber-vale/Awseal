import type { LocalAnalysis } from "@/lib/types";

import { buildGroqMessages } from "@/lib/llm/prompt";

interface GroqCompletionResponse {
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;
}

interface HumanizedSections {
  overview: string;
  securityRisk: string;
  probableCause: string;
  howToFix: string[];
  bestPractices: string[];
}

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const DEFAULT_MODEL = "llama-3.1-8b-instant";

function extractJsonObject(payload: string) {
  const match = payload.match(/\{[\s\S]*\}/);

  if (!match) {
    return null;
  }

  try {
    return JSON.parse(match[0]) as HumanizedSections;
  } catch {
    return null;
  }
}

function normalizeList(values: unknown, fallback: string[]) {
  if (!Array.isArray(values)) {
    return fallback;
  }

  const normalized = values
    .map((value) => (typeof value === "string" ? value.trim() : ""))
    .filter(Boolean)
    .slice(0, 5);

  return normalized.length > 0 ? normalized : fallback;
}

function normalizeHumanizedSections(
  value: HumanizedSections | null,
  localAnalysis: LocalAnalysis,
) {
  if (!value) {
    return null;
  }

  const overview = value.overview?.trim();
  const securityRisk = value.securityRisk?.trim();
  const probableCause = value.probableCause?.trim();

  if (!overview || !securityRisk || !probableCause) {
    return null;
  }

  return {
    overview,
    securityRisk,
    probableCause,
    howToFix: normalizeList(value.howToFix, localAnalysis.howToFix),
    bestPractices: normalizeList(value.bestPractices, localAnalysis.bestPractices),
  };
}

export async function humanizeWithGroq(
  content: string,
  localAnalysis: LocalAnalysis,
) {
  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey) {
    return null;
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 9000);

  try {
    const response = await fetch(GROQ_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: process.env.GROQ_MODEL || DEFAULT_MODEL,
        temperature: 0.2,
        max_tokens: 800,
        response_format: { type: "json_object" },
        messages: buildGroqMessages(content, localAnalysis),
      }),
      signal: controller.signal,
      cache: "no-store",
    });

    if (!response.ok) {
      return null;
    }

    const payload = (await response.json()) as GroqCompletionResponse;
    const raw = payload.choices?.[0]?.message?.content;

    if (!raw) {
      return null;
    }

    return normalizeHumanizedSections(extractJsonObject(raw), localAnalysis);
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

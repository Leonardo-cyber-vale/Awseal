import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const apiKey = process.env.GEMINI_API_KEY;

const genAI = apiKey
  ? new GoogleGenerativeAI(apiKey)
  : null;

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const rawContent =
      typeof body.content === "string"
        ? body.content
        : typeof body.prompt === "string"
        ? body.prompt
        : "";

    if (!rawContent.trim()) {
      return NextResponse.json(
        {
          error: "Cole primeiro um erro AWS, política IAM ou log.",
        },
        { status: 400 }
      );
    }

    // =========================
    // DETECÇÃO LOCAL
    // =========================

    const findings: string[] = [];

    const recommendations: {
      title: string;
      description: string;
    }[] = [];

    // IMPORTANTE:
    // provavelmente o frontend usa enum em MAIÚSCULO
    let severity = "LOW";

    // =========================
    // ACTION *
    // =========================

    if (
      rawContent.includes('"Action":"*"') ||
      rawContent.includes('"Action": "*"') ||
      rawContent.includes('"Action": ["*"]')
    ) {
      findings.push(
        "Wildcard Action '*' detectado permitindo permissões totais."
      );

      recommendations.push({
        title: "Aplicar Least Privilege",
        description:
          "Restrinja ações IAM apenas ao necessário.",
      });

      severity = "HIGH";
    }

    // =========================
    // RESOURCE *
    // =========================

    if (
      rawContent.includes('"Resource":"*"') ||
      rawContent.includes('"Resource": "*"')
    ) {
      findings.push(
        "Wildcard Resource '*' detectado expondo todos os recursos."
      );

      recommendations.push({
        title: "Restringir Resources",
        description:
          "Evite utilizar Resource '*' em produção.",
      });

      severity = "HIGH";
    }

    // =========================
    // ADMIN ACCESS
    // =========================

    if (
      rawContent.toLowerCase().includes("administratoraccess") ||
      rawContent.toLowerCase().includes("iam:*")
    ) {
      findings.push(
        "Permissões administrativas excessivas detectadas."
      );

      recommendations.push({
        title: "Evitar privilégios administrativos",
        description:
          "Utilize permissões granulares ao invés de admin total.",
      });

      severity = "CRITICAL";
    }

    // =========================
    // ASSUME ROLE
    // =========================

    if (
      rawContent.toLowerCase().includes("sts:assumerole")
    ) {
      findings.push(
        "sts:AssumeRole detectado com potencial privilege escalation."
      );

      recommendations.push({
        title: "Revisar AssumeRole",
        description:
          "Permita AssumeRole apenas para entidades confiáveis.",
      });

      if (severity !== "CRITICAL") {
        severity = "HIGH";
      }
    }

    // =========================
    // ACCESS DENIED
    // =========================

    if (
      rawContent.toLowerCase().includes("accessdenied")
    ) {
      findings.push(
        "Erro AccessDenied identificado."
      );

      recommendations.push({
        title: "Revisar IAM",
        description:
          "Confira policies, roles e permissões anexadas.",
      });

      if (severity === "LOW") {
        severity = "MEDIUM";
      }
    }

    // =========================
    // SAFE POLICY
    // =========================

    if (findings.length === 0) {
      findings.push(
        "Nenhum risco crítico detectado."
      );

      recommendations.push({
        title: "Boas práticas",
        description:
          "Continue utilizando permissões restritas e específicas.",
      });

      severity = "LOW";
    }

    const localSummary = findings.join("\n");

    // =========================
    // FALLBACK RESPONSE
    // =========================

    const fallbackResponse = {
      analysis: {
        summary: localSummary,
        severity,
        highlightedEvidence: findings,
        recommendations,
      },
    };

    // =========================
    // SEM IA
    // =========================

    if (!genAI) {
      return NextResponse.json(fallbackResponse);
    }

    // =========================
    // IA
    // =========================

    try {
      const model = genAI.getGenerativeModel({
        model: "gemini-1.5-flash",
      });

      const prompt = `
Você é um especialista em AWS IAM e Cloud Security.

Analise este conteúdo:

${rawContent}

Detecções locais:
${localSummary}

Explique:
- nível de risco
- causa provável
- remediation
- melhores práticas

Responda em português.
`;

      const result = await model.generateContent(prompt);

      const response = await result.response;

      const text = response.text();

      return NextResponse.json({
        analysis: {
          summary: text,
          severity,
          highlightedEvidence: findings,
          recommendations,
        },
      });
    } catch (aiError) {
      console.error("Erro IA:", aiError);

      return NextResponse.json(fallbackResponse);
    }
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error: "Erro ao analisar conteúdo.",
      },
      { status: 500 }
    );
  }
}

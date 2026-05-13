import type { LocalAnalysis } from "@/lib/types";

export function buildGroqMessages(content: string, localAnalysis: LocalAnalysis) {
  const excerpt = content.slice(0, 2500);

  return [
    {
      role: "system",
      content:
        "Voce e o Awseal, um assistente conciso de seguranca cloud para AWS. Responda sempre em portugues do Brasil, de forma humana, tecnica e amigavel. Seja pratico, sem exageros, e foque em IAM, menor privilegio, logs, AccessDenied, CloudTrail e remediacao segura. Retorne apenas JSON valido.",
    },
    {
      role: "user",
      content: [
        "Analise o conteudo AWS abaixo usando o contexto local como fonte principal da verdade.",
        "Retorne JSON com exatamente estas chaves:",
        '{"overview":"string","securityRisk":"string","probableCause":"string","howToFix":["string"],"bestPractices":["string"]}',
        "",
        "Regras:",
        "- Mantenha cada paragrafo curto e util.",
        "- Nao contradiga as deteccoes locais.",
        "- Cite menor privilegio quando fizer sentido.",
        "- Em howToFix e bestPractices, retorne de 3 a 5 itens curtos.",
        "",
        "Contexto local:",
        localAnalysis.contextForLlm,
        "",
        "Trecho bruto da entrada:",
        excerpt,
      ].join("\n"),
    },
  ];
}

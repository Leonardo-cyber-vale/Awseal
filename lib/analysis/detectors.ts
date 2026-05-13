import type { DetectorFinding, LocalAnalysis, ParsedInputKind, RiskLevel } from "@/lib/types";

type JsonRecord = Record<string, unknown>;

const PRIVILEGE_ESCALATION_ACTIONS = [
  "iam:passrole",
  "iam:attachuserpolicy",
  "iam:attachrolepolicy",
  "iam:putrolepolicy",
  "iam:putuserpolicy",
  "iam:createaccesskey",
  "sts:assumerole",
];

const SERVICE_WILDCARDS = ["iam:*", "s3:*"];

function safeJsonParse(input: string) {
  try {
    return JSON.parse(input) as unknown;
  } catch {
    return null;
  }
}

function detectInputKind(raw: string, parsed: unknown): ParsedInputKind {
  if (parsed && typeof parsed === "object") {
    const record = parsed as JsonRecord;

    if ("Statement" in record) {
      return "iam-policy";
    }

    if ("eventSource" in record || "eventName" in record) {
      return "cloudtrail";
    }

    return "json";
  }

  if (/cloudtrail|eventsource|eventname/i.test(raw)) {
    return "cloudtrail";
  }

  if (/accessdenied|not authorized|encoded authorization failure/i.test(raw)) {
    return "aws-log";
  }

  return "plain-text";
}

function toArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.flatMap((item) => toArray(item));
  }

  if (typeof value === "string") {
    return [value];
  }

  return [];
}

function normalizeAction(value: string) {
  return value.trim().toLowerCase();
}

function severityWeight(severity: RiskLevel) {
  switch (severity) {
    case "Critico":
      return 34;
    case "Alto":
      return 24;
    case "Medio":
      return 14;
    case "Baixo":
      return 6;
  }
}

function riskFromScore(score: number): RiskLevel {
  if (score >= 75) {
    return "Critico";
  }

  if (score >= 55) {
    return "Alto";
  }

  if (score >= 28) {
    return "Medio";
  }

  return "Baixo";
}

function pushFinding(
  findings: DetectorFinding[],
  finding: DetectorFinding,
  dedupe: Set<string>,
) {
  if (dedupe.has(finding.id)) {
    return;
  }

  dedupe.add(finding.id);
  findings.push(finding);
}

function describeInputKind(kind: ParsedInputKind) {
  switch (kind) {
    case "iam-policy":
      return "politica IAM";
    case "cloudtrail":
      return "evento do CloudTrail";
    case "aws-log":
      return "erro ou trecho de log AWS";
    case "json":
      return "payload JSON generico";
    case "plain-text":
      return "texto livre";
  }
}

function collectPolicySignals(parsed: unknown) {
  if (!parsed || typeof parsed !== "object") {
    return {
      actions: [] as string[],
      resources: [] as string[],
      statementCount: 0,
      services: [] as string[],
    };
  }

  const record = parsed as JsonRecord;
  const statements = Array.isArray(record.Statement)
    ? record.Statement
    : record.Statement
      ? [record.Statement]
      : [];

  const actions = statements.flatMap((statement) =>
    toArray((statement as JsonRecord).Action),
  );
  const resources = statements.flatMap((statement) =>
    toArray((statement as JsonRecord).Resource),
  );
  const services = Array.from(
    new Set(
      actions
        .map((action) => action.split(":")[0]?.toLowerCase())
        .filter((service): service is string => Boolean(service)),
    ),
  );

  return {
    actions,
    resources,
    statementCount: statements.length,
    services,
  };
}

function buildNarrative(
  riskLevel: RiskLevel,
  kind: ParsedInputKind,
  findings: DetectorFinding[],
  services: string[],
) {
  const topFindings = findings.slice(0, 3);
  const overview =
    topFindings.length > 0
      ? `Esta ${describeInputKind(kind)} apresenta ${topFindings
          .map((item) => item.title.toLowerCase())
          .join(", ")}. O Awseal classificou a severidade geral como ${riskLevel.toLowerCase()}.`
      : `Esta ${describeInputKind(kind)} nao mostra uma configuracao claramente critica, mas ainda merece uma revisao rapida de menor privilegio.`;

  const securityRisk =
    topFindings.length > 0
      ? topFindings
          .map((item) => item.rationale)
          .join(" ")
      : "Nenhum wildcard critico nem permissao em nivel administrativo foi detectado, entao a exposicao imediata parece mais contida.";

  const probableCause =
    kind === "aws-log" || kind === "cloudtrail"
      ? "O conteudo parece uma falha de autorizacao em tempo de execucao, o que normalmente indica permissao ausente, SCP, permissions boundary, session policy ou tentativa contra um ARN incorreto."
      : topFindings.length > 0
        ? "A policy parece mais ampla do que o necessario, algo comum quando permissao foi aberta para ganhar velocidade em troubleshooting e nunca voltou para um escopo de menor privilegio."
        : "A entrada parece estruturalmente valida, entao o proximo passo e confirmar se as acoes e recursos concedidos sao realmente necessarios para a carga de trabalho.";

  const howToFix = Array.from(
    new Set(
      [
        ...topFindings.map((item) => item.recommendation),
        services.length > 0
          ? `Restrinja as permissoes apenas aos servicos AWS que esse fluxo realmente precisa: ${services.join(", ")}.`
          : "Substitua permissoes amplas por acoes e recursos estritamente ligados a carga de trabalho.",
      ].filter(Boolean),
    ),
  ).slice(0, 5);

  const bestPractices = Array.from(
    new Set(
      [
        "Mantenha policies IAM focadas em uma unica carga ou responsabilidade, evitando permissoes genericas.",
        "Valide toda alteracao com IAM Policy Simulator ou Access Analyzer antes de publicar em producao.",
        "Prefira ARNs explicitos, conditions e permission boundaries para reduzir blast radius.",
        findings.some((item) => item.category === "privilege-escalation")
          ? "Revise caminhos de AssumeRole e uso de PassRole para eliminar cadeias de escalonamento de privilegio."
          : "Revise periodicamente CloudTrail e Access Analyzer para detectar desvios cedo.",
      ],
    ),
  ).slice(0, 4);

  return {
    overview,
    securityRisk,
    probableCause,
    howToFix,
    bestPractices,
  };
}

export function buildLocalAnalysis(content: string): LocalAnalysis {
  const parsed = safeJsonParse(content);
  const inputKind = detectInputKind(content, parsed);
  const findings: DetectorFinding[] = [];
  const dedupe = new Set<string>();
  const lowered = content.toLowerCase();
  const { actions, resources, statementCount, services } = collectPolicySignals(parsed);
  const normalizedActions = actions.map(normalizeAction);
  const normalizedResources = resources.map((resource) => resource.trim());

  if (normalizedActions.includes("*") && normalizedResources.includes("*")) {
    pushFinding(
      findings,
      {
        id: "admin-wildcard",
        title: "policy com acesso irrestrito",
        severity: "Critico",
        evidence: 'Action "*" + Resource "*"',
        rationale:
          "Permitir todas as acoes em todos os recursos cria blast radius imediato sobre a conta e quebra o principio de menor privilegio por definicao.",
        recommendation:
          "Troque wildcards globais pelas acoes IAM exatas e pelos recursos em ARN realmente exigidos pela carga de trabalho.",
        category: "wildcard",
      },
      dedupe,
    );
  }

  if (normalizedActions.includes("*")) {
    pushFinding(
      findings,
      {
        id: "action-wildcard",
        title: "wildcard de acao detectado",
        severity: normalizedResources.includes("*") ? "Critico" : "Alto",
        evidence: 'Action "*"',
        rationale:
          "Wildcards de acao liberam capacidades alem da intencao da workload e dificultam a manutencao de menor privilegio ao longo do tempo.",
        recommendation:
          "Liste apenas as acoes de API realmente necessarias, em vez de usar wildcard global em Action.",
        category: "least-privilege",
      },
      dedupe,
    );
  }

  if (normalizedResources.includes("*")) {
    pushFinding(
      findings,
      {
        id: "resource-wildcard",
        title: "wildcard de recurso detectado",
        severity: normalizedActions.includes("*") ? "Critico" : "Alto",
        evidence: 'Resource "*"',
        rationale:
          "Recursos sem escopo ampliam o impacto de cada acao concedida e frequentemente expoem mais buckets, roles ou contas do que o pretendido.",
        recommendation:
          "Substitua wildcard em Resource pelos ARNs exatos de bucket, role, tabela, fila, segredo ou recurso utilizado.",
        category: "least-privilege",
      },
      dedupe,
    );
  }

  if (SERVICE_WILDCARDS.some((pattern) => normalizedActions.includes(pattern))) {
    if (normalizedActions.includes("iam:*")) {
      pushFinding(
        findings,
        {
          id: "iam-service-wildcard",
          title: "wildcard administrativo em IAM",
          severity: "Critico",
          evidence: 'Action "iam:*"',
          rationale:
            "Administracao ampla de IAM pode alterar identidades, anexar policies e criar varios caminhos de escalonamento de privilegio na conta.",
          recommendation:
            "Divida a administracao de IAM em acoes bem especificas, como iam:GetRole, iam:ListPolicies ou operacoes de escrita exatamente controladas.",
          category: "service-admin",
        },
        dedupe,
      );
    }

    if (normalizedActions.includes("s3:*")) {
      pushFinding(
        findings,
        {
          id: "s3-service-wildcard",
          title: "administracao ampla de S3",
          severity: normalizedResources.includes("*") ? "Alto" : "Medio",
          evidence: 'Action "s3:*"',
          rationale:
            "Acesso amplo a S3 pode expor buckets sensiveis, contornar controles de retencao e abrir risco de exfiltracao se os recursos nao estiverem bem limitados.",
          recommendation:
            "Reduza o acesso a S3 para os verbos exatos, como s3:GetObject ou s3:PutObject, e limite-os a ARNs de bucket explicitos.",
          category: "service-admin",
        },
        dedupe,
      );
    }
  }

  if (normalizedActions.includes("sts:assumerole")) {
    pushFinding(
      findings,
      {
        id: "assume-role-path",
        title: "permissao de AssumeRole presente",
        severity: normalizedResources.includes("*") ? "Alto" : "Medio",
        evidence: 'Action "sts:AssumeRole"',
        rationale:
          "Assumir role e legitimo em muitas arquiteturas, mas quando isso e amplo ou mal controlado vira caminho de movimento lateral e escalonamento de privilegio.",
        recommendation:
          "Restrinja AssumeRole aos papeis exatos de destino e adicione condicoes no trust policy, como external ID, session tags ou restricoes de principal sempre que possivel.",
        category: "trust",
      },
      dedupe,
    );
  }

  if (PRIVILEGE_ESCALATION_ACTIONS.some((action) => normalizedActions.includes(action))) {
    pushFinding(
      findings,
      {
        id: "priv-escalation-chain",
        title: "caminho de escalonamento para revisar",
        severity: "Alto",
        evidence: normalizedActions
          .filter((action) => PRIVILEGE_ESCALATION_ACTIONS.includes(action))
          .join(", "),
        rationale:
          "Acoes como PassRole, AssumeRole ou anexar policies podem permitir que uma identidade herde mais privilegios do que deveria.",
        recommendation:
          "Audite toda a cadeia de roles e remova acoes de gerenciamento de identidade que a workload nao precise de forma explicita.",
        category: "privilege-escalation",
      },
      dedupe,
    );
  }

  if (/administratoraccess/i.test(content)) {
    pushFinding(
      findings,
      {
        id: "administrator-access",
        title: "referencia a AdministratorAccess detectada",
        severity: "Critico",
        evidence: "AdministratorAccess",
        rationale:
          "A policy gerenciada AdministratorAccess concede controle efetivamente total e deve ser tratada como forte sinal de privilegio excessivo.",
        recommendation:
          "Substitua AdministratorAccess por uma policy dedicada de menor privilegio ou por um conjunto bem curado de policies gerenciadas e restritas.",
        category: "service-admin",
      },
      dedupe,
    );
  }

  if (
    statementCount > 4 ||
    normalizedActions.length > 10 ||
    services.length > 4
  ) {
    pushFinding(
      findings,
      {
        id: "permission-sprawl",
        title: "sprawl de permissoes",
        severity: "Medio",
        evidence: `${statementCount} statements, ${normalizedActions.length} actions, ${services.length} services`,
        rationale:
          "Policies que crescem demais em servicos, statements e acoes ficam mais dificeis de revisar, mais faceis de usar errado e tendem a se afastar do menor privilegio.",
        recommendation:
          "Quebre a policy em unidades menores focadas por workload e remova acoes ociosas depois de validar o uso real.",
        category: "least-privilege",
      },
      dedupe,
    );
  }

  if (/accessdenied|not authorized|explicit deny|encoded authorization failure/i.test(lowered)) {
    pushFinding(
      findings,
      {
        id: "access-denied-diagnostic",
        title: "falha de autorizacao detectada",
        severity: findings.length > 0 ? "Medio" : "Baixo",
        evidence: "AccessDenied / not authorized",
        rationale:
          "O conteudo inclui uma falha de autorizacao, o que normalmente indica permissao ausente ou um bloqueio superior como SCP, session policy, permission boundary ou explicit deny.",
        recommendation:
          "Confirme qual principal executou a chamada, inspecione a acao e o ARN exatos e teste o caminho com IAM Policy Simulator ou contexto do CloudTrail.",
        category: "diagnostic",
      },
      dedupe,
    );
  }

  if (/cloudtrail|eventsource|eventname|requestparameters/i.test(lowered)) {
    pushFinding(
      findings,
      {
        id: "cloudtrail-context",
        title: "contexto de CloudTrail disponivel",
        severity: "Baixo",
        evidence: "Campos de CloudTrail detectados",
        rationale:
          "Os dados do CloudTrail ajudam a confirmar principal, acao, IP de origem e caminho de avaliacao por tras do evento de seguranca.",
        recommendation:
          "Correlacione o evento com o ARN de destino, o contexto da sessao e quaisquer guardrails de organizacao antes de mudar permissoes.",
        category: "logging",
      },
      dedupe,
    );
  }

  const score = Math.min(
    100,
    findings.reduce((total, item) => total + severityWeight(item.severity), 0),
  );
  const riskLevel = riskFromScore(score);
  const narrative = buildNarrative(riskLevel, inputKind, findings, services);

  return {
    riskLevel,
    score,
    charCount: content.length,
    inputKind,
    findings,
    highlightedEvidence: findings.map((item) => item.evidence).slice(0, 6),
    contextForLlm: [
      `Tipo de entrada: ${inputKind}`,
      `Nivel de risco: ${riskLevel}`,
      `Pontuacao: ${score}`,
      findings.length > 0
        ? `Achados: ${findings
            .map(
              (item) =>
                `${item.severity} - ${item.title} (${item.evidence}) -> ${item.rationale}`,
            )
            .join(" | ")}`
        : "Achados: nenhuma configuracao severa foi detectada.",
    ].join("\n"),
    ...narrative,
  };
}

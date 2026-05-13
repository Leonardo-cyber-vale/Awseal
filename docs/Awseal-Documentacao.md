# Awseal
Documentacao do Projeto

## Resumo executivo
Awseal e uma ferramenta open source focada em explicar erros AWS, logs, permissoes IAM, mensagens AccessDenied, eventos CloudTrail e JSONs relacionados a seguranca cloud de forma humana, rapida e orientada a acao.

O produto foi pensado para a comunidade AWS, Cloud, Platform e DevSecOps que precisa entender rapidamente o que aconteceu, qual e o risco, qual e a causa provavel e como corrigir o problema sem abrir mao de boas praticas de seguranca.

## O que o produto resolve
- Traduz policies IAM e erros AWS em uma linguagem clara e util.
- Detecta sinais locais de risco antes de consultar a IA.
- Ajuda a identificar violacoes de least privilege e risco de privilege escalation.
- Reduz o tempo gasto com investigacao manual de logs e permissoes.
- Entrega uma experiencia visual limpa, moderna e pronta para demonstracoes, GitHub e Product Hunt.

## Escopo atual do MVP
- Colar erro AWS, log, policy IAM ou JSON relevante.
- Rodar detectores locais de seguranca e contexto tecnico.
- Usar Gemini para humanizar a resposta quando a chave de API estiver disponivel.
- Exibir resumo, risco, causa provavel, como corrigir e boas praticas.

Nao faz parte do MVP atual:
- login ou autenticacao
- banco de dados
- integracao AWS real
- billing ou organizacoes
- multi-cloud
- agentes autonomos

## Stack atual
- Next.js 15 com App Router
- TypeScript
- Tailwind CSS
- UI no estilo shadcn
- Framer Motion
- Lucide Icons
- API Routes
- Gemini 1.5 Flash via `@google/generative-ai`
- Estrutura pronta para deploy na Vercel

## Arquitetura atual
- `app/page.tsx`: ponto de entrada da experiencia principal.
- `app/api/analyze/route.ts`: endpoint de analise atualmente conectado ao Gemini.
- `components/awseal-app.tsx`: composicao da landing page, hero, editor e estados da analise.
- `components/json-editor.tsx`: textarea principal com aparencia de editor e highlight simples.
- `components/result-panel.tsx`: renderizacao do resultado em secoes e badges de risco.
- `lib/analysis/detectors.ts`: heuristicas locais para IAM, wildcards e sinais de abuso de privilegio.
- `public/assets/logo.png`: caminho de substituicao simples para a logo do projeto.

## Fluxo de analise
1. O usuario cola um erro AWS, uma policy IAM, um trecho de log ou um JSON.
2. A aplicacao valida a entrada e aplica limites de caracteres.
3. Os detectores locais analisam wildcards, privilegios amplos, `iam:*`, `s3:*`, `sts:AssumeRole`, `AdministratorAccess` e outros sinais de risco.
4. O sistema classifica a severidade e monta um contexto tecnico base.
5. Quando `GEMINI_API_KEY` esta configurada, o Gemini transforma esse contexto em uma explicacao humana e objetiva.
6. O usuario recebe um resultado organizado em overview, security risk, probable cause, how to fix e best practices.

## IA oficial do projeto
Awseal deve usar Gemini como provedor principal de IA.

Variavel de ambiente:
```env
GEMINI_API_KEY=
```

Modelo configurado atualmente:
```text
gemini-1.5-flash
```

Observacao importante:
O endpoint principal em `app/api/analyze/route.ts` ja esta configurado para Gemini. Ainda existem referencias legadas a Groq em partes antigas do scaffold, mas elas nao representam o fluxo oficial atual do projeto. Se desejado, isso pode ser limpo depois em uma refatoracao de nomenclatura e provider layer.

## Seguranca e protecoes
- Limite de caracteres para evitar payloads exagerados.
- Sanitizacao de entrada antes da analise.
- Timeout e tratamento de erro na chamada da IA.
- Fallback local para nao depender 100 por cento do provedor externo.
- Nenhuma credencial AWS e exigida para o MVP.

## Como rodar localmente
```bash
npm install
cp .env.example .env.local
# preencher GEMINI_API_KEY
npm run dev
```

A aplicacao sobe em ambiente local e pode ser publicada na Vercel sem dependencia de banco de dados ou autenticacao.

## Deploy
- Importar o repositorio na Vercel.
- Configurar a variavel `GEMINI_API_KEY` no projeto.
- Publicar o app.

## Roadmap sugerido
- Terraform analysis
- suporte expandido a CloudTrail
- VSCode extension
- CLI
- export markdown
- policy diff
- multi-cloud

## Publico-alvo
- Engenheiros de cloud
- times de DevSecOps
- platform engineers
- security engineers
- profissionais que lidam com IAM e AccessDenied no dia a dia

## Diferenciais do Awseal
- Interface premium e minimalista.
- Analise hibrida com heuristicas locais antes da IA.
- Foco real em IAM Security e least privilege.
- Explicacoes curtas, humanas e acionaveis.
- Estrutura preparada para crescer como produto open source.

## Entregaveis desta documentacao
- Fonte markdown em `docs/Awseal-Documentacao.md`.
- PDF final em `docs/Awseal-Documentacao.pdf`.
- Conteudo alinhado com Gemini como IA principal.

# Awseal

[![Next.js](https://img.shields.io/badge/Next.js_15-App_Router-111827?style=flat-square)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-Strict-2563eb?style=flat-square)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-Premium_UI-38bdf8?style=flat-square)](https://tailwindcss.com/)
[![Groq Ready](https://img.shields.io/badge/Groq-Hybrid_Analysis-f59e0b?style=flat-square)](https://groq.com/)
[![MIT License](https://img.shields.io/badge/License-MIT-16a34a?style=flat-square)](./LICENSE)

Awseal is an open source cloud security assistant focused on helping the AWS, DevSecOps, and platform engineering community understand IAM permissions, AccessDenied messages, unsafe policies, CloudTrail context, and raw AWS logs with fast, human explanations.

The MVP is intentionally focused:

- Paste an AWS error, log, IAM policy, or CloudTrail snippet
- Run local IAM security detectors first
- Use Groq to humanize the result when an API key is available
- Return a concise explanation, risk level, probable cause, remediation, and best practices

![Awseal home placeholder](./docs/screenshots/home-placeholder.svg)

## Why Awseal?

AWS permission issues are rarely just syntax problems. They are usually a mix of:

- confusing IAM evaluation logic
- noisy runtime logs
- overbroad emergency policies
- privilege escalation risk hidden inside "temporary" permissions
- weak least-privilege hygiene that grows over time

Awseal exists to compress that debugging loop into a clean, security-first workflow that is understandable by humans, not only IAM specialists.

## Product Principles

- Security-first by default: local detectors score wildcard actions, wildcard resources, risky IAM administration, AssumeRole paths, and permission sprawl before any model output is used.
- Human explanations: the final output is short, practical, and tuned for engineers who need to move from confusion to remediation quickly.
- Minimal UI, serious UX: the interface is intentionally clean, spacious, and premium so the product feels more like a polished cloud tool than a generic dashboard.
- Provider-ready architecture: Groq is the current LLM adapter, but the provider layer is isolated for future model swaps.

## Features

- Next.js 15 with App Router and TypeScript
- Tailwind CSS with shadcn-style UI primitives
- Framer Motion transitions and premium loading skeletons
- Dark mode with `next-themes`
- Groq API integration with timeout and graceful fallback
- Local IAM and AWS signal detectors for hybrid analysis
- Character limit protection and input sanitization
- Copy-ready result output for tickets, chats, or incident notes
- Vercel-friendly deploy structure

## Screens

![Awseal analysis placeholder](./docs/screenshots/analysis-placeholder.svg)

Replace the screenshots later with real product captures when you are ready for launch.

## Architecture

```text
app/
  api/analyze/route.ts      -> API endpoint for hybrid analysis
  layout.tsx                -> fonts, theme provider, metadata
  page.tsx                  -> landing experience

components/
  awseal-app.tsx            -> main page orchestration
  json-editor.tsx           -> editor-like textarea with simple syntax highlighting
  result-panel.tsx          -> premium analysis layout
  loading-analysis.tsx      -> elegant skeleton state
  ui/*                      -> shadcn-style primitives

lib/
  analysis/detectors.ts     -> local IAM/log heuristics
  analysis/sanitize.ts      -> input protection
  llm/groq.ts               -> Groq adapter
  llm/index.ts              -> provider orchestration
  llm/prompt.ts             -> structured analysis prompt
  constants.ts              -> app defaults and UI metadata
  types.ts                  -> shared contracts
```

## Hybrid Analysis Flow

1. The user pastes an IAM policy, AWS log, AccessDenied snippet, or CloudTrail event.
2. Awseal sanitizes the input and enforces a character limit.
3. Local detectors inspect wildcard actions, wildcard resources, `iam:*`, `s3:*`, `sts:AssumeRole`, `AdministratorAccess`, and signs of permission sprawl or escalation risk.
4. The local result becomes the technical source of truth.
5. If `GROQ_API_KEY` exists, Groq rewrites that context into a short human explanation.
6. If Groq is unavailable or times out, the local explanation is returned cleanly.

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

```bash
cp .env.example .env.local
```

Add your Groq key:

```env
GROQ_API_KEY=your_key_here
```

### 3. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Deployment

Awseal is ready to deploy on Vercel:

1. Import the repository into Vercel
2. Add `GROQ_API_KEY` to the project environment variables
3. Deploy

No database, auth provider, or external AWS integration is required for the MVP.

## Asset Notes

The logo path is already wired to:

```text
public/assets/logo.png
```

You can replace that file later with the final exported PNG without touching the React components.

## Security Notes

- Input is sanitized before analysis
- Character limits reduce abuse and accidental oversized payloads
- Groq requests use a timeout and fail back to local analysis
- The app never requires direct AWS credentials for the MVP

## Roadmap

- Terraform analysis
- CloudTrail support expansion
- VSCode extension
- CLI
- export markdown
- policy diff
- multi-cloud

## Contributing

Contributions are welcome, especially around:

- richer IAM detection logic
- better CloudTrail parsing
- improved remediation quality
- accessibility and responsive polish
- future provider adapters

Suggested flow:

```bash
git checkout -b feat/your-change
npm install
npm run dev
```

Open a PR with:

- the problem being solved
- screenshots or short clips when UI changes are involved
- notes about edge cases and validation

## License

MIT. See [LICENSE](./LICENSE).

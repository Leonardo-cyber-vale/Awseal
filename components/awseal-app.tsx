"use client";

import { startTransition, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Github, LoaderCircle, Sparkles } from "lucide-react";

import { BrandLogo } from "@/components/brand-logo";
import { JsonEditor } from "@/components/json-editor";
import { LoadingAnalysis } from "@/components/loading-analysis";
import { ResultPanel } from "@/components/result-panel";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  APP_NAME,
  DEFAULT_EDITOR_VALUE,
  GITHUB_URL,
} from "@/lib/constants";
import { SEED_ANALYSIS } from "@/lib/seed-analysis";
import type { AnalyzeResponse, FinalAnalysis } from "@/lib/types";

export function AwsealApp() {
  const [content, setContent] = useState(DEFAULT_EDITOR_VALUE);
  const [analysis, setAnalysis] = useState<FinalAnalysis>(SEED_ANALYSIS);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async () => {
    if (!content.trim()) {
      setError("Cole um erro, log ou politica IAM antes de analisar.");
      return;
    }

    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 12000);
    setError(null);
    setIsLoading(true);

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content }),
        signal: controller.signal,
      });

      const payload = (await response.json()) as AnalyzeResponse & { error?: string };

      if (!response.ok || !payload.analysis) {
        throw new Error(payload.error || "O Awseal nao conseguiu analisar este conteudo.");
      }

      startTransition(() => {
        setAnalysis(payload.analysis);
      });
    } catch (caughtError) {
      const message =
        caughtError instanceof Error && caughtError.name === "AbortError"
          ? "A analise demorou mais do que o esperado. Tente enviar um trecho menor."
          : caughtError instanceof Error
            ? caughtError.message
            : "Nao foi possivel analisar este conteudo agora.";

      setError(message);
    } finally {
      clearTimeout(timeout);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-40 border-b border-slate-200/70 bg-white/78 backdrop-blur-2xl dark:border-awseal-950/40 dark:bg-slate-950/78">
        <div className="container flex h-24 items-center justify-between gap-6">
          <BrandLogo compact className="translate-y-px" />

          <div className="flex items-center gap-2">
            <Button
              asChild
              variant="ghost"
              size="sm"
              className="rounded-full border border-slate-200/80 bg-white/80 px-4 text-slate-700 shadow-sm hover:bg-slate-100/80 dark:border-awseal-900/50 dark:bg-slate-950/80 dark:text-slate-100 dark:hover:bg-slate-900"
            >
              <Link href={GITHUB_URL} target="_blank" rel="noreferrer">
                <Github className="size-4" />
                GitHub
              </Link>
            </Button>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="container pb-24 pt-10 sm:pt-20">
        <section className="mx-auto max-w-5xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: "easeOut" }}
            className="flex flex-col items-center"
          >
            <div className="mb-10 flex flex-col items-center gap-5">
              <div className="rounded-[2rem] border border-white/90 bg-white/92 p-4 shadow-[0_35px_80px_-52px_rgba(28,100,242,0.42)] dark:border-awseal-950/60 dark:bg-slate-950/82">
                <BrandLogo showLabel={false} className="animate-float" />
              </div>

              <div className="inline-flex items-center gap-2 rounded-full border border-awseal-100/90 bg-awseal-50/90 px-4 py-1.5 text-[0.82rem] font-semibold text-awseal-700 dark:border-awseal-900/60 dark:bg-awseal-900/25 dark:text-awseal-200">
                <Sparkles className="size-4" />
                Open source para IAM, Cloud Security e DevSecOps
              </div>
            </div>

            <div className="max-w-4xl space-y-6">
              <h1 className="mx-auto max-w-4xl text-6xl md:text-7xl font-bold tracking-tight leading-[0.95] text-zinc-900">
                Entenda erros, logs e permissoes AWS com <span className="bg-gradient-to-r from-awseal-500 to-awseal-700 bg-clip-text text-transparent dark:from-awseal-300 dark:to-awseal-100">IA.</span>
              </h1>

              <p className="mx-auto max-w-2xl text-pretty text-lg leading-8 text-slate-500 dark:text-slate-400 sm:text-[1.05rem]">
                Cole um erro, log ou politica IAM e receba uma explicacao clara, humana e focada em seguranca cloud.
              </p>

              <p className="text-[0.76rem] font-semibold uppercase tracking-[0.34em] text-slate-400 dark:text-slate-500">
                Simples, rapido e humano.
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
            className="mt-16 rounded-[32px] border border-white/80 bg-white/90 p-4 shadow-[0_35px_80px_-50px_rgba(28,100,242,0.28)] backdrop-blur-xl dark:border-awseal-950/60 dark:bg-slate-950/85 sm:p-6"
          >
            <JsonEditor value={content} onChange={setContent} disabled={isLoading} />

            <div className="mt-6 flex flex-col items-center gap-4 border-t border-slate-100 pt-6 dark:border-slate-900">
              <Button size="lg" type="button" onClick={handleAnalyze} disabled={isLoading}>
                {isLoading ? <LoaderCircle className="size-4 animate-spin" /> : null}
                {isLoading ? "Analisando" : "Analisar"}
              </Button>

              <p className="text-sm text-slate-500 dark:text-slate-400">
                Feito para seguranca IAM, investigacao de AccessDenied, menor privilegio e DevSecOps.
              </p>
            </div>
          </motion.div>
        </section>

        <AnimatePresence initial={false}>
          {error ? (
            <motion.div
              key={error}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mx-auto mt-6 max-w-5xl"
            >
              <Card className="border-rose-200/80 bg-rose-50/90 p-4 text-left text-sm text-rose-700 dark:border-rose-900/70 dark:bg-rose-950/40 dark:text-rose-200">
                {error}
              </Card>
            </motion.div>
          ) : null}
        </AnimatePresence>

        <section className="mx-auto mt-8 max-w-5xl">
          {isLoading ? <LoadingAnalysis /> : <ResultPanel analysis={analysis} />}
        </section>

        <section className="mx-auto mt-8 max-w-5xl">
          <div className="grid gap-4 md:grid-cols-3">
            {[
              {
                title: "Seguranca IAM primeiro",
                text: "Os detectores locais sinalizam acoes com wildcard, escopos arriscados e violacoes claras de menor privilegio antes mesmo da IA responder.",
              },
              {
                title: "Explicacao humana",
                text: "O Awseal transforma ruido bruto da AWS em explicacoes objetivas, causas provaveis e orientacoes de correcao que o time consegue aplicar rapido.",
              },
              {
                title: "Pronto para evoluir",
                text: "A integracao com a Groq fica isolada em uma camada propria, deixando futuras trocas de modelo mais simples e seguras.",
              },
            ].map((item) => (
              <Card
                key={item.title}
                className="border-white/70 bg-white/80 p-5 dark:border-awseal-950/60 dark:bg-slate-950/75"
              >
                <h2 className="text-base font-semibold text-slate-950 dark:text-white">
                  {item.title}
                </h2>
                <p className="mt-3 text-sm leading-7 text-slate-500 dark:text-slate-400">
                  {item.text}
                </p>
              </Card>
            ))}
          </div>
        </section>

        <footer className="mx-auto mt-12 flex max-w-5xl flex-col items-center justify-between gap-4 border-t border-white/70 pt-8 text-center text-sm text-slate-500 dark:border-awseal-950/50 dark:text-slate-400 sm:flex-row sm:text-left">
          <p>
            {APP_NAME} ajuda a comunidade AWS e DevSecOps a entender logs, politicas e permissoes com clareza.
          </p>
          <p>Pronto para deploy na Vercel e para futuras trocas de modelo.</p>
        </footer>
      </main>
    </div>
  );
}

"use client";

import { useDeferredValue, useId, useRef } from "react";
import { FileLock2 } from "lucide-react";

import { MAX_INPUT_CHARS } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface JsonEditorProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

function escapeHtml(content: string) {
  return content
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function highlightContent(content: string) {
  const escaped = escapeHtml(content);

  return escaped.replace(
    /("(\\u[\da-fA-F]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g,
    (match) => {
      if (match.endsWith(":")) {
        return `<span class="token-key">${match}</span>`;
      }

      if (match.startsWith('"')) {
        return `<span class="token-string">${match}</span>`;
      }

      if (match === "true" || match === "false") {
        return `<span class="token-boolean">${match}</span>`;
      }

      if (match === "null") {
        return `<span class="token-null">${match}</span>`;
      }

      return `<span class="token-number">${match}</span>`;
    },
  );
}

export function JsonEditor({ value, onChange, disabled }: JsonEditorProps) {
  const deferredValue = useDeferredValue(value);
  const lineColumnRef = useRef<HTMLDivElement>(null);
  const highlightRef = useRef<HTMLPreElement>(null);
  const textareaId = useId();
  const lineCount = Math.max(10, value.split("\n").length);
  const nearLimit = value.length >= MAX_INPUT_CHARS * 0.85;

  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <label
          htmlFor={textareaId}
          className="text-sm font-semibold text-slate-800 dark:text-slate-100"
        >
          Cole seu erro, log ou politica IAM
        </label>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Politica JSON, AccessDenied, CloudTrail ou logs de permissao AWS.
        </p>
      </div>

      <div className="overflow-hidden rounded-[24px] border border-slate-200/80 bg-white shadow-[inset_0_1px_0_rgba(255,255,255,0.8)] dark:border-slate-800/80 dark:bg-slate-950">
        <div className="grid min-h-[320px] grid-cols-[52px_minmax(0,1fr)]">
          <div
            ref={lineColumnRef}
            aria-hidden
            className="border-r border-slate-100 bg-slate-50/90 px-4 py-4 text-right font-mono text-xs leading-7 text-slate-400 dark:border-slate-900 dark:bg-slate-950/90 dark:text-slate-600"
          >
            {Array.from({ length: lineCount }, (_, index) => (
              <div key={index + 1}>{index + 1}</div>
            ))}
          </div>

          <div className="relative">
            <pre
              ref={highlightRef}
              aria-hidden
              className="editor-highlight pointer-events-none absolute inset-0 overflow-auto px-4 py-4 font-mono text-[13.5px] leading-7 text-slate-900 dark:text-slate-100"
            >
              <code dangerouslySetInnerHTML={{ __html: highlightContent(deferredValue) }} />
            </pre>

            <textarea
              id={textareaId}
              value={value}
              disabled={disabled}
              maxLength={MAX_INPUT_CHARS}
              spellCheck={false}
              onChange={(event) => onChange(event.target.value)}
              onScroll={(event) => {
                const currentTarget = event.currentTarget;

                if (lineColumnRef.current) {
                  lineColumnRef.current.scrollTop = currentTarget.scrollTop;
                }

                if (highlightRef.current) {
                  highlightRef.current.scrollTop = currentTarget.scrollTop;
                  highlightRef.current.scrollLeft = currentTarget.scrollLeft;
                }
              }}
              className={cn(
                "relative z-10 h-[320px] w-full resize-none overflow-auto bg-transparent px-4 py-4 font-mono text-[13.5px] leading-7 caret-awseal-500 outline-none transition",
                disabled
                  ? "cursor-wait opacity-80"
                  : "text-transparent selection:bg-awseal-200/50 dark:selection:bg-awseal-500/30",
              )}
              style={{
                color: "transparent",
                WebkitTextFillColor: "transparent",
              }}
            />
          </div>
        </div>

        <div className="flex flex-col gap-3 border-t border-slate-100 px-5 py-4 text-xs text-slate-500 dark:border-slate-900 dark:text-slate-400 sm:flex-row sm:items-center sm:justify-between">
          <div className="inline-flex items-center gap-2">
            <FileLock2 className="size-3.5" />
            <span>Nada e armazenado. Seu conteudo e usado apenas para analise.</span>
          </div>

          <span
            className={cn(
              "font-medium",
              nearLimit && "text-amber-600 dark:text-amber-300",
            )}
          >
            {value.length.toLocaleString("pt-BR")} / {MAX_INPUT_CHARS.toLocaleString("pt-BR")} caracteres
          </span>
        </div>
      </div>
    </div>
  );
}

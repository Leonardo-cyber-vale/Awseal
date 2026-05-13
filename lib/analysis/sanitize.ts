import { MAX_INPUT_CHARS } from "@/lib/constants";

export function sanitizeInput(input: string) {
  const normalized = input.replace(/\r\n/g, "\n").replace(/[^\S\n\t]+$/gm, "");
  const scrubbed = normalized.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "");

  return scrubbed.slice(0, MAX_INPUT_CHARS);
}

export function isInputWithinLimit(input: string) {
  return input.length <= MAX_INPUT_CHARS;
}

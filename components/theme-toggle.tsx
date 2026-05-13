"use client";

import { useEffect, useState } from "react";
import { MoonStar, SunMedium } from "lucide-react";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted && resolvedTheme === "dark";

  return (
    <Button
      variant="outline"
      size="icon"
      type="button"
      aria-label="Alternar tema"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="rounded-full border-slate-200/80 bg-white/80 text-slate-700 shadow-sm hover:bg-slate-100 dark:border-awseal-900/50 dark:bg-slate-950/80 dark:text-slate-100 dark:hover:bg-slate-900"
    >
      {isDark ? <SunMedium className="size-[18px]" /> : <MoonStar className="size-[18px]" />}
    </Button>
  );
}

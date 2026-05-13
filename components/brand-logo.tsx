import Image from "next/image";

import { cn } from "@/lib/utils";

interface BrandLogoProps {
  compact?: boolean;
  showLabel?: boolean;
  className?: string;
}

export function BrandLogo({
  compact = false,
  showLabel = true,
  className,
}: BrandLogoProps) {
  return (
    <div
      className={cn(
        "flex items-center",
        compact ? "gap-3" : "gap-5",
        className
      )}
    >
      <div
        className={cn(
          "relative shrink-0 overflow-hidden border border-awseal-100/80 bg-white/95 flex items-center justify-center",
          compact
            ? "w-14 h-14 rounded-2xl"
            : "w-[8rem] h-[5rem] rounded-[1.75rem]"
        )}
      >
        <Image
          src="/assets/logo.png"
          alt="Logo Awseal"
          fill
          priority
          quality={100}
          sizes={compact ? "56px" : "128px"}
          className="object-contain p-2"
        />
      </div>

      {showLabel ? (
        <div
          className={cn(
            "min-w-0",
            compact ? "space-y-0.5" : "space-y-1"
          )}
        >
          <span
            className={cn(
              "block leading-none tracking-[-0.05em] text-awseal-600 dark:text-awseal-300",
              compact
                ? "text-[1.45rem] font-semibold"
                : "text-[2.4rem] font-semibold"
            )}
          >
            Awseal
          </span>

          {!compact ? (
            <span className="block text-[0.68rem] font-semibold uppercase tracking-[0.30em] text-awseal-600/75 dark:text-awseal-300/75">
              IA para seguranca AWS
            </span>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
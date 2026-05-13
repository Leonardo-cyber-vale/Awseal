import type * as React from "react";

import { cn } from "@/lib/utils";

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-2xl bg-gradient-to-r from-awseal-100/90 via-white to-awseal-100/90 dark:from-awseal-900/50 dark:via-awseal-950 dark:to-awseal-900/40",
        className,
      )}
      {...props}
    />
  );
}

export { Skeleton };

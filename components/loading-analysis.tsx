import { Skeleton } from "@/components/ui/skeleton";

export function LoadingAnalysis() {
  return (
    <div className="grid gap-4 lg:grid-cols-[220px_minmax(0,1fr)]">
      <div className="rounded-[28px] border border-white/70 bg-white/85 p-5 shadow-panel dark:border-awseal-950/60 dark:bg-slate-950/80">
        <Skeleton className="mb-4 h-5 w-24" />
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, index) => (
            <Skeleton key={index} className="h-12 w-full rounded-2xl" />
          ))}
        </div>
      </div>

      <div className="rounded-[28px] border border-white/70 bg-white/85 p-5 shadow-panel dark:border-awseal-950/60 dark:bg-slate-950/80">
        <div className="mb-5 flex items-center justify-between gap-3">
          <Skeleton className="h-7 w-48" />
          <Skeleton className="h-10 w-32 rounded-xl" />
        </div>

        <div className="grid gap-4 xl:grid-cols-[minmax(0,1.6fr)_220px]">
          <Skeleton className="h-44 rounded-[24px]" />
          <Skeleton className="h-44 rounded-[24px]" />
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <Skeleton className="h-56 rounded-[24px]" />
          <Skeleton className="h-56 rounded-[24px]" />
          <Skeleton className="h-52 rounded-[24px] md:col-span-2" />
        </div>
      </div>
    </div>
  );
}

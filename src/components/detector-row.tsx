import { copy } from "@/lib/amanah/copy";
import type { DetectorResult, Lang } from "@/lib/amanah/types";
import { cn } from "@/lib/utils";

export function DetectorRow({
  d,
  lang,
  compact,
}: {
  d: DetectorResult;
  lang: Lang;
  compact?: boolean;
}) {
  const meta = copy[lang].detectors[d.id];
  const bar =
    d.band === "fail" ? "bg-fail" : d.band === "watch" ? "bg-watch" : "bg-ok";

  return (
    <div className={cn("py-3", compact ? "" : "py-3.5")}>
      <div className="flex items-baseline justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm font-medium text-fg">{meta.name}</p>
          {!compact ? (
            <p className="mt-0.5 text-xs text-muted">{meta.short}</p>
          ) : null}
        </div>
        <div className="flex items-baseline gap-2 shrink-0">
          <span className="font-display text-xl tabular leading-none">{d.score}</span>
          <span
            className={cn(
              "text-[10px] uppercase tracking-[0.16em]",
              d.band === "fail" ? "text-fail" : d.band === "watch" ? "text-watch" : "text-ok",
            )}
          >
            {copy[lang].bands[d.band]}
          </span>
        </div>
      </div>
      <div className="mt-2.5 h-0.5 w-full bg-border">
        <div className={cn("h-0.5", bar)} style={{ width: `${d.score}%` }} />
      </div>
    </div>
  );
}

import { cn } from "@/lib/utils";
import type { Band } from "@/lib/amanah/types";

export function ScoreRing({
  score,
  band,
  size = 168,
  label,
}: {
  score: number;
  band: Band;
  size?: number;
  label?: string;
}) {
  const r = 54;
  const c = 2 * Math.PI * r;
  const offset = c - (Math.min(100, Math.max(0, score)) / 100) * c;
  const stroke =
    band === "fail" ? "var(--color-fail)" : band === "watch" ? "var(--color-watch)" : "var(--color-ok)";

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg viewBox="0 0 132 132" className="size-full -rotate-90" aria-hidden>
        <circle
          cx="66"
          cy="66"
          r={r}
          fill="none"
          stroke="color-mix(in oklab, var(--color-fg) 8%, transparent)"
          strokeWidth="6"
        />
        <circle
          cx="66"
          cy="66"
          r={r}
          fill="none"
          stroke={stroke}
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
          className="transition-[stroke-dashoffset] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-display text-5xl leading-none tracking-tight tabular">{score}</span>
        {label ? (
          <span className={cn("mt-1 text-[11px] uppercase tracking-[0.18em] text-muted")}>{label}</span>
        ) : null}
      </div>
    </div>
  );
}

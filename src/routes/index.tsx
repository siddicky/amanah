import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
import { DetectorRow } from "@/components/detector-row";
import { ScoreRing } from "@/components/score-ring";
import { Button } from "@/components/ui/button";
import { copy, type Copy } from "@/lib/amanah/copy";
import { weakestDetector } from "@/lib/amanah/scoring";
import { useAmanah } from "@/lib/amanah/store";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  const lang = useAmanah((s) => s.lang);
  const current = useAmanah((s) => s.current);
  const t = copy[lang];
  const tenantName = t.tenants[current?.tenantId ?? "wallet"].name;

  if (!current) {
    return (
      <div className="space-y-6">
        <HeroKicker t={t} tenant={tenantName} />
        <p className="text-sm text-muted">{t.emptyScan}</p>
        <Button asChild>
          <Link to="/assess">{t.run}</Link>
        </Button>
      </div>
    );
  }

  const weak = weakestDetector(current);
  const scenario = t.scenarios[current.scenarioId];

  return (
    <div className="space-y-8">
      <HeroKicker t={t} tenant={tenantName} />

      <section className="flex flex-col items-center pt-2">
        <ScoreRing score={current.overall} band={current.band} />
        <p className="mt-3 text-center text-[11px] uppercase tracking-[0.18em] text-muted">
          {t.scoreLabel}
        </p>
        <p className="mt-4 text-center text-xs text-muted">
          {t.lastAssessed} · {scenario.name} ·{" "}
          {current.mode === "live" ? t.live : t.simulated}
        </p>
      </section>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Button asChild>
          <Link to="/assess">{t.run}</Link>
        </Button>
        <Button asChild variant="outline">
          <Link to="/report">{t.viewReport}</Link>
        </Button>
      </div>

      <section className="rounded-xl bg-surface p-4 shadow-[var(--shadow-border)] sm:p-5">
        <p className="text-[11px] uppercase tracking-[0.18em] text-muted">{t.weakest}</p>
        <h2 className="mt-2 font-display text-2xl tracking-tight">
          {t.detectors[weak.id].name}
        </h2>
        <p className="mt-2 text-sm text-muted">{weak.recommendation}</p>
      </section>

      <section>
        <div className="flex items-baseline justify-between">
          <h2 className="text-[11px] uppercase tracking-[0.18em] text-muted">{tenantName}</h2>
          <Link to="/threats" className="inline-flex items-center gap-1 text-xs text-muted">
            {t.threats}
            <ArrowUpRight className="size-3.5" />
          </Link>
        </div>
        <div className="mt-1 divide-y divide-border">
          {current.detectors.map((d) => (
            <DetectorRow key={d.id} d={d} lang={lang} compact />
          ))}
        </div>
      </section>

      <p className="text-xs leading-relaxed text-subtle">{t.disclaimer}</p>
    </div>
  );
}

function HeroKicker({ t, tenant }: { t: Copy; tenant: string }) {
  return (
    <header>
      <p className="text-[11px] uppercase tracking-[0.2em] text-muted">{t.track}</p>
      <h1 className="mt-2 font-display text-[2.15rem] leading-[1.1] tracking-tight">
        {t.tagline}
      </h1>
      <p className="mt-2 text-sm text-muted">
        {tenant} · {t.product}
      </p>
    </header>
  );
}

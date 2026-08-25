import { createFileRoute, Link } from "@tanstack/react-router";
import { DetectorRow } from "@/components/detector-row";
import { ScoreRing } from "@/components/score-ring";
import { Button } from "@/components/ui/button";
import { copy } from "@/lib/amanah/copy";
import { weakestDetector } from "@/lib/amanah/scoring";
import { useAmanah } from "@/lib/amanah/store";

export const Route = createFileRoute("/report")({ component: Report });

function Report() {
  const lang = useAmanah((s) => s.lang);
  const current = useAmanah((s) => s.current);
  const t = copy[lang];

  if (!current) {
    return (
      <div className="space-y-4">
        <h1 className="font-display text-3xl">{t.viewReport}</h1>
        <p className="text-sm text-muted">{t.emptyScan}</p>
        <Button asChild>
          <Link to="/assess">{t.run}</Link>
        </Button>
      </div>
    );
  }

  const weak = weakestDetector(current);
  const when = new Date(current.at).toLocaleString(lang === "ur" ? "ur-PK" : "en-PK", {
    dateStyle: "medium",
    timeStyle: "short",
  });

  return (
    <article className="space-y-8">
      <header>
        <p className="text-[11px] uppercase tracking-[0.2em] text-muted">
          {t.tenant} · {current.mode === "live" ? t.live : t.simulated}
        </p>
        <h1 className="mt-2 font-display text-3xl tracking-tight">{t.viewReport}</h1>
        <p className="mt-1 text-sm text-muted">
          {t.scenarios[current.scenarioId].name} · {when}
        </p>
      </header>

      <div className="flex flex-col items-center rounded-xl bg-surface py-8 shadow-[var(--shadow-border)]">
        <ScoreRing score={current.overall} band={current.band} />
        <p className="mt-3 text-center text-[11px] uppercase tracking-[0.18em] text-muted">
          {t.scoreLabel}
        </p>
      </div>

      <section className="rounded-lg bg-raised p-4">
        <p className="text-[11px] uppercase tracking-[0.18em] text-muted">{t.weakest}</p>
        <h2 className="mt-1 font-display text-2xl">{t.detectors[weak.id].name}</h2>
        <p className="mt-2 text-sm text-muted">{weak.summary}</p>
        <p className="mt-2 text-sm">{weak.recommendation}</p>
      </section>

      <section>
        <h2 className="text-[11px] uppercase tracking-[0.18em] text-muted">{t.findings}</h2>
        <div className="mt-1 divide-y divide-border">
          {current.detectors.map((d) => (
            <DetectorRow key={d.id} d={d} lang={lang} />
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-[11px] uppercase tracking-[0.18em] text-muted">{t.harden}</h2>
        <ol className="mt-3 space-y-3">
          {current.detectors
            .filter((d) => d.band !== "strong")
            .map((d, i) => (
              <li key={d.id} className="flex gap-3 text-sm">
                <span className="font-display text-muted tabular">{String(i + 1).padStart(2, "0")}</span>
                <span>{d.recommendation}</span>
              </li>
            ))}
          {current.detectors.every((d) => d.band === "strong") ? (
            <li className="text-sm text-muted">{t.holdNative}</li>
          ) : null}
        </ol>
      </section>

      <section>
        <h2 className="text-[11px] uppercase tracking-[0.18em] text-muted">{t.notes}</h2>
        <div className="mt-3 space-y-3">
          {current.notes.map((n) => (
            <p key={n} className="text-sm leading-relaxed text-muted">
              {n}
            </p>
          ))}
        </div>
      </section>

      <p className="text-xs leading-relaxed text-subtle">{t.disclaimer}</p>

      <Button asChild className="w-full">
        <Link to="/assess">{t.run}</Link>
      </Button>
    </article>
  );
}

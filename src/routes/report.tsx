import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { DetectorRow } from "@/components/detector-row";
import { ScoreRing } from "@/components/score-ring";
import { Button } from "@/components/ui/button";
import { copy } from "@/lib/amanah/copy";
import { weakestDetector } from "@/lib/amanah/scoring";
import { decodeAssessment, sharePath } from "@/lib/amanah/share";
import { useAmanah } from "@/lib/amanah/store";
import type { Assessment } from "@/lib/amanah/types";

type Search = { s?: string };

export const Route = createFileRoute("/report")({
  component: Report,
  validateSearch: (raw: Record<string, unknown>): Search => ({
    s: typeof raw.s === "string" ? raw.s : undefined,
  }),
});

async function copyText(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    /* fall through */
  }
  try {
    const el = document.createElement("textarea");
    el.value = text;
    el.setAttribute("readonly", "");
    el.style.position = "fixed";
    el.style.opacity = "0";
    document.body.appendChild(el);
    el.select();
    const ok = document.execCommand("copy");
    el.remove();
    return ok;
  } catch {
    return false;
  }
}

function Report() {
  const lang = useAmanah((s) => s.lang);
  const stored = useAmanah((s) => s.current);
  const search = Route.useSearch();
  const t = copy[lang];
  const [copied, setCopied] = useState(false);
  const [shareErr, setShareErr] = useState<string | null>(null);

  const shared = useMemo(
    () => (search.s ? decodeAssessment(search.s) : null),
    [search.s],
  );
  const current: Assessment | null = shared ?? stored;

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
  const tenantName = t.tenants[current.tenantId ?? "wallet"].name;

  async function onShare() {
    setShareErr(null);
    const url = `${window.location.origin}${sharePath(current!)}`;
    const payload = { title: `${t.product} · ${current!.overall}`, text: t.shareHint, url };
    try {
      if (navigator.share) {
        await navigator.share(payload);
        return;
      }
    } catch {
      /* user cancelled or unsupported — copy instead */
    }
    const ok = await copyText(url);
    if (ok) {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2200);
    } else {
      setShareErr(t.shareFail);
    }
  }

  return (
    <article className="report-sheet space-y-8">
      <header>
        <p className="text-[11px] uppercase tracking-[0.2em] text-muted">
          {tenantName} · {current.mode === "live" ? t.live : t.simulated}
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

      <div className="print:hidden grid grid-cols-1 gap-2 sm:grid-cols-2">
        <Button onClick={() => void onShare()}>{copied ? t.linkCopied : t.share}</Button>
        <Button variant="outline" onClick={() => window.print()}>
          {t.savePdf}
        </Button>
      </div>
      <p className="print:hidden text-xs text-muted">{t.shareHint}</p>
      {shareErr ? <p className="print:hidden text-sm text-watch">{shareErr}</p> : null}

      <section className="rounded-lg bg-raised p-4">
        <p className="text-[11px] uppercase tracking-[0.18em] text-muted">{t.weakest}</p>
        <h2 className="mt-1 font-display text-2xl">{t.detectors[weak.id].name}</h2>
        <p className="mt-2 text-sm text-muted">{weak.summary}</p>
        <p className="mt-2 text-sm">{weak.recommendation}</p>
      </section>

      {current.diagnostics ? (
        <section>
          <h2 className="text-[11px] uppercase tracking-[0.18em] text-muted">{t.liveDiag}</h2>
          <dl className="mt-3 grid grid-cols-2 gap-3 text-sm">
            <div>
              <dt className="text-muted">{t.fps}</dt>
              <dd className="font-display text-xl tabular">{current.diagnostics.fps}</dd>
            </div>
            <div>
              <dt className="text-muted">{t.samples}</dt>
              <dd className="font-display text-xl tabular">{current.diagnostics.samples}</dd>
            </div>
            <div className="col-span-2">
              <dt className="text-muted">{t.policy}</dt>
              <dd>{current.diagnostics.virtual ? t.virtualCam : t.nativeCam}</dd>
            </div>
          </dl>
        </section>
      ) : null}

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

      <Button asChild className="print:hidden w-full">
        <Link to="/assess">{t.run}</Link>
      </Button>
    </article>
  );
}

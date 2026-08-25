import { createFileRoute } from "@tanstack/react-router";
import { copy, DETECTOR_ORDER } from "@/lib/amanah/copy";
import { useAmanah } from "@/lib/amanah/store";

export const Route = createFileRoute("/threats")({ component: Threats });

function Threats() {
  const lang = useAmanah((s) => s.lang);
  const t = copy[lang];

  return (
    <div className="space-y-8">
      <header>
        <p className="text-[11px] uppercase tracking-[0.2em] text-muted">{t.threats}</p>
        <h1 className="mt-2 font-display text-3xl tracking-tight">
          {t.threatsTitle}
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-muted">{t.threatsLead}</p>
      </header>

      <ul className="space-y-4">
        {DETECTOR_ORDER.map((id, i) => {
          const d = t.detectors[id];
          return (
            <li key={id} className="rounded-lg bg-surface p-4 shadow-[var(--shadow-border)] sm:p-5">
              <p className="font-display text-sm tabular text-muted">
                {String(i + 1).padStart(2, "0")}
              </p>
              <h2 className="mt-1 font-display text-2xl tracking-tight">{d.name}</h2>
              <p className="mt-1 text-xs uppercase tracking-[0.14em] text-muted">{d.short}</p>
              <p className="mt-3 text-sm leading-relaxed text-muted">{d.defend}</p>
            </li>
          );
        })}
      </ul>

      <aside className="rounded-lg bg-raised p-4">
        <p className="text-[11px] uppercase tracking-[0.18em] text-muted">{t.notes}</p>
        <p className="mt-2 text-sm leading-relaxed">{t.inclusionAside}</p>
      </aside>

      <p className="text-xs leading-relaxed text-subtle">{t.disclaimer}</p>
    </div>
  );
}

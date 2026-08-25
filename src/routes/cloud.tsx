import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { copy } from "@/lib/amanah/copy";
import { useAmanah } from "@/lib/amanah/store";

export const Route = createFileRoute("/cloud")({ component: Cloud });

function Cloud() {
  const lang = useAmanah((s) => s.lang);
  const t = copy[lang];

  return (
    <div className="space-y-8">
      <header>
        <p className="text-[11px] uppercase tracking-[0.2em] text-muted">{t.nav.cloud}</p>
        <h1 className="mt-2 font-display text-3xl tracking-tight">{t.cloudTitle}</h1>
        <p className="mt-3 text-sm leading-relaxed text-muted">{t.cloudLead}</p>
      </header>

      <ul className="space-y-4">
        {t.cloudSections.map((s, i) => (
          <li key={s.title} className="rounded-lg bg-surface p-4 shadow-[var(--shadow-border)] sm:p-5">
            <p className="font-display text-sm tabular text-muted">
              {String(i + 1).padStart(2, "0")} · {s.kicker}
            </p>
            <h2 className="mt-1 font-display text-2xl tracking-tight">{s.title}</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted">{s.body}</p>
          </li>
        ))}
      </ul>

      <p className="text-xs leading-relaxed text-subtle">{t.disclaimer}</p>

      <Button asChild className="w-full">
        <Link to="/assess">{t.run}</Link>
      </Button>
    </div>
  );
}

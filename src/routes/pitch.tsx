import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { copy } from "@/lib/amanah/copy";
import { useAmanah } from "@/lib/amanah/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/pitch")({ component: Pitch });

function Pitch() {
  const lang = useAmanah((s) => s.lang);
  const t = copy[lang];
  const slides = t.pitchSlides;
  const [i, setI] = useState(0);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;
    const id = window.setInterval(() => {
      setI((n) => (n + 1) % slides.length);
    }, 7000);
    return () => window.clearInterval(id);
  }, [slides.length]);

  const s = slides[i];

  return (
    <div className="space-y-8">
      <header className="flex items-end justify-between gap-3">
        <div>
          <p className="text-[11px] uppercase tracking-[0.2em] text-muted">{t.pitch}</p>
          <h1 className="mt-2 font-display text-3xl tracking-tight">{t.product}</h1>
        </div>
        <p className="font-display text-sm tabular text-muted">
          {String(i + 1).padStart(2, "0")} / {String(slides.length).padStart(2, "0")}
        </p>
      </header>

      <section className="min-h-[280px] rounded-xl bg-surface p-5 shadow-[var(--shadow-border)] sm:p-8">
        <p className="text-[11px] uppercase tracking-[0.2em] text-muted">{s.kicker}</p>
        <h2 className="mt-3 font-display text-[1.85rem] leading-[1.15] tracking-tight sm:text-4xl">
          {s.title}
        </h2>
        <p className="mt-4 max-w-prose text-sm leading-relaxed text-muted sm:text-base">{s.body}</p>
      </section>

      <div className="flex gap-2">
        {slides.map((_, idx) => (
          <button
            key={idx}
            type="button"
            aria-label={`Slide ${idx + 1}`}
            onClick={() => setI(idx)}
            className={cn(
              "h-1.5 flex-1 rounded-full",
              idx === i ? "bg-primary" : "bg-raised",
            )}
          />
        ))}
      </div>

      <div className="flex gap-2">
        <Button
          variant="outline"
          className="flex-1"
          onClick={() => setI((n) => (n - 1 + slides.length) % slides.length)}
        >
          {t.prev}
        </Button>
        <Button
          className="flex-1"
          onClick={() => setI((n) => (n + 1) % slides.length)}
        >
          {t.next}
        </Button>
      </div>

      <Button asChild variant="subtle" className="w-full">
        <Link to="/assess">{t.run}</Link>
      </Button>

      <p className="text-xs leading-relaxed text-subtle">{t.disclaimer}</p>
    </div>
  );
}

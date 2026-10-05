import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { copy } from "@/lib/amanah/copy";
import { useAmanah } from "@/lib/amanah/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/optics")({ component: Optics });

type SetId = "celeb" | "deep" | "veo";

const COPY_SETS = {
  en: {
    labels: ["Accuracy", "Sensitivity", "Specificity", "Dks"] as const,
    deepLabels: ["K = 0 accuracy", "K = 2 accuracy", "K = 2 AUROC", "Dks at K = 2"] as const,
    kinds: {
      celeb: "Experiment · L = 15 · K = 0",
      deep: "In silico · harder face-swap",
      veo: "Experiment · 50-video fine-tune",
    },
    notes: {
      celeb:
        "105 real and 105 fake held-out videos, 100 frame-sample seeds, 1,400 phase patterns. Simulation was 98.12% ± 0.28. Human sensitivity on Celeb-DF fakes has been reported near 21%.",
      deep: "CLIP-matched identities. Two passive diffractive layers raise accuracy without adding decoder latency. K = 0 specificity 86.20%; K = 2 specificity 94.50%. Not the photographed bench.",
      veo: "Text-to-video, not a face-swap. Five Gemini clips already reached 85.1% in simulation; fifty clips, under 1% of the original training pass, transferred to the bench with no optical fine-tune.",
    },
    energyTitle: "Table 1 · decoder energy per video",
    cols: ["Decoder", "Energy", "Celeb-DF", "DeepSpeak"] as const,
  },
  ur: {
    labels: ["درستگی", "حساسیت", "اختصاص", "Dks"] as const,
    deepLabels: ["K = 0 درستگی", "K = 2 درستگی", "K = 2 AUROC", "K = 2 پر Dks"] as const,
    kinds: {
      celeb: "تجربہ · L = 15 · K = 0",
      deep: "حسابی · مشکل فیس سوئپ",
      veo: "تجربہ · 50 ویڈیو فائن ٹیون",
    },
    notes: {
      celeb:
        "105 اصلی اور 105 جعلی الگ ویڈیوز، 100 سیمپل، 1,400 فیز پیٹرن۔ سمیولیشن 98.12% ± 0.28۔ Celeb-DF پر انسانی حساسیت تقریباً 21% بتائی گئی ہے۔",
      deep: "CLIP سے جوڑی شناختیں۔ دو غیر فعال تہیں درستگی بڑھاتی ہیں، ڈیکوڈر کی تاخیر نہیں۔ K = 0 اختصاص 86.20%؛ K = 2 پر 94.50%۔ یہ تصویر والا بینچ نہیں۔",
      veo: "متن سے ویڈیو، فیس سوئپ نہیں۔ پانچ کلپس پر سمیولیشن 85.1%؛ پچاس کلپس، اصل ٹریننگ کے 1% سے کم، بغیر آپٹیکل فائن ٹیون بینچ پر منتقل۔",
    },
    energyTitle: "جدول ۱ · فی ویڈیو ڈیکوڈر توانائی",
    cols: ["ڈیکوڈر", "توانائی", "Celeb-DF", "DeepSpeak"] as const,
  },
} as const;

const VALUES: Record<SetId, string[]> = {
  celeb: ["97.79% ± 0.62", "99.86%", "95.72% ± 1.37", "0.973"],
  deep: ["88.98%", "95.76%", "98.23%", "0.925"],
  veo: ["94.80% ± 0.78", "97.61%", "92.00% ± 1.50", "0.909"],
};

const NAMES: Record<SetId, string> = {
  celeb: "Celeb-DF",
  deep: "DeepSpeak",
  veo: "VEO-3",
};

/** Illustrates Eq. 10 only. Not experimental intensities. */
const SKETCH: { fake: boolean; pos: number; neg: number }[] = [
  { fake: true, pos: 0.84, neg: 0.22 },
  { fake: false, pos: 0.26, neg: 0.78 },
  { fake: true, pos: 0.71, neg: 0.31 },
  { fake: false, pos: 0.18, neg: 0.7 },
  { fake: true, pos: 0.9, neg: 0.16 },
  { fake: false, pos: 0.33, neg: 0.81 },
  { fake: true, pos: 0.66, neg: 0.28 },
  { fake: false, pos: 0.21, neg: 0.74 },
  { fake: true, pos: 0.88, neg: 0.24 },
  { fake: false, pos: 0.3, neg: 0.86 },
  { fake: true, pos: 0.76, neg: 0.2 },
  { fake: false, pos: 0.24, neg: 0.69 },
  { fake: true, pos: 0.8, neg: 0.27 },
  { fake: false, pos: 0.19, neg: 0.77 },
  { fake: true, pos: 0.73, neg: 0.25 },
];

const ENERGY = [
  { name: "Optical K = 2", energy: "1.38–4.11 mJ", celeb: "99.18%", deep: "95.76%" },
  { name: "Optical K = 0", energy: "1.38–4.11 mJ", celeb: "98.12%", deep: "88.98%" },
  { name: "PLM, 4-bit, K = 0", energy: "0.60–0.99 mJ", celeb: "97.98%", deep: "88.00%" },
  { name: "Deep CNN (64, 56, 56)", energy: "30.44 mJ", celeb: "98.20%", deep: "92.76%" },
  { name: "Low-rank MLP", energy: "0.004 mJ", celeb: "94.77%", deep: "84.84%" },
];

function Optics() {
  const lang = useAmanah((s) => s.lang);
  const t = copy[lang].optics;
  const pack = COPY_SETS[lang];
  const [setId, pick] = useState<SetId>("celeb");
  const labels = setId === "deep" ? pack.deepLabels : pack.labels;
  const rows = labels.map((label, i) => ({ label, value: VALUES[setId][i] }));

  return (
    <div className="space-y-8">
      <header>
        <p className="text-[11px] uppercase tracking-[0.2em] text-muted">{t.kicker}</p>
        <h1 className="mt-2 font-display text-3xl tracking-tight">{t.title}</h1>
        <p className="mt-3 text-sm leading-relaxed text-muted">{t.lead}</p>
      </header>

      <div className="flex gap-1 rounded-sm bg-raised p-0.5">
        {(["celeb", "deep", "veo"] as const).map((id) => (
          <button
            key={id}
            type="button"
            onClick={() => pick(id)}
            className={cn(
              "h-10 min-w-0 flex-1 rounded-xs px-2 text-[11px] tracking-wide",
              setId === id ? "bg-primary text-primary-fg" : "text-muted",
            )}
          >
            {NAMES[id]}
          </button>
        ))}
      </div>

      <section className="rounded-lg bg-surface p-4 shadow-[var(--shadow-border)] sm:p-5">
        <p className="text-[11px] uppercase tracking-[0.16em] text-muted">{pack.kinds[setId]}</p>
        <h2 className="mt-1 font-display text-2xl tracking-tight">{NAMES[setId]}</h2>
        <dl className="mt-4 grid grid-cols-2 gap-3">
          {rows.map((row) => (
            <div key={row.label} className="rounded-md bg-raised px-3 py-3">
              <dt className="text-[11px] uppercase tracking-[0.14em] text-muted">{row.label}</dt>
              <dd className="mt-1 font-display text-xl tabular tracking-tight">{row.value}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-4 text-sm leading-relaxed text-muted">{pack.notes[setId]}</p>
      </section>

      <section>
        <div className="flex items-baseline justify-between gap-3">
          <h2 className="text-[11px] uppercase tracking-[0.18em] text-muted">{t.sketch}</h2>
          <p className="text-[11px] text-subtle">L = 15</p>
        </div>
        <p className="mt-2 text-sm leading-relaxed text-muted">{t.rule}</p>
        <ul className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-3">
          {SKETCH.map((ch, i) => {
            const score = (ch.pos - ch.neg) / (ch.pos + ch.neg);
            return (
              <li key={i} className="rounded-md bg-surface px-3 py-2.5 shadow-[var(--shadow-border)]">
                <div className="flex items-baseline justify-between">
                  <span className="font-mono text-[11px] text-muted">{String(i + 1).padStart(2, "0")}</span>
                  <span className={cn("text-[11px] uppercase tracking-[0.14em]", ch.fake ? "text-fail" : "text-ok")}>
                    {ch.fake ? t.fake : t.real} {score > 0 ? "+" : ""}
                    {score.toFixed(2)}
                  </span>
                </div>
                <div className="mt-2 space-y-1">
                  <Bar tone="fail" value={ch.pos} />
                  <Bar tone="ok" value={ch.neg} />
                </div>
              </li>
            );
          })}
        </ul>
        <p className="mt-3 text-xs leading-relaxed text-subtle">{t.sketchNote}</p>
      </section>

      <section className="overflow-hidden rounded-lg bg-surface shadow-[var(--shadow-border)]">
        <p className="px-4 pt-4 text-[11px] uppercase tracking-[0.16em] text-muted sm:px-5">
          {pack.energyTitle}
        </p>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[32rem] text-left text-sm">
            <thead>
              <tr className="border-b border-border text-[11px] uppercase tracking-[0.12em] text-muted">
                {pack.cols.map((col) => (
                  <th key={col} className="px-4 py-2 font-medium first:sm:px-5 last:sm:px-5">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ENERGY.map((row) => (
                <tr key={row.name} className="border-b border-border last:border-0">
                  <td className="px-4 py-2.5 sm:px-5">{row.name}</td>
                  <td className="px-4 py-2.5 tabular text-muted">{row.energy}</td>
                  <td className="px-4 py-2.5 tabular">{row.celeb}</td>
                  <td className="px-4 py-2.5 tabular sm:px-5">{row.deep}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="px-4 py-4 text-xs leading-relaxed text-subtle sm:px-5">{t.honest}</p>
      </section>

      <aside className="rounded-lg bg-raised p-4">
        <p className="text-[11px] uppercase tracking-[0.18em] text-muted">{t.where}</p>
        <p className="mt-2 text-sm leading-relaxed">{t.whereBody}</p>
      </aside>

      <p className="text-xs leading-relaxed text-subtle">
        {t.cite}{" "}
        <a
          className="underline decoration-border-strong underline-offset-2"
          href="https://doi.org/10.1186/s43593-026-00143-y"
          target="_blank"
          rel="noreferrer"
        >
          {t.read}
        </a>
      </p>
    </div>
  );
}

function Bar({ tone, value }: { tone: "fail" | "ok"; value: number }) {
  return (
    <div className="h-1.5 overflow-hidden rounded-full bg-raised">
      <div
        className={cn("h-full rounded-full", tone === "fail" ? "bg-fail" : "bg-ok")}
        style={{ width: `${Math.round(value * 100)}%` }}
      />
    </div>
  );
}

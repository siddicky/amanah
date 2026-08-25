import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Assessment, CaptureMode, DetectorResult, Lang, ScenarioId, TenantId } from "./types";
import { scoreAssessment } from "./scoring";

type AmanahState = {
  lang: Lang;
  scenarioId: ScenarioId;
  tenantId: TenantId;
  mode: CaptureMode;
  current: Assessment | null;
  history: Assessment[];
  hydrated: boolean;
  setLang: (lang: Lang) => void;
  setScenario: (id: ScenarioId) => void;
  setTenant: (id: TenantId) => void;
  setMode: (mode: CaptureMode) => void;
  runSimulated: () => Assessment;
  commit: (a: Assessment) => void;
  markHydrated: () => void;
};

function det(
  id: DetectorResult["id"],
  score: number,
  band: DetectorResult["band"],
  summary: string,
  recommendation: string,
): DetectorResult {
  return { id, score, confidence: 0.86, band, summary, recommendation };
}

const seed: Assessment = {
  id: "seed-noor-field",
  at: Date.parse("2026-08-24T18:10:00+05:00"),
  scenarioId: "inclusion-field",
  mode: "simulated",
  tenant: "Noor Wallet",
  tenantId: "wallet",
  overall: 84,
  band: "strong",
  cameraLabel: null,
  detectors: [
    det(
      "injection",
      94,
      "strong",
      "Native camera path. No virtual-device labels, no substituted sink.",
      "Keep native capture only. Do not add an upload fallback.",
    ),
    det(
      "replay",
      81,
      "strong",
      "Micro-motion present, but a short still-window at start of capture.",
      "Maintain a two-second motion window before decision.",
    ),
    det(
      "liveness",
      84,
      "strong",
      "Passive presence holds. Subject is live; challenge-response not required.",
      "Passive liveness is enough for this device class.",
    ),
    det(
      "lighting",
      57,
      "watch",
      "Open shade, low dynamic range. Typical Android Go outdoor onboarding.",
      "Assist the user: exposure lock and optional torch. Do not drop the threshold.",
    ),
    det(
      "temporal",
      88,
      "strong",
      "Delivered frame clock within tolerance of the device camera.",
      "Frame clock is native.",
    ),
    det(
      "document",
      90,
      "strong",
      "Selfie capture is bind-ready. Document image not required for this pass.",
      "Bind quality is sufficient.",
    ),
  ],
  findings: [
    {
      detector: "lighting",
      severity: "watch",
      title: "lighting needs watch",
      detail: "Open shade, low dynamic range. Typical Android Go outdoor onboarding.",
    },
  ],
  notes: [
    "Weak lighting is not fraud. Assist the capture (torch, shade, exposure lock) so Android Go users still clear KYC.",
    "Do not lower injection or replay thresholds to ‘make inclusion work’.",
    "Wallet policy fails closed on injection only — lighting stays the inclusion lever.",
  ],
};

export const useAmanah = create<AmanahState>()(
  persist(
    (set, get) => ({
      lang: "en",
      scenarioId: "inclusion-field",
      tenantId: "wallet",
      mode: "simulated",
      current: seed,
      history: [seed],
      hydrated: false,
      setLang: (lang) => set({ lang }),
      setScenario: (scenarioId) => set({ scenarioId }),
      setTenant: (tenantId) => set({ tenantId }),
      setMode: (mode) => set({ mode }),
      runSimulated: () => {
        const a = scoreAssessment({
          scenarioId: get().scenarioId,
          tenantId: get().tenantId,
          mode: "simulated",
        });
        set((s) => ({
          current: a,
          history: [a, ...s.history].slice(0, 12),
        }));
        return a;
      },
      commit: (a) =>
        set((s) => ({
          current: a,
          history: [a, ...s.history].slice(0, 12),
        })),
      markHydrated: () => set({ hydrated: true }),
    }),
    {
      name: "amanah-v2",
      skipHydration: true,
      partialize: (s) => ({
        lang: s.lang,
        scenarioId: s.scenarioId,
        tenantId: s.tenantId,
        current: s.current,
        history: s.history,
      }),
    },
  ),
);

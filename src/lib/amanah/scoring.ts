import { clamp } from "@/lib/utils";
import type {
  Assessment,
  Band,
  CaptureMode,
  DetectorId,
  DetectorResult,
  Finding,
  ScenarioId,
} from "./types";
import { DETECTOR_ORDER } from "./copy";

const WEIGHTS: Record<DetectorId, number> = {
  injection: 0.25,
  replay: 0.18,
  liveness: 0.17,
  lighting: 0.12,
  temporal: 0.13,
  document: 0.15,
};

const BASE: Record<ScenarioId, Record<DetectorId, number>> = {
  "inclusion-field": {
    injection: 94,
    replay: 81,
    liveness: 84,
    lighting: 57,
    temporal: 88,
    document: 90,
  },
  "lab-control": {
    injection: 97,
    replay: 93,
    liveness: 95,
    lighting: 92,
    temporal: 94,
    document: 91,
  },
  "hostile-channel": {
    injection: 28,
    replay: 46,
    liveness: 41,
    lighting: 71,
    temporal: 38,
    document: 64,
  },
};

function bandOf(score: number): Band {
  if (score < 50) return "fail";
  if (score < 75) return "watch";
  return "strong";
}

function jitter(base: number, spread = 2.4) {
  return Math.round(clamp(base + (Math.random() * 2 - 1) * spread, 0, 100));
}

const SUMMARIES: Record<ScenarioId, Record<DetectorId, string>> = {
  "inclusion-field": {
    injection: "Native camera path. No virtual-device labels, no substituted sink.",
    replay: "Micro-motion present, but a short still-window at start of capture.",
    liveness: "Passive presence holds. Subject is live; challenge-response not required.",
    lighting: "Open shade, low dynamic range. Typical Android Go outdoor onboarding.",
    temporal: "Delivered frame clock within tolerance of the device camera.",
    document: "Selfie capture is bind-ready. Document image not required for this pass.",
  },
  "lab-control": {
    injection: "Clean device enumeration. Capture originates on a physical sensor.",
    replay: "Continuous micro-motion across the full window.",
    liveness: "Photometric flicker and pose drift consistent with a live subject.",
    lighting: "Even illumination, no clipping, no torch strobe.",
    temporal: "Stable native FPS. No frame duplication.",
    document: "High-quality bind. Geometry and sharpness within policy.",
  },
  "hostile-channel": {
    injection: "Capture device identifies as a virtual camera. Fail closed.",
    replay: "High frame-to-frame correlation — likely a looped or injected stream.",
    liveness: "Insufficient natural motion. Presence is not established.",
    lighting: "Illumination is plausible; it is not the failing control.",
    temporal: "FPS does not match a physical sensor clock. Stretching or duplication likely.",
    document: "Bind skipped — channel integrity failed first.",
  },
};

const RECS: Record<DetectorId, Record<Band, string>> = {
  injection: {
    strong: "Keep native capture only. Do not add an upload fallback.",
    watch: "Treat unknown camera labels as watch. Require a second signal before pass.",
    fail: "Reject the session. Do not offer a photo-upload bypass.",
  },
  replay: {
    strong: "Maintain a two-second motion window before decision.",
    watch: "Extend the motion window and refuse perfectly still crops.",
    fail: "Fail closed on looped or printed-photo signatures.",
  },
  liveness: {
    strong: "Passive liveness is enough for this device class.",
    watch: "Add a light active cue (turn head) only if passive is borderline.",
    fail: "Do not issue an identity. Re-capture with an operator assist.",
  },
  lighting: {
    strong: "Exposure is within policy.",
    watch: "Assist the user: exposure lock and optional torch. Do not drop the threshold.",
    fail: "Re-capture in better light. Never compensate by weakening other detectors.",
  },
  temporal: {
    strong: "Frame clock is native.",
    watch: "Flag FPS drift for review; do not auto-pass high-risk tenants.",
    fail: "Reject streams whose clock does not match the sensor.",
  },
  document: {
    strong: "Bind quality is sufficient.",
    watch: "Re-take the document plane; do not accept screenshots of IDs.",
    fail: "Do not generate or auto-fill an identity document. Re-capture only.",
  },
};

export function scoreAssessment(opts: {
  scenarioId: ScenarioId;
  mode: CaptureMode;
  cameraLabel?: string | null;
  liveOverrides?: Partial<Record<DetectorId, number>>;
}): Assessment {
  const { scenarioId, mode, cameraLabel = null, liveOverrides } = opts;
  const detectors: DetectorResult[] = DETECTOR_ORDER.map((id) => {
    const raw = liveOverrides?.[id] ?? jitter(BASE[scenarioId][id]);
    const score = Math.round(raw);
    const b = bandOf(score);
    return {
      id,
      score,
      confidence: clamp(0.72 + score / 400, 0.6, 0.97),
      band: b,
      summary: SUMMARIES[scenarioId][id],
      recommendation: RECS[id][b],
    };
  });

  const overall = Math.round(
    detectors.reduce((acc, d) => acc + d.score * WEIGHTS[d.id], 0),
  );
  const weakest = detectors.reduce((a, b) => (a.score <= b.score ? a : b));

  const findings: Finding[] = detectors
    .filter((d) => d.band !== "strong")
    .sort((a, b) => a.score - b.score)
    .map((d) => ({
      detector: d.id,
      severity: d.band,
      title: d.band === "fail" ? `${d.id} failed closed` : `${d.id} needs watch`,
      detail: d.summary,
    }));

  const notes: string[] =
    scenarioId === "inclusion-field"
      ? [
          "Weak lighting is not fraud. Assist the capture (torch, shade, exposure lock) so Android Go users still clear KYC.",
          "Do not lower injection or replay thresholds to ‘make inclusion work’.",
        ]
      : scenarioId === "hostile-channel"
        ? [
            "Channel integrity failed. No amount of a smiling selfie should override a virtual camera.",
            "Inclusion does not apply: this session is not an underserved user, it is a substituted sink.",
          ]
        : [
            "Lab control is the ceiling, not the field. Tune policy on inclusion-field captures.",
          ];

  return {
    id: `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
    at: Date.now(),
    scenarioId,
    mode,
    tenant: "Noor Wallet",
    overall,
    band: bandOf(overall),
    detectors,
    findings,
    notes,
    cameraLabel,
  };
}

export function weakestDetector(a: Assessment): DetectorResult {
  return a.detectors.reduce((x, y) => (x.score <= y.score ? x : y));
}

export { WEIGHTS, bandOf };

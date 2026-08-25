import type {
  Assessment,
  Band,
  CaptureMode,
  DetectorId,
  DetectorResult,
  Finding,
  LiveDiagnostics,
  ScenarioId,
  TenantId,
} from "./types.ts";
import { DETECTOR_ORDER } from "./types.ts";
import { liveSummary } from "./live.ts";
import { tenantOf } from "./policy.ts";

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

const WEIGHTS: Record<DetectorId, number> = tenantOf("wallet").weights;

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

export function bandOf(score: number): Band {
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

const TENANT_NAME: Record<TenantId, string> = {
  wallet: "Noor Wallet",
  bank: "HBL Digital",
  telco: "JazzCash SIM",
};

function notesFor(scenarioId: ScenarioId, tenantId: TenantId, tripped: boolean): string[] {
  const base =
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
        : ["Lab control is the ceiling, not the field. Tune policy on inclusion-field captures."];

  if (tenantId === "bank") {
    base.push(
      "Bank policy: a failed injection, replay, or document bind cannot be averaged out by a high liveness score.",
    );
  } else if (tenantId === "telco") {
    base.push("SIM-KYC may torch-assist a dim capture. It must not accept a screenshot CNIC.");
  } else {
    base.push("Wallet policy fails closed on injection only — lighting stays the inclusion lever.");
  }
  if (tripped) {
    base.push("Fail-closed control tripped. Overall is capped below Hold regardless of other detectors.");
  }
  return base;
}

export function decorateAssessment(opts: {
  id: string;
  at: number;
  scenarioId: ScenarioId;
  mode: CaptureMode;
  tenantId: TenantId;
  cameraLabel: string | null;
  scores: number[];
  diagnostics?: LiveDiagnostics;
}): Assessment {
  const policy = tenantOf(opts.tenantId);
  const detectors: DetectorResult[] = DETECTOR_ORDER.map((id, i) => {
    const score = Math.round(clamp(opts.scores[i] ?? 0, 0, 100));
    const b = bandOf(score);
    const summary =
      opts.mode === "live"
        ? liveSummary(id, b, opts.diagnostics)
        : SUMMARIES[opts.scenarioId][id];
    return {
      id,
      score,
      confidence: clamp(0.72 + score / 400, 0.6, 0.97),
      band: b,
      summary,
      recommendation: RECS[id][b],
    };
  });

  let overall = Math.round(
    detectors.reduce((acc, d) => acc + d.score * policy.weights[d.id], 0),
  );
  const tripped = policy.failClosed.some(
    (id) => detectors.find((d) => d.id === id)?.band === "fail",
  );
  if (tripped) overall = Math.min(overall, 49);

  const findings: Finding[] = detectors
    .filter((d) => d.band !== "strong")
    .sort((a, b) => a.score - b.score)
    .map((d) => ({
      detector: d.id,
      severity: d.band,
      title: d.band === "fail" ? `${d.id} failed closed` : `${d.id} needs watch`,
      detail: d.summary,
    }));

  return {
    id: opts.id,
    at: opts.at,
    scenarioId: opts.scenarioId,
    mode: opts.mode,
    tenant: TENANT_NAME[opts.tenantId],
    tenantId: opts.tenantId,
    overall,
    band: bandOf(overall),
    detectors,
    findings,
    notes: notesFor(opts.scenarioId, opts.tenantId, tripped),
    cameraLabel: opts.cameraLabel,
    diagnostics: opts.diagnostics,
  };
}

export function scoreAssessment(opts: {
  scenarioId: ScenarioId;
  mode: CaptureMode;
  tenantId?: TenantId;
  cameraLabel?: string | null;
  liveOverrides?: Partial<Record<DetectorId, number>>;
  diagnostics?: LiveDiagnostics;
}): Assessment {
  const tenantId = opts.tenantId ?? "wallet";
  const { scenarioId, mode, cameraLabel = null, liveOverrides } = opts;
  const scores = DETECTOR_ORDER.map((id) => {
    const raw = liveOverrides?.[id] ?? jitter(BASE[scenarioId][id]);
    return Math.round(raw);
  });
  return decorateAssessment({
    id: `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
    at: Date.now(),
    scenarioId,
    mode,
    tenantId,
    cameraLabel,
    scores,
    diagnostics: opts.diagnostics,
  });
}

export function weakestDetector(a: Assessment): DetectorResult {
  return a.detectors.reduce((x, y) => (x.score <= y.score ? x : y));
}

export { WEIGHTS, SUMMARIES, RECS, TENANT_NAME, BASE };

import type { Band, DetectorId, LiveDiagnostics } from "./types.ts";

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

const VIRTUAL_HINTS = [
  "obs",
  "virtual",
  "manycam",
  "snap camera",
  "xsplit",
  "camtwist",
  "droidcam",
  "iriun",
  "mmhmm",
  "unity capture",
  "v4l2loopback",
  "dummy",
  "fake",
  "spark ar",
  "webcamoid",
  "splitcam",
  "youcam",
  "altercam",
  "avatarify",
  "deepfacelive",
  "epoccam",
  "ivcam",
  "reincubate camo studio",
  "loopback",
  "prism live studio",
];

export type FrameSample = {
  t: number;
  mean: number;
  variance: number;
  motion: number;
};

export function isVirtualLabel(label: string | null | undefined): boolean {
  if (!label) return false;
  const n = label.toLowerCase();
  return VIRTUAL_HINTS.some((h) => n.includes(h));
}

export function anyVirtual(labels: Array<string | null | undefined>): boolean {
  return labels.some((l) => isVirtualLabel(l));
}

export function sampleFrame(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  prev?: Uint8ClampedArray | null,
): { stats: FrameSample; pixels: Uint8ClampedArray } {
  const img = ctx.getImageData(0, 0, w, h);
  const data = img.data;
  let sum = 0;
  let sumSq = 0;
  let motionAcc = 0;
  const step = 8 * 4;
  let count = 0;
  for (let i = 0; i < data.length; i += step) {
    const y = 0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2];
    sum += y;
    sumSq += y * y;
    if (prev) {
      const py = 0.2126 * prev[i] + 0.7152 * prev[i + 1] + 0.0722 * prev[i + 2];
      motionAcc += Math.abs(y - py);
    }
    count += 1;
  }
  const mean = sum / Math.max(count, 1);
  const variance = Math.max(0, sumSq / Math.max(count, 1) - mean * mean);
  const motion = prev ? motionAcc / Math.max(count, 1) : 0;
  return {
    stats: { t: performance.now(), mean, variance, motion },
    pixels: data,
  };
}

export function meanOf(xs: number[]): number {
  if (!xs.length) return 0;
  return xs.reduce((a, b) => a + b, 0) / xs.length;
}

export function stddev(xs: number[]): number {
  if (xs.length < 2) return 0;
  const m = meanOf(xs);
  const v = xs.reduce((a, b) => a + (b - m) ** 2, 0) / xs.length;
  return Math.sqrt(v);
}

export function duplicateRatio(motions: number[], threshold = 1.15): number {
  if (!motions.length) return 1;
  return motions.filter((m) => m < threshold).length / motions.length;
}

export function lumaJump(means: number[]): number {
  let max = 0;
  for (let i = 1; i < means.length; i++) {
    max = Math.max(max, Math.abs(means[i] - means[i - 1]));
  }
  return max;
}

export function intervalCv(times: number[]): number {
  if (times.length < 6) return 0.12;
  const gaps: number[] = [];
  for (let i = 1; i < times.length; i++) {
    const g = times[i] - times[i - 1];
    if (g > 0) gaps.push(g);
  }
  const m = meanOf(gaps);
  if (m <= 0) return 0;
  return stddev(gaps) / m;
}

export function autocorrPeak(xs: number[]): number {
  if (xs.length < 12) return 0;
  const m = meanOf(xs);
  const centered = xs.map((x) => x - m);
  const varSum = centered.reduce((a, b) => a + b * b, 0);
  if (varSum < 1e-6) return 0.95;
  let best = 0;
  const maxLag = Math.min(36, Math.floor(xs.length / 2));
  for (let lag = 4; lag <= maxLag; lag++) {
    let num = 0;
    const n = xs.length - lag;
    for (let i = 0; i < n; i++) num += centered[i] * centered[i + lag];
    best = Math.max(best, num / varSum);
  }
  return clamp(best, 0, 1);
}

export function liveOverridesFromSession(
  frames: FrameSample[],
  cameraLabel: string | null,
  measuredFps: number,
  extraLabels: string[] = [],
): { scores: Partial<Record<DetectorId, number>>; diagnostics: LiveDiagnostics } {
  const virtual = anyVirtual([cameraLabel, ...extraLabels]);
  const motions = frames.map((f) => f.motion);
  const means = frames.map((f) => f.mean);
  const vars = frames.map((f) => f.variance);
  const times = frames.map((f) => f.t);
  const dup = duplicateRatio(motions);
  const period = autocorrPeak(motions);
  const diagnostics: LiveDiagnostics = {
    fps: Math.round(measuredFps * 10) / 10,
    samples: frames.length,
    virtual,
    duplicateRatio: Math.round(dup * 100) / 100,
    periodicity: Math.round(period * 100) / 100,
  };

  if (frames.length < 8) {
    return {
      scores: {
        liveness: 48,
        replay: 50,
        lighting: 55,
        temporal: clamp(measuredFps * 3.2, 20, 90),
        injection: virtual ? 24 : 72,
        document: 70,
      },
      diagnostics,
    };
  }

  const avgMotion = meanOf(motions);
  const avgMean = meanOf(means);
  const avgVar = meanOf(vars);
  const lumaRange = Math.max(...means) - Math.min(...means);
  const jump = lumaJump(means);
  const clipped = avgMean < 18 || avgMean > 238;
  const cv = intervalCv(times);
  const motionVar = stddev(motions);

  const injection = virtual ? 22 : cameraLabel ? 93 : 74;

  let replay = 40 + avgMotion * 3.0;
  if (dup > 0.72) replay -= 22;
  if (period > 0.88 && (dup > 0.28 || avgMotion < 8)) replay -= 18;

  const liveness = 28 + avgMotion * 2.6 + lumaRange * 0.35 + motionVar * 0.8;

  let lighting = 42 + Math.min(avgVar, 80) * 0.4 + (avgMean > 28 && avgMean < 210 ? 16 : 0);
  if (jump > 40) lighting -= 14;
  if (clipped) lighting -= 20;

  let temporal = 40 + (measuredFps - 8) * 2.4;
  if (measuredFps < 10) temporal = Math.min(temporal, 42);
  if (measuredFps > 48) temporal -= 12;
  if (cv < 0.02 && frames.length > 20) temporal -= 10;
  if (cv > 0.45) temporal -= 12;

  return {
    scores: {
      injection: Math.round(clamp(injection, 12, 97)),
      replay: Math.round(clamp(replay, 18, 96)),
      liveness: Math.round(clamp(liveness, 20, 97)),
      lighting: Math.round(clamp(lighting, 18, 96)),
      temporal: Math.round(clamp(temporal, 18, 97)),
      document: 78,
    },
    diagnostics,
  };
}

export function liveSummary(id: DetectorId, band: Band, diag?: LiveDiagnostics): string {
  if (id === "injection") {
    if (diag?.virtual) return "Capture device matches a known virtual-camera label. Fail closed.";
    if (band === "watch") return "Camera label is empty or unknown. Treat as watch — require a second signal.";
    return "Device label is consistent with a physical sensor. No virtual-camera hint.";
  }
  if (id === "replay") {
    if (band === "fail") return "Motion is too still or too periodic for a live subject. Loop or print likely.";
    if (band === "watch") return "Micro-motion is thin. Extend the window before a pass.";
    return "Frame-to-frame change is consistent with a live person, not a loop.";
  }
  if (id === "liveness") {
    if (band === "fail") return "Passive presence is not established from motion or photometric flicker.";
    if (band === "watch") return "Presence is borderline. A light active cue is enough — do not drop the bar.";
    return "Natural motion and flicker hold. Subject is live.";
  }
  if (id === "lighting") {
    if (band === "fail") return "Exposure is clipped or jumping. Re-capture; do not weaken other detectors.";
    if (band === "watch") return "Low dynamic range or open shade. Assist with torch or exposure lock.";
    return "Illumination is within policy.";
  }
  if (id === "temporal") {
    if (band === "fail") return "Delivered FPS does not match a physical sensor clock.";
    if (band === "watch") return "Frame clock is noisy or unusually perfect. Flag for review.";
    return diag
      ? `Native-looking frame clock at ${diag.fps} fps.`
      : "Frame clock is native.";
  }
  if (band === "fail") return "Bind skipped — channel integrity failed first.";
  if (band === "watch") return "Document plane is weak. Re-take; do not accept a screenshot of an ID.";
  return "Selfie capture is bind-ready. No document was generated.";
}

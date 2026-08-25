import { clamp } from "@/lib/utils";
import type { DetectorId } from "./types";

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
  "unity",
  "v4l2loopback",
  "dummy",
  "fake",
  "spark ar",
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
  const n = w * h;
  const step = 16 * 4;
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

export function liveOverridesFromSession(
  frames: FrameSample[],
  cameraLabel: string | null,
  measuredFps: number,
): Partial<Record<DetectorId, number>> {
  if (frames.length < 8) {
    return {
      liveness: 48,
      replay: 50,
      lighting: 55,
      temporal: clamp(measuredFps * 3.2, 20, 90),
      injection: isVirtualLabel(cameraLabel) ? 24 : 88,
      document: 70,
    };
  }

  const motions = frames.map((f) => f.motion);
  const means = frames.map((f) => f.mean);
  const vars = frames.map((f) => f.variance);
  const avgMotion = motions.reduce((a, b) => a + b, 0) / motions.length;
  const avgMean = means.reduce((a, b) => a + b, 0) / means.length;
  const avgVar = vars.reduce((a, b) => a + b, 0) / vars.length;
  const lumaRange = Math.max(...means) - Math.min(...means);

  const injection = isVirtualLabel(cameraLabel) ? 22 + Math.random() * 8 : 90 + Math.random() * 6;
  const replay = clamp(38 + avgMotion * 3.4, 18, 96);
  const liveness = clamp(30 + avgMotion * 3.1 + lumaRange * 0.4, 20, 97);
  const lighting = clamp(40 + Math.min(avgVar, 80) * 0.45 + (avgMean > 28 && avgMean < 210 ? 18 : 0), 20, 96);
  const temporal = clamp(40 + (measuredFps - 8) * 2.4, 18, 97);
  const document = 78;

  return {
    injection: Math.round(injection),
    replay: Math.round(replay),
    liveness: Math.round(liveness),
    lighting: Math.round(lighting),
    temporal: Math.round(temporal),
    document: Math.round(document),
  };
}

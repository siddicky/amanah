import { DETECTOR_ORDER } from "./types.ts";
import { decorateAssessment } from "./scoring.ts";
import type { Assessment, CaptureMode, ScenarioId, TenantId } from "./types.ts";

type PayloadV1 = {
  v: 1;
  i: string;
  t: TenantId;
  s: ScenarioId;
  m: 0 | 1;
  o: number;
  a: number;
  c: string;
  d: number[];
};

const TENANTS: TenantId[] = ["wallet", "bank", "telco"];
const SCENARIOS: ScenarioId[] = ["inclusion-field", "lab-control", "hostile-channel"];

function b64urlEncode(s: string): string {
  const bytes = new TextEncoder().encode(s);
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  const b64 = btoa(bin);
  return b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function b64urlDecode(s: string): string {
  const pad = s.length % 4 === 0 ? "" : "=".repeat(4 - (s.length % 4));
  const b64 = s.replace(/-/g, "+").replace(/_/g, "/") + pad;
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return new TextDecoder().decode(bytes);
}

export function encodeAssessment(a: Assessment): string {
  const payload: PayloadV1 = {
    v: 1,
    i: a.id,
    t: a.tenantId,
    s: a.scenarioId,
    m: a.mode === "live" ? 1 : 0,
    o: a.overall,
    a: a.at,
    c: (a.cameraLabel ?? "").slice(0, 48),
    d: DETECTOR_ORDER.map((id) => a.detectors.find((x) => x.id === id)?.score ?? 0),
  };
  return b64urlEncode(JSON.stringify(payload));
}

export function decodeAssessment(token: string): Assessment | null {
  try {
    const raw = JSON.parse(b64urlDecode(token)) as Partial<PayloadV1>;
    if (raw.v !== 1) return null;
    if (!raw.i || !TENANTS.includes(raw.t as TenantId)) return null;
    if (!SCENARIOS.includes(raw.s as ScenarioId)) return null;
    if (!Array.isArray(raw.d) || raw.d.length !== DETECTOR_ORDER.length) return null;
    const scores = raw.d.map((n) => {
      const v = Number(n);
      if (!Number.isFinite(v)) throw new Error("bad score");
      return Math.round(Math.min(100, Math.max(0, v)));
    });
    const mode: CaptureMode = raw.m === 1 ? "live" : "simulated";
    return decorateAssessment({
      id: String(raw.i).slice(0, 40),
      at: Number(raw.a) || Date.now(),
      scenarioId: raw.s as ScenarioId,
      mode,
      tenantId: raw.t as TenantId,
      cameraLabel: raw.c ? String(raw.c).slice(0, 48) : null,
      scores,
    });
  } catch {
    return null;
  }
}

export function sharePath(a: Assessment): string {
  return `/report?s=${encodeAssessment(a)}`;
}

export type Lang = "en" | "ur";

export type DetectorId =
  | "injection"
  | "replay"
  | "lighting"
  | "temporal"
  | "document"
  | "liveness";

export const DETECTOR_ORDER: DetectorId[] = [
  "injection",
  "replay",
  "liveness",
  "lighting",
  "temporal",
  "document",
];

export type Band = "strong" | "watch" | "fail";

export type TenantId = "wallet" | "bank" | "telco";

export type Finding = {
  detector: DetectorId;
  severity: Band;
  title: string;
  detail: string;
};

export type DetectorResult = {
  id: DetectorId;
  score: number;
  confidence: number;
  band: Band;
  summary: string;
  recommendation: string;
};

export type ScenarioId = "inclusion-field" | "lab-control" | "hostile-channel";

export type CaptureMode = "simulated" | "live";

export type LiveDiagnostics = {
  fps: number;
  samples: number;
  virtual: boolean;
  duplicateRatio: number;
  periodicity: number;
};

export type Assessment = {
  id: string;
  at: number;
  scenarioId: ScenarioId;
  mode: CaptureMode;
  tenant: string;
  tenantId: TenantId;
  overall: number;
  band: Band;
  detectors: DetectorResult[];
  findings: Finding[];
  notes: string[];
  cameraLabel: string | null;
  diagnostics?: LiveDiagnostics;
};

export type Scenario = {
  id: ScenarioId;
  weight: Partial<Record<DetectorId, number>>;
};

import type { DetectorId, TenantId } from "./types.ts";

export const TENANT_ORDER: TenantId[] = ["wallet", "bank", "telco"];

export type TenantPolicy = {
  id: TenantId;
  weights: Record<DetectorId, number>;
  failClosed: DetectorId[];
};

export const TENANT_POLICY: Record<TenantId, TenantPolicy> = {
  wallet: {
    id: "wallet",
    weights: {
      injection: 0.25,
      replay: 0.18,
      liveness: 0.17,
      lighting: 0.12,
      temporal: 0.13,
      document: 0.15,
    },
    failClosed: ["injection"],
  },
  bank: {
    id: "bank",
    weights: {
      injection: 0.28,
      replay: 0.2,
      liveness: 0.16,
      lighting: 0.08,
      temporal: 0.12,
      document: 0.16,
    },
    failClosed: ["injection", "replay", "document"],
  },
  telco: {
    id: "telco",
    weights: {
      injection: 0.22,
      replay: 0.16,
      liveness: 0.18,
      lighting: 0.14,
      temporal: 0.14,
      document: 0.16,
    },
    failClosed: ["injection"],
  },
};

export function tenantOf(id: TenantId | null | undefined): TenantPolicy {
  return TENANT_POLICY[id ?? "wallet"] ?? TENANT_POLICY.wallet;
}

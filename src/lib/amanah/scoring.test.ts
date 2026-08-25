import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { DETECTOR_ORDER } from "./types.ts";
import { TENANT_POLICY } from "./policy.ts";
import { bandOf, decorateAssessment } from "./scoring.ts";

const FIELD = [94, 81, 84, 57, 88, 90];
const HOSTILE = [28, 46, 41, 71, 38, 64];

function from(scores: number[], tenantId: "wallet" | "bank" | "telco" = "wallet") {
  return decorateAssessment({
    id: "t",
    at: 1,
    scenarioId: "inclusion-field",
    mode: "simulated",
    tenantId,
    cameraLabel: null,
    scores,
  });
}

describe("tenant weights", () => {
  it("sum to 1 for every policy", () => {
    for (const p of Object.values(TENANT_POLICY)) {
      const sum = Object.values(p.weights).reduce((a, b) => a + b, 0);
      assert.ok(Math.abs(sum - 1) < 1e-9, `${p.id} weights ${sum}`);
    }
  });

  it("scores the field capture at 84 on wallet policy", () => {
    const a = from(FIELD, "wallet");
    assert.equal(a.overall, 84);
    assert.equal(a.band, "strong");
    assert.equal(a.detectors.find((d) => d.id === "lighting")?.band, "watch");
  });

  it("lets a bank absorb weak lighting without lowering injection", () => {
    const wallet = from(FIELD, "wallet");
    const bank = from(FIELD, "bank");
    assert.ok(bank.overall >= wallet.overall);
    assert.equal(bank.detectors.find((d) => d.id === "injection")?.score, 94);
  });
});

describe("fail-closed override", () => {
  it("caps overall below Hold when injection fails, even if other detectors are high", () => {
    const scores = DETECTOR_ORDER.map((id) => (id === "injection" ? 48 : 92));
    const a = from(scores, "wallet");
    assert.equal(a.detectors.find((d) => d.id === "injection")?.band, "fail");
    assert.equal(a.band, "fail");
    assert.ok(a.overall < 50);
  });

  it("fails a hostile channel on every tenant", () => {
    for (const tenantId of ["wallet", "bank", "telco"] as const) {
      const a = decorateAssessment({
        id: "h",
        at: 1,
        scenarioId: "hostile-channel",
        mode: "simulated",
        tenantId,
        cameraLabel: "OBS Virtual Camera",
        scores: HOSTILE,
      });
      assert.equal(a.band, "fail", tenantId);
      assert.ok(a.overall < 50, tenantId);
    }
  });
});

describe("bands", () => {
  it("cuts at 50 and 75", () => {
    assert.equal(bandOf(49), "fail");
    assert.equal(bandOf(50), "watch");
    assert.equal(bandOf(74), "watch");
    assert.equal(bandOf(75), "strong");
  });
});

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { decorateAssessment } from "./scoring.ts";
import { decodeAssessment, encodeAssessment } from "./share.ts";

describe("share tokens", () => {
  it("round-trips a field assessment", () => {
    const a = decorateAssessment({
      id: "seed-noor-field",
      at: 1_700_000_000_000,
      scenarioId: "inclusion-field",
      mode: "simulated",
      tenantId: "wallet",
      cameraLabel: null,
      scores: [94, 81, 84, 57, 88, 90],
    });
    const token = encodeAssessment(a);
    const back = decodeAssessment(token);
    assert.ok(back);
    assert.equal(back.overall, a.overall);
    assert.equal(back.tenantId, "wallet");
    assert.equal(back.scenarioId, "inclusion-field");
    assert.equal(back.detectors[0].score, 94);
    assert.equal(back.band, "strong");
  });

  it("rejects junk", () => {
    assert.equal(decodeAssessment("not-a-token"), null);
    assert.equal(decodeAssessment(""), null);
  });
});

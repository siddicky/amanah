import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  anyVirtual,
  autocorrPeak,
  duplicateRatio,
  isVirtualLabel,
  liveOverridesFromSession,
  type FrameSample,
} from "./live.ts";

function frames(n: number, motion: number, mean = 110): FrameSample[] {
  return Array.from({ length: n }, (_, i) => ({
    t: i * 40,
    mean: mean + Math.sin(i / 7) * 4,
    variance: 40,
    motion,
  }));
}

describe("virtual device labels", () => {
  it("flags known virtual cameras and ignores a phone sensor", () => {
    assert.equal(isVirtualLabel("OBS Virtual Camera"), true);
    assert.equal(isVirtualLabel("ManyCam Virtual Webcam"), true);
    assert.equal(isVirtualLabel("v4l2loopback"), true);
    assert.equal(isVirtualLabel("FaceTime HD Camera"), false);
    assert.equal(isVirtualLabel(""), false);
    assert.equal(anyVirtual(["HD WebCam", "OBS Virtual Camera"]), true);
  });
});

describe("live session scoring", () => {
  it("fails closed on a virtual camera even with lively frames", () => {
    const { scores, diagnostics } = liveOverridesFromSession(
      frames(24, 18),
      "OBS Virtual Camera",
      28,
    );
    assert.equal(diagnostics.virtual, true);
    assert.ok((scores.injection ?? 100) < 50);
  });

  it("penalises a still / printed-photo capture", () => {
    const still = frames(24, 0.2, 90);
    const { scores } = liveOverridesFromSession(still, "FaceTime HD Camera", 24);
    assert.ok((scores.replay ?? 100) < 50);
    assert.ok((scores.liveness ?? 100) < 55);
  });

  it("holds a native, moving, well-lit capture", () => {
    const live = Array.from({ length: 30 }, (_, i) => ({
      t: i * 33 + (i % 3) * 0.7,
      mean: 118 + Math.sin(i * 0.41) * 6 + (i % 7) * 0.4,
      variance: 52 + (i % 5),
      motion: 9 + ((i * 5) % 11) * 0.6 + Math.sin(i * 0.73) * 2,
    }));
    const { scores, diagnostics } = liveOverridesFromSession(
      live,
      "FaceTime HD Camera",
      30,
    );
    assert.equal(diagnostics.virtual, false);
    assert.ok((scores.injection ?? 0) >= 85);
    assert.ok((scores.replay ?? 0) >= 70);
    assert.ok((scores.liveness ?? 0) >= 65);
    assert.ok((scores.temporal ?? 0) >= 70);
  });

  it("is conservative when the sample window is too short", () => {
    const { scores } = liveOverridesFromSession(frames(3, 10), "FaceTime HD Camera", 12);
    assert.equal(scores.liveness, 48);
    assert.equal(scores.replay, 50);
  });
});

describe("signal helpers", () => {
  it("treats a flat motion trace as duplicated", () => {
    assert.ok(duplicateRatio(Array(20).fill(0.2)) > 0.9);
    assert.ok(duplicateRatio(Array(20).fill(8)) < 0.1);
  });

  it("detects a looping motion pattern", () => {
    const loop = Array.from({ length: 40 }, (_, i) => (i % 8 < 4 ? 12 : 2));
    assert.ok(autocorrPeak(loop) > 0.3);
  });
});

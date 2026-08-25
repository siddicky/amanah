import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { ScanStage } from "@/components/scan-stage";
import { Button } from "@/components/ui/button";
import { copy, DETECTOR_ORDER } from "@/lib/amanah/copy";
import { liveOverridesFromSession, sampleFrame, type FrameSample } from "@/lib/amanah/live";
import { scoreAssessment } from "@/lib/amanah/scoring";
import { useAmanah } from "@/lib/amanah/store";
import type { ScenarioId } from "@/lib/amanah/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/assess")({ component: Assess });

const SCENARIOS: ScenarioId[] = ["inclusion-field", "lab-control", "hostile-channel"];

function Assess() {
  const lang = useAmanah((s) => s.lang);
  const scenarioId = useAmanah((s) => s.scenarioId);
  const setScenario = useAmanah((s) => s.setScenario);
  const mode = useAmanah((s) => s.mode);
  const setMode = useAmanah((s) => s.setMode);
  const commit = useAmanah((s) => s.commit);
  const t = copy[lang];
  const nav = useNavigate();

  const [running, setRunning] = useState(false);
  const [step, setStep] = useState(0);
  const [notice, setNotice] = useState<string | null>(null);
  const [hasVideo, setHasVideo] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const samplesRef = useRef<FrameSample[]>([]);
  const prevPixels = useRef<Uint8ClampedArray | null>(null);
  const fpsRef = useRef(0);
  const modeRef = useRef(mode);
  modeRef.current = mode;

  function stopStream() {
    streamRef.current?.getTracks().forEach((tr) => tr.stop());
    streamRef.current = null;
    videoRef.current = null;
    setHasVideo(false);
  }

  useEffect(() => {
    return () => stopStream();
  }, []);

  async function startLive(): Promise<boolean> {
    setNotice(null);
    if (!navigator.mediaDevices?.getUserMedia) {
      setNotice(t.noCam);
      setMode("simulated");
      return false;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 640 }, height: { ideal: 480 } },
        audio: false,
      });
      streamRef.current = stream;
      const v = document.createElement("video");
      v.srcObject = stream;
      v.muted = true;
      v.playsInline = true;
      await v.play();
      videoRef.current = v;
      setHasVideo(true);
      return true;
    } catch {
      setNotice(t.camDenied);
      setMode("simulated");
      return false;
    }
  }

  async function run() {
    setRunning(true);
    setStep(0);
    samplesRef.current = [];
    prevPixels.current = null;

    let usedLive = modeRef.current === "live";
    if (usedLive && !videoRef.current) {
      usedLive = await startLive();
    }

    const started = performance.now();
    let frames = 0;
    const canvas = document.createElement("canvas");
    canvas.width = 160;
    canvas.height = 120;
    const ctx = canvas.getContext("2d");
    const duration = 8000;
    const t0 = performance.now();

    await new Promise<void>((resolve) => {
      const loop = () => {
        const v = videoRef.current;
        if (usedLive && v && ctx && v.readyState >= 2) {
          ctx.drawImage(v, 0, 0, 160, 120);
          const { stats, pixels } = sampleFrame(ctx, 160, 120, prevPixels.current);
          prevPixels.current = pixels;
          samplesRef.current.push(stats);
          frames += 1;
          const elapsed = (performance.now() - started) / 1000;
          fpsRef.current = frames / Math.max(elapsed, 0.2);
        }
        const p = Math.min(1, (performance.now() - t0) / duration);
        setStep(Math.min(DETECTOR_ORDER.length - 1, Math.floor(p * DETECTOR_ORDER.length)));
        if (p < 1) requestAnimationFrame(loop);
        else resolve();
      };
      requestAnimationFrame(loop);
    });

    const label = streamRef.current?.getVideoTracks()[0]?.label ?? null;
    const liveOk = usedLive && samplesRef.current.length > 4;
    const overrides = liveOk
      ? liveOverridesFromSession(samplesRef.current, label, fpsRef.current)
      : undefined;

    const assessment = scoreAssessment({
      scenarioId,
      mode: liveOk ? "live" : "simulated",
      cameraLabel: label,
      liveOverrides: overrides,
    });
    commit(assessment);
    stopStream();
    setRunning(false);
    void nav({ to: "/report" });
  }

  const progress = running ? (step + 1) / DETECTOR_ORDER.length : 0;

  return (
    <div className="space-y-7">
      <header>
        <p className="text-[11px] uppercase tracking-[0.2em] text-muted">{t.assess}</p>
        <h1 className="mt-2 font-display text-3xl tracking-tight">{t.suiteHint}</h1>
      </header>

      <div className="grid gap-3">
        {SCENARIOS.map((id) => {
          const s = t.scenarios[id];
          const on = scenarioId === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => setScenario(id)}
              className={cn(
                "rounded-lg p-4 text-start shadow-[var(--shadow-border)] transition-opacity",
                on ? "bg-raised" : "bg-surface opacity-80 hover:opacity-100",
              )}
            >
              <p className="text-[11px] uppercase tracking-[0.16em] text-muted">{s.context}</p>
              <p className="mt-1 font-medium">{s.name}</p>
              <p className="mt-1 text-sm text-muted">{s.blurb}</p>
            </button>
          );
        })}
      </div>

      <div className="flex gap-1 rounded-sm bg-raised p-0.5">
        {(["simulated", "live"] as const).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => {
              setMode(m);
              if (m === "live") void startLive();
              else stopStream();
            }}
            className={cn(
              "h-10 flex-1 rounded-xs text-sm",
              mode === m ? "bg-primary text-primary-fg" : "text-muted",
            )}
          >
            {m === "live" ? t.modeLive : t.modeSim}
          </button>
        ))}
      </div>

      {mode === "live" ? <p className="text-xs text-muted">{t.liveHint}</p> : null}
      {notice ? <p className="text-sm text-watch">{notice}</p> : null}

      <ScanStage running={running || hasVideo} progress={progress} video={videoRef.current} />

      {running ? (
        <div>
          <p className="text-[11px] uppercase tracking-[0.18em] text-muted">{t.scanning}</p>
          <p className="mt-2 font-display text-2xl">{t.detectors[DETECTOR_ORDER[step]].name}</p>
          <div className="mt-3 h-px bg-border">
            <div className="h-px bg-primary" style={{ width: `${progress * 100}%` }} />
          </div>
        </div>
      ) : (
        <Button className="w-full" size="lg" onClick={() => void run()}>
          {mode === "live" ? t.beginLive : t.begin}
        </Button>
      )}
    </div>
  );
}

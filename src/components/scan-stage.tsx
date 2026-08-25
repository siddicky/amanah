import { useEffect, useRef } from "react";

export function ScanStage({
  running,
  progress,
  video,
}: {
  running: boolean;
  progress: number;
  video: HTMLVideoElement | null;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const raf = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const styles = getComputedStyle(canvas);
    const raised = styles.getPropertyValue("--color-raised").trim() || "#1a201c";
    const sage = styles.getPropertyValue("--color-primary").trim() || "#b4c8b5";
    const fg = styles.getPropertyValue("--color-fg").trim() || "#e7ece6";

    const draw = (t: number) => {
      const w = canvas.width;
      const h = canvas.height;
      ctx.fillStyle = raised;
      ctx.fillRect(0, 0, w, h);

      if (video && video.readyState >= 2) {
        ctx.save();
        ctx.translate(w, 0);
        ctx.scale(-1, 1);
        ctx.globalAlpha = 0.72;
        ctx.drawImage(video, 0, 0, w, h);
        ctx.restore();
        ctx.fillStyle = "rgba(12,14,13,0.35)";
        ctx.fillRect(0, 0, w, h);
      }

      const cx = w / 2;
      const cy = h / 2;

      ctx.strokeStyle = "rgba(184,196,182,0.18)";
      ctx.lineWidth = 1;
      for (let x = 40; x < w; x += 40) {
        ctx.beginPath();
        ctx.moveTo(x, 16);
        ctx.lineTo(x, h - 16);
        ctx.stroke();
      }
      for (let y = 24; y < h; y += 40) {
        ctx.beginPath();
        ctx.moveTo(16, y);
        ctx.lineTo(w - 16, y);
        ctx.stroke();
      }

      ctx.strokeStyle = sage;
      ctx.globalAlpha = 0.35;
      ctx.lineWidth = 1.25;
      for (let i = 1; i <= 4; i++) {
        ctx.beginPath();
        ctx.arc(cx, cy, 26 * i + 8, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;

      ctx.beginPath();
      ctx.strokeStyle = "rgba(232,235,230,0.2)";
      ctx.moveTo(cx, 28);
      ctx.lineTo(cx, h - 28);
      ctx.moveTo(48, cy);
      ctx.lineTo(w - 48, cy);
      ctx.stroke();

      const sweep = reduce ? progress * Math.PI * 2 : (t / 1100) % (Math.PI * 2);
      ctx.beginPath();
      ctx.strokeStyle = sage;
      ctx.lineWidth = 2;
      ctx.arc(cx, cy, 118, sweep - 0.55, sweep);
      ctx.stroke();
      ctx.beginPath();
      ctx.fillStyle = sage;
      ctx.arc(cx + Math.cos(sweep) * 118, cy + Math.sin(sweep) * 118, 3.2, 0, Math.PI * 2);
      ctx.fill();

      if (running) {
        const y = 28 + ((t / 8) % (h - 56));
        ctx.fillStyle = sage;
        ctx.globalAlpha = 0.85;
        ctx.fillRect(28, y, w - 56, 1.5);
        ctx.globalAlpha = 1;
      }

      ctx.strokeStyle = fg;
      ctx.globalAlpha = 0.16;
      ctx.lineWidth = 1;
      ctx.strokeRect(14, 14, w - 28, h - 28);
      ctx.globalAlpha = 1;

      raf.current = requestAnimationFrame(draw);
    };

    raf.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf.current);
  }, [running, progress, video]);

  return (
    <canvas
      ref={canvasRef}
      width={720}
      height={400}
      className="h-[200px] w-full rounded-lg bg-raised shadow-[var(--shadow-border)] sm:h-[260px]"
    />
  );
}

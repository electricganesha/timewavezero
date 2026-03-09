import React, { useEffect, useRef, useCallback } from "react";
import { t, ZERO_DATE } from "../engine/timewaveEngine";

const createDate = (year: number, month: number, day: number): number => {
  const d = new Date(Date.UTC(year, month - 1, day));
  d.setUTCFullYear(year);
  return d.getTime();
};

const YEAR_MS = 31556952000;

const MAJOR_EVENTS = [
  { label: "Big Bang", time: -22e9 * YEAR_MS },
  { label: "Accretion of Moon", time: -7e9 * YEAR_MS },
  { label: "Cambrian Explosion", time: -541e6 * YEAR_MS },
  { label: "KT Extinction (Dinosaurs)", time: -65e6 * YEAR_MS },
  { label: "Homo Sapiens Ancestors", time: -10e6 * YEAR_MS },
  { label: "Human behaviors/tech", time: -50000 * YEAR_MS },
  { label: "End of glaciers", time: -17000 * YEAR_MS },
  { label: "Building of Great Pyramid", time: createDate(-2790, 1, 1) },
  { label: "Golden Age of Greece / Buddha", time: createDate(-500, 1, 1) },
  { label: "Roman Empire Founded", time: createDate(-27, 1, 16) },
  { label: "Crucifixion of Christ", time: createDate(33, 4, 3) },
  { label: "Fall of Han Dynasty", time: createDate(220, 1, 1) },
  { label: "Fall of Roman Empire", time: createDate(476, 9, 4) },
  { label: "Birth of Prophet Mohammed", time: createDate(570, 1, 1) },
  { label: "First Crusade", time: createDate(1095, 11, 27) },
  { label: "Black Death Peak", time: createDate(1347, 6, 1) },
  { label: "Discovery of New World", time: createDate(1492, 10, 12) },
  { label: "American Revolution", time: createDate(1776, 7, 4) },
  { label: "French Revolution", time: createDate(1789, 7, 14) },
  { label: "WWI Begins", time: createDate(1914, 7, 28) },
  { label: "Stock Exchange Crash", time: createDate(1929, 10, 29) },
  { label: "WWII Begins", time: createDate(1939, 9, 1) },
  { label: "Hiroshima", time: createDate(1945, 8, 6) },
  { label: "DNA Double Helix", time: createDate(1953, 4, 25) },
  { label: "The 1960s Turning Point", time: createDate(1960, 1, 1) },
  { label: "Moon Landing", time: createDate(1969, 7, 20) },
  { label: "Murder of Anwar Sadat", time: createDate(1981, 10, 6) },
  { label: "Invention of WWW", time: createDate(1989, 3, 12) },
  { label: "9/11 Attacks", time: createDate(2001, 9, 11) },
  { label: "Timewave Zero Point", time: createDate(2012, 12, 21) },
];

const formatTimelineDate = (timeMs: number): string => {
  const yearsOffset = timeMs / YEAR_MS;
  const year = 1970 + yearsOffset;

  if (year <= -1e9) {
    return `${Math.abs(year / 1e9).toFixed(1)} Billion Yrs Ago`;
  }
  if (year <= -1e6) {
    return `${Math.abs(year / 1e6).toFixed(1)} Million Yrs Ago`;
  }
  if (year <= -10000) {
    return `${Math.abs(year).toLocaleString(undefined, { maximumFractionDigits: 0 })} Yrs Ago`;
  }

  const d = new Date(timeMs);
  if (isNaN(d.getTime())) {
    return `${Math.abs(year).toLocaleString(undefined, { maximumFractionDigits: 0 })} Yrs Ago`;
  }

  const y = d.getUTCFullYear();
  if (y < 0) return `${Math.abs(y)} BC`;
  return (
    d.toLocaleDateString() +
    " " +
    d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  );
};

interface NoveltyChartProps {
  startTime: number;
  endTime: number;
  onHoverValue?: (val: number | null) => void;
}

const NoveltyChartComponent: React.FC<NoveltyChartProps> = ({
  startTime,
  endTime,
  onHoverValue,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [mousePos, setMousePos] = React.useState<{
    x: number;
    y: number;
  } | null>(null);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Get actual pixel dimensions from container
    const rect = container.getBoundingClientRect();
    const width = Math.floor(rect.width);
    const height = Math.floor(rect.height);

    if (width <= 0 || height <= 0) return;

    // Sync buffer size with display size
    const dpr = window.devicePixelRatio || 1;
    if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.scale(dpr, dpr);
    }

    const timeRange = endTime - startTime;

    // Sampling
    const steps = Math.min(width, 1440);
    const points: { x: number; val: number }[] = [];
    let maxY = 0;

    for (let i = 0; i <= steps; i++) {
      const timeAtPoint = startTime + (i / steps) * timeRange;
      const x = (ZERO_DATE.getTime() - timeAtPoint) / 86400000;
      const val = t(x);
      points.push({ x: i, val });
      if (val > maxY) maxY = val;
    }

    ctx.clearRect(0, 0, width, height);

    const padding = 40;
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;
    const scaleY = maxY > 0 ? chartHeight / maxY : 1;

    // Grid
    ctx.strokeStyle = "#1a1a1a";
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let i = 0; i <= 5; i++) {
      const y = padding + (i / 5) * chartHeight;
      ctx.moveTo(padding, y);
      ctx.lineTo(width - padding, y);
    }
    ctx.stroke();

    // Wave
    ctx.shadowBlur = 10;
    ctx.shadowColor = "#00f2ff55";
    ctx.strokeStyle = "#00f2ff";
    ctx.lineWidth = 2;
    ctx.lineJoin = "round";
    ctx.beginPath();

    points.forEach((p, i) => {
      const xPos = padding + (p.x / steps) * chartWidth;
      const yPos = height - padding - p.val * scaleY;
      if (i === 0) ctx.moveTo(xPos, yPos);
      else ctx.lineTo(xPos, yPos);
    });
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Major Events
    let lastLabelX = -999;
    MAJOR_EVENTS.forEach((ev) => {
      if (ev.time >= startTime && ev.time <= endTime) {
        const xPos = padding + ((ev.time - startTime) / timeRange) * chartWidth;

        // Draw vertical dotted line
        ctx.strokeStyle = "rgba(255, 0, 251, 0.36)";
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(xPos, padding);
        ctx.lineTo(xPos, height - padding);
        ctx.stroke();
        ctx.setLineDash([]);

        // Ensure labels don't bunch up completely
        if (xPos - lastLabelX > 16) {
          ctx.save();
          ctx.translate(xPos - 5, padding + 10);
          ctx.rotate(-Math.PI / 2);
          ctx.fillStyle = "hotpink";
          ctx.font = "10px JetBrains Mono";
          ctx.textAlign = "right";
          ctx.fillText(ev.label, 0, 0);
          ctx.restore();
          lastLabelX = xPos;
        }
      }
    });

    // Vertical marker and tooltip
    if (mousePos && mousePos.x >= padding && mousePos.x <= width - padding) {
      const xRelative = (mousePos.x - padding) / chartWidth;
      const hoveredTime = startTime + xRelative * timeRange;
      const x = (ZERO_DATE.getTime() - hoveredTime) / 86400000;
      const hoveredVal = t(x);
      const hoveredY = height - padding - hoveredVal * scaleY;

      ctx.strokeStyle = "#ffffff22";
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.moveTo(mousePos.x, padding);
      ctx.lineTo(mousePos.x, height - padding);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = "#ffffff";
      ctx.shadowBlur = 10;
      ctx.shadowColor = "#ffffff";
      ctx.beginPath();
      ctx.arc(mousePos.x, hoveredY, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      const tooltipW = 160;
      const tooltipH = 50;
      let tx = mousePos.x + 10;
      let ty = hoveredY - 60;
      if (tx + tooltipW > width) tx = mousePos.x - tooltipW - 10;
      if (ty < 10) ty = hoveredY + 20;

      ctx.fillStyle = "rgba(10, 10, 10, 0.9)";
      ctx.strokeStyle = "#333";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(tx, ty, tooltipW, tooltipH, 8);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = "#fff";
      ctx.font = "bold 10px Inter";
      ctx.fillText(formatTimelineDate(hoveredTime), tx + 10, ty + 20);
      ctx.fillStyle = "#00f2ff";
      ctx.font = "12px JetBrains Mono";
      ctx.fillText(`Novelty: ${hoveredVal.toFixed(6)}`, tx + 10, ty + 40);
    }

    // Labels
    ctx.font = "10px JetBrains Mono";

    if (mousePos && mousePos.x >= padding && mousePos.x <= width - padding) {
      const xRelative = (mousePos.x - padding) / chartWidth;
      const hoveredTime = startTime + xRelative * timeRange;
      const x = (ZERO_DATE.getTime() - hoveredTime) / 86400000;
      const hoveredVal = t(x);

      ctx.fillStyle = "#00f2ff";
      ctx.fillText(
        `NOVELTY INDEX: ${hoveredVal.toFixed(6)}`,
        padding,
        padding - 10,
      );

      if (onHoverValue) onHoverValue(hoveredVal);
    } else {
      ctx.fillStyle = "#444";
      ctx.fillText("NOVELTY INDEX", padding, padding - 10);
      if (onHoverValue) onHoverValue(null);
    }

    ctx.fillStyle = "#444";
    ctx.fillText("TIME PROGRESSION", padding, height - padding + 15);
  }, [startTime, endTime, mousePos, onHoverValue]);

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setMousePos({ x, y });
  };

  const handleMouseLeave = () => {
    setMousePos(null);
  };

  useEffect(() => {
    const update = () => draw();
    // Simplified resize observation
    const observer = new ResizeObserver(() => requestAnimationFrame(update));
    if (containerRef.current) observer.observe(containerRef.current);
    update();
    return () => observer.disconnect();
  }, [draw]);

  return (
    <div
      ref={containerRef}
      style={{
        position: "absolute",
        inset: 0,
        backgroundColor: "#050505",
        overflow: "hidden",
      }}
    >
      <canvas
        ref={canvasRef}
        style={{ display: "block", width: "100%", height: "100%" }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      />
      <div
        style={{
          position: "absolute",
          top: "16px",
          right: "16px",
          pointerEvents: "none",
          fontSize: "10px",
          fontFamily: "JetBrains Mono",
          color: "#333",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-end",
          textTransform: "uppercase",
          letterSpacing: "0.1em",
          gap: "4px",
        }}
      >
        <span>
          FRACTAL_SCALE: 64<sup>i</sup>
        </span>
        <span>ZERO_POINT: 2012-12-21</span>
      </div>
    </div>
  );
};

export const NoveltyChart = React.memo(NoveltyChartComponent);

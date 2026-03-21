import React, { useEffect, useRef, useCallback, useMemo } from "react";
import { t, ZERO_DATE } from "../engine/timewaveEngine";
import { MAJOR_EVENTS, YEAR_MS } from "../engine/timewaveConstants";

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
  onClickDate?: (date: Date) => void;
  theme: "dark" | "light";
  isArchaeologistActive?: boolean;
  archaeologistDate?: Date;
  echoDates?: Date[];
}

const NoveltyChartComponent: React.FC<NoveltyChartProps> = ({
  startTime,
  endTime,
  onHoverValue,
  onClickDate,
  theme,
  isArchaeologistActive,
  archaeologistDate,
  echoDates,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Theme-aware color configuration
  const colors = useMemo(
    () => ({
      grid: theme === "dark" ? "#1a1a1a" : "#f0f0f2",
      wave: theme === "dark" ? "#00f2ff" : "#0066cc",
      waveGlow: theme === "dark" ? "#00f2ff55" : "transparent",
      eventLine:
        theme === "dark" ? "rgba(255, 0, 251, 0.36)" : "rgba(191, 0, 176, 0.25)",
      eventLabel: theme === "dark" ? "hotpink" : "#bf00b0",
      marker: theme === "dark" ? "#ffffff" : "#000000",
      markerLine: theme === "dark" ? "#ffffff22" : "#00000022",
      tooltipBg:
        theme === "dark"
          ? "rgba(10, 10, 10, 0.9)"
          : "rgba(255, 255, 255, 0.98)",
      tooltipBorder: theme === "dark" ? "#333" : "#ddd",
      tooltipText: theme === "dark" ? "#fff" : "#1a1a1c",
      labelMuted: theme === "dark" ? "#444" : "#88888b",
      metaText: theme === "dark" ? "#333" : "#88888b",
    }),
    [theme],
  );

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
    ctx.strokeStyle = colors.grid;
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let i = 0; i <= 5; i++) {
      const y = padding + (i / 5) * chartHeight;
      ctx.moveTo(padding, y);
      ctx.lineTo(width - padding, y);
    }
    ctx.stroke();

    // Wave
    ctx.shadowBlur = theme === "dark" ? 10 : 0;
    ctx.shadowColor = colors.waveGlow;
    ctx.strokeStyle = colors.wave;
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
        ctx.strokeStyle = colors.eventLine;
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
          ctx.fillStyle = colors.eventLabel;
          ctx.font = "10px JetBrains Mono";
          ctx.textAlign = "right";
          ctx.fillText(ev.label, 0, 0);
          ctx.restore();
          lastLabelX = xPos;
        }
      }
    });

    // Vertical marker and tooltip (Hover)
    if (mousePos && mousePos.x >= padding && mousePos.x <= width - padding) {
      const xRelative = (mousePos.x - padding) / chartWidth;
      const hoveredTime = startTime + xRelative * timeRange;
      const xVal = (ZERO_DATE.getTime() - hoveredTime) / 86400000;
      const hoveredVal = t(xVal);
      const hoveredY = height - padding - hoveredVal * scaleY;

      ctx.strokeStyle = colors.markerLine;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.moveTo(mousePos.x, padding);
      ctx.lineTo(mousePos.x, height - padding);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = colors.marker;
      ctx.shadowBlur = theme === "dark" ? 10 : 0;
      ctx.shadowColor = colors.marker;
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

      ctx.fillStyle = colors.tooltipBg;
      ctx.strokeStyle = colors.tooltipBorder;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(tx, ty, tooltipW, tooltipH, 8);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = colors.tooltipText;
      ctx.font = "bold 10px Inter";
      ctx.fillText(formatTimelineDate(hoveredTime), tx + 10, ty + 20);
      ctx.fillStyle = colors.wave;
      ctx.font = "12px JetBrains Mono";
      ctx.fillText(`Novelty: ${hoveredVal.toFixed(6)}`, tx + 10, ty + 40);

      if (onHoverValue) onHoverValue(hoveredVal);
    } else if (onHoverValue) {
      onHoverValue(null);
    }

    // Fractal Resonance Visualization (Rhymes)
    if (isArchaeologistActive && archaeologistDate) {
      const allPoints = [archaeologistDate, ...(echoDates || [])];
      const pointPositions: { x: number; y: number; time: number }[] = [];

      allPoints.forEach((date, i) => {
        const time = date.getTime();
        if (time >= startTime && time <= endTime) {
          const xPos = padding + ((time - startTime) / timeRange) * chartWidth;
          const xVal = (ZERO_DATE.getTime() - time) / 86400000;
          const val = t(xVal);
          const yPos = height - padding - val * scaleY;
          pointPositions.push({ x: xPos, y: yPos, time });

          // Vertical line
          ctx.strokeStyle = i === 0 ? "#00f2ff" : i === 1 ? "#ff00fb" : "#7000ff";
          ctx.setLineDash([2, 4]);
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(xPos, padding);
          ctx.lineTo(xPos, height - padding);
          ctx.stroke();
          ctx.setLineDash([]);

          // Glowing dot
          ctx.shadowBlur = 15;
          ctx.shadowColor = ctx.strokeStyle;
          ctx.fillStyle = ctx.strokeStyle;
          ctx.beginPath();
          ctx.arc(xPos, yPos, 6, 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowBlur = 0;

          // Label
          ctx.font = "bold 9px JetBrains Mono";
          ctx.fillText(i === 0 ? "PRIMARY" : `ECHO L${i}`, xPos + 8, yPos - 10);
        }
      });

      // Connecting Arcs between points
      if (pointPositions.length > 1) {
        ctx.setLineDash([]);
        for (let i = 0; i < pointPositions.length - 1; i++) {
          const p1 = pointPositions[i];
          const p2 = pointPositions[i + 1];
          
          ctx.strokeStyle = colors.wave;
          ctx.lineWidth = 2;
          ctx.globalAlpha = 0.5;
          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          // Quadratic curve for arc feel
          const cpX = (p1.x + p2.x) / 2;
          const cpY = Math.min(p1.y, p2.y) - Math.abs(p1.x - p2.x) * 0.2;
          ctx.quadraticCurveTo(cpX, cpY, p2.x, p2.y);
          ctx.stroke();
          ctx.globalAlpha = 1.0;
        }
      }
    }

    // Labels
    ctx.font = "10px JetBrains Mono";
    if (mousePos && mousePos.x >= padding && mousePos.x <= width - padding) {
      const xRelative = (mousePos.x - padding) / chartWidth;
      const hoveredTime = startTime + xRelative * timeRange;
      const xVal = (ZERO_DATE.getTime() - hoveredTime) / 86400000;
      const hoveredVal = t(xVal);
      ctx.fillStyle = colors.wave;
      ctx.fillText(`NOVELTY INDEX: ${hoveredVal.toFixed(6)}`, padding, padding - 10);
    } else {
      ctx.fillStyle = colors.labelMuted;
      ctx.fillText("NOVELTY INDEX", padding, padding - 10);
    }

    ctx.fillStyle = colors.labelMuted;
    ctx.fillText("TIME PROGRESSION", padding, height - padding + 15);
  }, [startTime, endTime, mousePos, onHoverValue, colors, theme, isArchaeologistActive, archaeologistDate, echoDates]);

  const handleCanvasClick = (e: React.MouseEvent) => {
    if (!onClickDate) return;
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    const x = e.clientX - rect.left;
    const padding = 40;
    const chartWidth = rect.width - padding * 2;
    
    if (x >= padding && x <= rect.width - padding) {
      const xRelative = (x - padding) / chartWidth;
      const clickedTime = startTime + xRelative * (endTime - startTime);
      onClickDate(new Date(clickedTime));
    }
  };

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
        backgroundColor: "var(--bg-color)",
        overflow: "hidden",
      }}
    >
      <canvas
        ref={canvasRef}
        style={{ display: "block", width: "100%", height: "100%" }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onClick={handleCanvasClick}
      />
      <div
        style={{
          position: "absolute",
          top: "16px",
          right: "16px",
          pointerEvents: "none",
          fontSize: "10px",
          fontFamily: "JetBrains Mono",
          color: "var(--meta-text, var(--text-very-muted))",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-end",
          textTransform: "uppercase",
          letterSpacing: "0.1em",
          gap: "4px",
        }}
      >
        <span>
          FRACTAL_SCALE: 64<sup>{Math.max(1, Math.round(Math.log((endTime - startTime) / 86400000 / 6) / Math.log(64)))}</sup>
        </span>
        <span>TERMINAL_SINGULARITY: 2012-12-21</span>
      </div>
    </div>
  );
};

export const NoveltyChart = React.memo(NoveltyChartComponent);
